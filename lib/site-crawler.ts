import { chromium } from 'playwright';

export interface DiscoveredUrl {
  url: string;
  statusCode?: number;
}

export interface DiscoveryResult {
  urls: DiscoveredUrl[];
  method: 'sitemap' | 'robots' | 'crawl';
  disallowedPaths: string[];
}

const ASSET_EXTENSIONS = new Set([
  '.css', '.js', '.mjs', '.ts', '.map',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.zip', '.rar', '.gz', '.tar',
  '.mp4', '.webm', '.mp3', '.wav', '.ogg',
  '.xml', '.json', '.csv', '.xlsx', '.docx',
]);

function isAssetUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    const lastSegment = pathname.split('/').pop() ?? '';
    const dotIndex = lastSegment.lastIndexOf('.');
    if (dotIndex === -1) return false;
    const ext = lastSegment.slice(dotIndex).toLowerCase();
    return ASSET_EXTENSIONS.has(ext);
  } catch {
    return false;
  }
}

function normalizeUrl(raw: string, base: string): string | null {
  try {
    const u = new URL(raw, base);
    u.hash = '';
    u.search = u.search;
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

function parseDisallowRules(robotsTxt: string): string[] {
  const rules: string[] = [];
  const lines = robotsTxt.split('\n');
  let inUserAgentAll = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.slice('user-agent:'.length).trim();
      inUserAgentAll = agent === '*';
      continue;
    }
    if (inUserAgentAll && line.toLowerCase().startsWith('disallow:')) {
      const path = line.slice('disallow:'.length).trim();
      if (path) rules.push(path);
    }
  }

  return rules;
}

function isDisallowed(url: string, disallowedPaths: string[]): boolean {
  try {
    const { pathname } = new URL(url);
    return disallowedPaths.some((rule) => pathname.startsWith(rule));
  } catch {
    return false;
  }
}

async function fetchText(url: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseSitemap(xml: string, origin: string): string[] {
  const urls: string[] = [];

  // Handle sitemap index: <sitemap><loc>...</loc></sitemap>
  const sitemapLocs = [...xml.matchAll(/<sitemap[\s\S]*?<loc>([\s\S]*?)<\/loc>/gi)];
  for (const m of sitemapLocs) {
    const loc = m[1].trim();
    if (loc) urls.push(loc);
  }

  // Handle regular sitemap: <url><loc>...</loc></url>
  const urlLocs = [...xml.matchAll(/<url[\s\S]*?<loc>([\s\S]*?)<\/loc>/gi)];
  for (const m of urlLocs) {
    const loc = m[1].trim();
    if (loc) urls.push(loc);
  }

  return urls.filter((u) => {
    try {
      return new URL(u).origin === origin;
    } catch {
      return false;
    }
  });
}

async function resolveAllSitemaps(origin: string, robotsTxt: string | null): Promise<string[] | null> {
  const sitemapUrls: string[] = [];

  // Try well-known location
  sitemapUrls.push(`${origin}/sitemap.xml`);
  sitemapUrls.push(`${origin}/sitemap_index.xml`);

  // Parse Sitemap: directives from robots.txt
  if (robotsTxt) {
    for (const line of robotsTxt.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('sitemap:')) {
        const loc = trimmed.slice('sitemap:'.length).trim();
        if (loc) sitemapUrls.push(loc);
      }
    }
  }

  const collected: string[] = [];
  const visited = new Set<string>();

  async function processSitemap(url: string): Promise<void> {
    if (visited.has(url)) return;
    visited.add(url);

    const xml = await fetchText(url);
    if (!xml) return;

    const found = parseSitemap(xml, origin);

    // If it's a sitemap index (contains sitemap locs), recurse
    if (/<sitemap[\s\S]*?<loc>/i.test(xml)) {
      for (const child of found) {
        await processSitemap(child);
      }
    } else {
      collected.push(...found);
    }
  }

  for (const url of sitemapUrls) {
    await processSitemap(url);
  }

  return collected.length > 0 ? collected : null;
}

async function crawlBFS(
  origin: string,
  disallowedPaths: string[],
  maxDepth: number,
  maxUrls: number,
): Promise<DiscoveredUrl[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (compatible; VivaTechAuditBot/1.0; +https://vivatech.com/bot)',
    viewport: { width: 1280, height: 800 },
  });

  const discovered: DiscoveredUrl[] = [];
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: origin + '/', depth: 0 }];

  try {
    while (queue.length > 0 && discovered.length < maxUrls) {
      const item = queue.shift()!;
      const { url, depth } = item;

      if (visited.has(url)) continue;
      visited.add(url);

      if (isDisallowed(url, disallowedPaths)) continue;

      const page = await context.newPage();
      let statusCode: number | undefined;

      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        statusCode = response?.status();

        if (statusCode && statusCode < 400) {
          discovered.push({ url, statusCode });

          if (depth < maxDepth) {
            const hrefs = await page.$$eval('a[href]', (els) =>
              els.map((el) => (el as HTMLAnchorElement).href),
            );

            for (const href of hrefs) {
              const normalized = normalizeUrl(href, origin);
              if (!normalized) continue;
              if (new URL(normalized).origin !== origin) continue;
              if (isAssetUrl(normalized)) continue;
              if (visited.has(normalized)) continue;
              if (isDisallowed(normalized, disallowedPaths)) continue;
              queue.push({ url: normalized, depth: depth + 1 });
            }
          }
        }
      } catch {
        // Skip pages that fail to load
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return discovered;
}

export async function discoverPages(
  baseUrl: string,
  options: {
    maxDepth?: number;
    maxUrls?: number;
    respectRobots?: boolean;
  } = {},
): Promise<DiscoveryResult> {
  const { maxDepth = 3, maxUrls = 200, respectRobots = true } = options;

  const origin = new URL(baseUrl).origin;

  // Fetch robots.txt
  const robotsTxt = respectRobots ? await fetchText(`${origin}/robots.txt`) : null;
  const disallowedPaths = robotsTxt ? parseDisallowRules(robotsTxt) : [];

  // Phase 1: Try sitemap
  const sitemapUrls = await resolveAllSitemaps(origin, robotsTxt);
  if (sitemapUrls && sitemapUrls.length > 0) {
    const filtered = sitemapUrls
      .filter((u) => !isAssetUrl(u) && !isDisallowed(u, disallowedPaths))
      .slice(0, maxUrls);

    return {
      urls: filtered.map((u) => ({ url: u })),
      method: robotsTxt && /sitemap:/i.test(robotsTxt) ? 'robots' : 'sitemap',
      disallowedPaths,
    };
  }

  // Phase 2: BFS crawl fallback
  const crawled = await crawlBFS(origin, disallowedPaths, maxDepth, maxUrls);

  return {
    urls: crawled,
    method: 'crawl',
    disallowedPaths,
  };
}
