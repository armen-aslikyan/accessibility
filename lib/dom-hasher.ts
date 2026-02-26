import { createHash } from 'crypto';
import { load } from 'cheerio';

export interface TemplateCluster {
  hash: string;
  urls: string[];
  representative: string;
}

export interface PageHashEntry {
  url: string;
  hash: string;
}

export interface DiffResult {
  unchanged: PageHashEntry[];
  changed: PageHashEntry[];
}

// Attributes to keep in the skeleton (semantically meaningful, not content-specific)
const KEEP_ATTRS = new Set(['role', 'type', 'aria-role', 'data-component', 'data-block']);

// Tags to skip entirely (non-structural)
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link', 'title']);

function extractSkeleton(html: string): string {
  const $ = load(html, { xmlMode: false });
  const parts: string[] = [];

  function walk(el: ReturnType<typeof $>[number]): void {
    if (!el || el.type === 'text' || el.type === 'comment') return;
    if (el.type !== 'tag') return;

    const tag = el.name?.toLowerCase() ?? '';
    if (SKIP_TAGS.has(tag)) return;

    const kept: string[] = [];
    for (const attr of KEEP_ATTRS) {
      const val = $(el).attr(attr);
      if (val) kept.push(`${attr}=${val}`);
    }

    // Keep BEM block from class (first segment before __)
    const cls = $(el).attr('class');
    if (cls) {
      const block = cls.trim().split(/\s+/)[0]?.split('__')[0]?.split('--')[0];
      if (block) kept.push(`class=${block}`);
    }

    parts.push(kept.length > 0 ? `<${tag} ${kept.join(' ')}>` : `<${tag}>`);

    for (const child of $(el).contents().toArray()) {
      walk(child as ReturnType<typeof $>[number]);
    }

    parts.push(`</${tag}>`);
  }

  const body = $('body');
  if (body.length) {
    for (const child of body.contents().toArray()) {
      walk(child as ReturnType<typeof $>[number]);
    }
  }

  return parts.join('');
}

export function computeStructuralHash(html: string): string {
  const skeleton = extractSkeleton(html);
  return createHash('sha256').update(skeleton).digest('hex');
}

// Compute the set of unique tag paths (e.g. "html>body>main>section>article") for Jaccard
function extractTagPaths(html: string): Set<string> {
  const $ = load(html, { xmlMode: false });
  const paths = new Set<string>();

  function walk(el: ReturnType<typeof $>[number], parentPath: string): void {
    if (!el || el.type !== 'tag') return;
    const tag = el.name?.toLowerCase() ?? '';
    if (SKIP_TAGS.has(tag)) return;

    const path = parentPath ? `${parentPath}>${tag}` : tag;
    paths.add(path);

    for (const child of $(el).contents().toArray()) {
      walk(child as ReturnType<typeof $>[number], path);
    }
  }

  for (const child of $('body').contents().toArray()) {
    walk(child as ReturnType<typeof $>[number], '');
  }

  return paths;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const x of a) {
    if (b.has(x)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Cluster pages: exact hash match first, then fuzzy Jaccard grouping
export function clusterPages(pages: PageHashEntry[]): TemplateCluster[] {
  const exactGroups = new Map<string, string[]>();

  for (const { url, hash } of pages) {
    const group = exactGroups.get(hash) ?? [];
    group.push(url);
    exactGroups.set(hash, group);
  }

  const clusters: TemplateCluster[] = [];
  for (const [hash, urls] of exactGroups) {
    clusters.push({ hash, urls, representative: urls[0] });
  }

  // Fuzzy merge: if two clusters have Jaccard >= 0.85, merge them
  // We skip this for large sets (>50 clusters) for performance
  if (clusters.length <= 50) {
    const merged = new Set<number>();
    for (let i = 0; i < clusters.length; i++) {
      if (merged.has(i)) continue;
      for (let j = i + 1; j < clusters.length; j++) {
        if (merged.has(j)) continue;
        // Re-parse skeleton paths from the representative URLs' hashes isn't possible
        // without HTML -- this merge step happens in run-site-audit.js where HTML is available
      }
    }
  }

  return clusters;
}

// Fuzzy cluster when HTML snapshots are available (called by orchestrator)
export function clusterPagesWithHtml(
  pages: Array<{ url: string; hash: string; html: string }>,
  similarityThreshold = 0.85,
): TemplateCluster[] {
  // First pass: exact hash groups
  const exactGroups = new Map<string, Array<{ url: string; html: string }>>();
  for (const { url, hash, html } of pages) {
    const group = exactGroups.get(hash) ?? [];
    group.push({ url, html });
    exactGroups.set(hash, group);
  }

  const clusters: Array<{ hash: string; urls: string[]; representative: string; paths: Set<string> }> = [];
  for (const [hash, entries] of exactGroups) {
    clusters.push({
      hash,
      urls: entries.map((e) => e.url),
      representative: entries[0].url,
      paths: extractTagPaths(entries[0].html),
    });
  }

  // Second pass: merge similar clusters
  const assignedTo = new Map<number, number>(); // clusterIdx -> mergedIntoIdx
  for (let i = 0; i < clusters.length; i++) {
    if (assignedTo.has(i)) continue;
    for (let j = i + 1; j < clusters.length; j++) {
      if (assignedTo.has(j)) continue;
      const sim = jaccardSimilarity(clusters[i].paths, clusters[j].paths);
      if (sim >= similarityThreshold) {
        clusters[i].urls.push(...clusters[j].urls);
        assignedTo.set(j, i);
      }
    }
  }

  return clusters
    .filter((_, idx) => !assignedTo.has(idx))
    .map(({ hash, urls, representative }) => ({ hash, urls, representative }));
}

// Compare current hashes against PageHashCache entries passed in
export function diffHashes(
  current: PageHashEntry[],
  cached: Map<string, string>, // url -> cachedHash
): DiffResult {
  const unchanged: PageHashEntry[] = [];
  const changed: PageHashEntry[] = [];

  for (const entry of current) {
    const prev = cached.get(entry.url);
    if (prev && prev === entry.hash) {
      unchanged.push(entry);
    } else {
      changed.push(entry);
    }
  }

  return { unchanged, changed };
}
