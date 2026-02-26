#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { auditPageAtViewport, VIEWPORTS } = require('../lib/audit-core.js');

// Dynamic imports for ESM-style TS-compiled modules
// We require the JS equivalents directly from the compiled node context
// The crawler and dom-hasher are TypeScript files - we call them via tsx or use ts-node
// Since we can't easily do TS in a plain node script, we inline minimal versions here.
// For crawling we re-implement the logic in plain JS, sharing the strategy.

const { URL } = require('url');
const https = require('https');
const http = require('http');
const { createHash } = require('crypto');

// Inline minimal cheerio usage via require
let cheerio;
try { cheerio = require('cheerio'); } catch {}

const prisma = new PrismaClient();

const [, , auditId, baseUrl, maxDepthArg, maxUrlsArg] = process.argv;

if (!auditId || !baseUrl) {
  console.error('Usage: node scripts/run-site-audit.js <auditId> <baseUrl> [maxDepth] [maxUrls]');
  process.exit(1);
}

const MAX_DEPTH = parseInt(maxDepthArg || '3', 10);
const MAX_URLS = parseInt(maxUrlsArg || '200', 10);

const ASSET_EXTS = new Set([
  '.css','.js','.mjs','.map','.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.avif',
  '.woff','.woff2','.ttf','.eot','.otf','.pdf','.zip','.rar','.gz','.tar',
  '.mp4','.webm','.mp3','.wav','.ogg','.json','.csv','.xlsx','.docx',
]);

const ALL_VIEWPORTS = [VIEWPORTS.desktop, VIEWPORTS.tablet, VIEWPORTS.mobile];
const BATCH_SIZE = 20;
const TEMPLATE_NAMES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAsset(url) {
  try {
    const p = new URL(url).pathname;
    const ext = p.slice(p.lastIndexOf('.')).toLowerCase();
    return ASSET_EXTS.has(ext);
  } catch { return false; }
}

function normalizeUrl(raw, base) {
  try {
    const u = new URL(raw, base);
    u.hash = '';
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch { return null; }
}

async function fetchText(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchText(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function parseDisallow(robotsTxt) {
  const rules = [];
  let inAll = false;
  for (const raw of robotsTxt.split('\n')) {
    const line = raw.trim();
    if (line.toLowerCase().startsWith('user-agent:')) {
      inAll = line.slice('user-agent:'.length).trim() === '*';
    } else if (inAll && line.toLowerCase().startsWith('disallow:')) {
      const p = line.slice('disallow:'.length).trim();
      if (p) rules.push(p);
    }
  }
  return rules;
}

function isDisallowed(url, rules) {
  try {
    const { pathname } = new URL(url);
    return rules.some((r) => pathname.startsWith(r));
  } catch { return false; }
}

function parseSitemapLocs(xml, origin) {
  const urls = [];
  for (const m of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    const loc = m[1].trim();
    try { if (new URL(loc).origin === origin) urls.push(loc); } catch {}
  }
  return urls;
}

async function resolveSitemaps(origin, robotsTxt) {
  const toTry = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  if (robotsTxt) {
    for (const line of robotsTxt.split('\n')) {
      const t = line.trim();
      if (t.toLowerCase().startsWith('sitemap:')) toTry.push(t.slice('sitemap:'.length).trim());
    }
  }
  const collected = [];
  const seen = new Set();
  async function process(url) {
    if (seen.has(url)) return;
    seen.add(url);
    const xml = await fetchText(url);
    if (!xml) return;
    const locs = parseSitemapLocs(xml, origin);
    if (/<sitemap[\s\S]*?<loc>/i.test(xml)) {
      for (const l of locs) await process(l);
    } else {
      collected.push(...locs);
    }
  }
  for (const u of toTry) await process(u);
  return collected;
}

// ─── Structural hash ─────────────────────────────────────────────────────────

const SKIP_TAGS = new Set(['script','style','noscript','head','meta','link','title']);
const KEEP_ATTRS = new Set(['role','type','data-component','data-block']);

function computeHash(html) {
  if (!cheerio) return createHash('sha256').update(html.slice(0, 2000)).digest('hex');
  const $ = cheerio.load(html);
  const parts = [];
  function walk(el) {
    if (!el || el.type === 'text' || el.type === 'comment') return;
    if (el.type !== 'tag') return;
    const tag = el.name?.toLowerCase() ?? '';
    if (SKIP_TAGS.has(tag)) return;
    const kept = [];
    for (const a of KEEP_ATTRS) { const v = $(el).attr(a); if (v) kept.push(`${a}=${v}`); }
    const cls = $(el).attr('class');
    if (cls) { const b = cls.trim().split(/\s+/)[0]?.split('__')[0]?.split('--')[0]; if (b) kept.push(`cls=${b}`); }
    parts.push(kept.length ? `<${tag} ${kept.join(' ')}>` : `<${tag}>`);
    for (const c of $(el).contents().toArray()) walk(c);
    parts.push(`</${tag}>`);
  }
  $('body').contents().each((_, c) => walk(c));
  return createHash('sha256').update(parts.join('')).digest('hex');
}

// ─── Discovery ───────────────────────────────────────────────────────────────

async function discover(origin, disallowed) {
  const sitemapUrls = await resolveSitemaps(origin, null);
  if (sitemapUrls.length > 0) {
    return {
      urls: sitemapUrls.filter((u) => !isAsset(u) && !isDisallowed(u, disallowed)).slice(0, MAX_URLS),
      method: 'sitemap',
    };
  }

  // BFS crawl
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const found = [];
  const visited = new Set();
  const queue = [{ url: origin + '/', depth: 0 }];

  try {
    while (queue.length > 0 && found.length < MAX_URLS) {
      const { url, depth } = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      if (isDisallowed(url, disallowed)) continue;
      const page = await ctx.newPage();
      try {
        const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (res && res.status() < 400) {
          found.push({ url, statusCode: res.status() });
          if (depth < MAX_DEPTH) {
            const hrefs = await page.$$eval('a[href]', (els) => els.map((e) => e.href));
            for (const href of hrefs) {
              const n = normalizeUrl(href, origin);
              if (!n || new URL(n).origin !== origin || isAsset(n) || visited.has(n) || isDisallowed(n, disallowed)) continue;
              queue.push({ url: n, depth: depth + 1 });
            }
          }
        }
      } catch { /* skip */ } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return { urls: found.map((f) => f.url), method: 'crawl' };
}

// ─── Update status helper ────────────────────────────────────────────────────

async function setStatus(status, extra = {}) {
  await prisma.audit.update({ where: { id: auditId }, data: { status, ...extra } });
}

function persistProgress(progress) {
  return prisma.audit.update({
    where: { id: auditId },
    data: { statistics: { siteProgress: progress } },
  }).catch(() => {});
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runSiteAudit() {
  let browser;

  try {
    const origin = new URL(baseUrl).origin;
    const domain = new URL(baseUrl).hostname;

    await setStatus('discovering');
    console.log(`[site-audit] Discovering pages for: ${origin}`);

    // Robots.txt
    const robotsTxt = await fetchText(`${origin}/robots.txt`);
    const disallowed = robotsTxt ? parseDisallow(robotsTxt) : [];

    // Discover
    const { urls, method } = await discover(origin, disallowed);
    console.log(`[site-audit] Discovered ${urls.length} URLs via ${method}`);

    // Save discovered pages
    const urlList = Array.isArray(urls) ? urls.map((u) => (typeof u === 'string' ? u : u.url)) : [];
    const pageRecords = await Promise.all(
      urlList.map((url) =>
        prisma.discoveredPage.create({ data: { auditId, url, hashChanged: true } })
      )
    );

    await setStatus('clustering', {
      discoveryMethod: method,
      totalDiscovered: urlList.length,
    });

    // Fetch hashes from cache for this domain
    const cachedEntries = await prisma.pageHashCache.findMany({ where: { domain } });
    const cacheMap = new Map(cachedEntries.map((e) => [e.url, e.structuralHash]));

    console.log(`[site-audit] Computing structural hashes (${urlList.length} pages)...`);

    // Load each page with Playwright to get HTML + compute hash
    browser = await chromium.launch({ headless: true });
    const hashCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

    const pageHashes = []; // { url, hash, html, pageRecordId, changed }
    let skipped = 0;

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      const page = await hashCtx.newPage();
      let hash = null;
      let html = null;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        html = await page.content();
        hash = computeHash(html);
      } catch {
        hash = createHash('sha256').update(url).digest('hex');
      } finally {
        await page.close();
      }

      const cachedHash = cacheMap.get(url);
      const changed = !cachedHash || cachedHash !== hash;
      if (!changed) skipped++;

      pageHashes.push({ url, hash, html, pageRecordId: pageRecords[i].id, changed });

      // Update the discovered page record with its hash
      await prisma.discoveredPage.update({
        where: { id: pageRecords[i].id },
        data: { structuralHash: hash, hashChanged: changed },
      });
    }

    await hashCtx.close();

    console.log(`[site-audit] Hashing done. ${skipped} unchanged pages will skip full audit.`);

    // Cluster by hash (only pages that need auditing)
    const toAudit = pageHashes.filter((p) => p.changed && p.html);
    const clusterMap = new Map(); // hash -> { urls, representative, html }

    for (const p of toAudit) {
      if (!clusterMap.has(p.hash)) {
        clusterMap.set(p.hash, { urls: [], representative: p.url, html: p.html });
      }
      clusterMap.get(p.hash).urls.push(p.url);
    }

    // Also include unchanged pages for clustering (assign to existing templates from their hash)
    const allClusterMap = new Map(clusterMap);
    for (const p of pageHashes.filter((ph) => !ph.changed && ph.hash)) {
      if (!allClusterMap.has(p.hash)) {
        allClusterMap.set(p.hash, { urls: [], representative: p.url, html: p.html });
      } else {
        allClusterMap.get(p.hash).urls.push(p.url);
      }
    }

    // Create PageTemplate records
    const templates = [];
    let tIdx = 0;
    for (const [hash, cluster] of allClusterMap) {
      const name = `Template ${TEMPLATE_NAMES[tIdx] ?? tIdx + 1}`;
      const tRecord = await prisma.pageTemplate.create({
        data: {
          auditId,
          name,
          structuralHash: hash,
          pageCount: cluster.urls.length,
          representativeUrl: cluster.representative,
          examplePaths: cluster.urls.slice(0, 5),
        },
      });
      templates.push({ ...tRecord, html: cluster.html, needsAudit: clusterMap.has(hash) });

      // Link discovered pages to this template
      for (const p of pageHashes.filter((ph) => ph.hash === hash)) {
        await prisma.discoveredPage.update({
          where: { id: p.pageRecordId },
          data: {
            templateId: tRecord.id,
            isRepresentative: p.url === cluster.representative && clusterMap.has(hash),
          },
        });
      }

      tIdx++;
    }

    const templatesToAudit = templates.filter((t) => t.needsAudit && t.html);
    console.log(`[site-audit] ${templates.length} templates identified, ${templatesToAudit.length} need auditing.`);

    const totalViewportSteps = templatesToAudit.length * ALL_VIEWPORTS.length;
    let completedViewportSteps = 0;
    await setStatus('auditing', {
      totalTemplates: templates.length,
      totalAudited: 0,
      statistics: {
        siteProgress: {
          currentTemplate: null,
          currentTemplateIndex: 0,
          totalTemplatesToAudit: templatesToAudit.length,
          currentViewport: null,
          viewportStep: 0,
          totalViewportSteps,
          criterionCompleted: 0,
          criterionTotal: 0,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    // Audit each template representative at all 3 viewports
    const allNonCompliantArticles = new Set();
    let totalAudited = 0;

    for (const template of templatesToAudit) {
      console.log(`[site-audit] Auditing ${template.name} (${template.representativeUrl})`);
      let templateComplianceSum = 0;

      for (const vp of ALL_VIEWPORTS) {
        console.log(`[site-audit]   Viewport: ${vp.name}`);

        let lastProgressPersistAt = 0;
        const onProgress = (completed, total, criterion, result, icon) => {
          process.stdout.write(`\r[site-audit]   [${completed}/${total}] ${icon} ${criterion.article}    `);

          const now = Date.now();
          const shouldPersist =
            completed === 1 ||
            completed === total ||
            completed % 10 === 0 ||
            now - lastProgressPersistAt > 4000;
          if (shouldPersist) {
            lastProgressPersistAt = now;
            void persistProgress({
              currentTemplate: template.name,
              currentTemplateIndex: totalAudited + 1,
              totalTemplatesToAudit: templatesToAudit.length,
              currentViewport: vp.name,
              viewportStep: completedViewportSteps + 1,
              totalViewportSteps,
              criterionCompleted: completed,
              criterionTotal: total,
              currentCriterion: criterion?.article ?? null,
              updatedAt: new Date().toISOString(),
            });
          }
        };

        await persistProgress({
          currentTemplate: template.name,
          currentTemplateIndex: totalAudited + 1,
          totalTemplatesToAudit: templatesToAudit.length,
          currentViewport: vp.name,
          viewportStep: completedViewportSteps + 1,
          totalViewportSteps,
          criterionCompleted: 0,
          criterionTotal: 0,
          updatedAt: new Date().toISOString(),
        });

        const {
          analysisResults,
          statistics,
          rawAxeResults,
          complianceRate,
          totalViolations,
          llmAvailable,
        } = await auditPageAtViewport(browser, template.representativeUrl, vp, {
          concurrency: 1,
          llmModel: 'mistral:7b-instruct-v0.3-q4_K_M',
          onProgress,
        });
        completedViewportSteps++;

        process.stdout.write('\n');

        // Save ViewportResult
        const vpRecord = await prisma.viewportResult.create({
          data: {
            auditId,
            templateId: template.id,
            viewport: vp.name,
            width: vp.width,
            height: vp.height,
            url: template.representativeUrl,
            complianceRate,
            totalViolations,
            statistics,
            rawAxeResults,
          },
        });

        // Save CriterionResults linked to ViewportResult
        for (let i = 0; i < analysisResults.length; i += BATCH_SIZE) {
          const batch = analysisResults.slice(i, i + BATCH_SIZE);
          await prisma.criterionResult.createMany({
            data: batch.map((r) => ({
              auditId,
              viewportResultId: vpRecord.id,
              article: r.criterion,
              status: r.status,
              confidence: r.confidence ?? 0,
              reasoning: r.reasoning ?? null,
              issues: r.issues ?? [],
              recommendations: r.recommendations ?? [],
              testedBy: r.testedBy ?? null,
              elementCount: r.elementCount ?? -1,
            })),
          });
        }

        // Collect non-compliant articles for legal summary
        for (const r of analysisResults) {
          if (r.status === 'non_compliant') allNonCompliantArticles.add(r.criterion);
        }

        templateComplianceSum += complianceRate;
      }

      // Update template with average compliance across viewports
      const avgCompliance = parseFloat((templateComplianceSum / ALL_VIEWPORTS.length).toFixed(1));
      await prisma.pageTemplate.update({
        where: { id: template.id },
        data: { complianceRate: avgCompliance },
      });

      totalAudited++;

      await setStatus('auditing', {
        totalTemplates: templates.length,
        totalAudited,
      });
    }

    // Reuse previous template data for unchanged templates
    for (const template of templates.filter((t) => !t.needsAudit)) {
      // Look up previous viewport results from PageHashCache
      const prevAuditId = cacheMap.size > 0 ? cachedEntries[0]?.lastAuditId : null;
      if (prevAuditId) {
        const prevTemplate = await prisma.pageTemplate.findFirst({
          where: { auditId: prevAuditId, structuralHash: template.structuralHash },
          select: { complianceRate: true },
        });
        if (prevTemplate?.complianceRate != null) {
          await prisma.pageTemplate.update({
            where: { id: template.id },
            data: { complianceRate: prevTemplate.complianceRate },
          });
        }
      }
    }

    // Update PageHashCache
    for (const p of pageHashes) {
      await prisma.pageHashCache.upsert({
        where: { domain_url: { domain, url: p.url } },
        update: { structuralHash: p.hash, lastAuditedAt: new Date(), lastAuditId: auditId },
        create: { domain, url: p.url, structuralHash: p.hash, lastAuditedAt: new Date(), lastAuditId: auditId },
      });
    }

    // Aggregate site-level compliance (average across all templates, weighted by page count)
    const allTemplates = await prisma.pageTemplate.findMany({ where: { auditId } });
    const totalPages = allTemplates.reduce((s, t) => s + t.pageCount, 0);
    const weightedSum = allTemplates.reduce((s, t) => s + (t.complianceRate ?? 0) * t.pageCount, 0);
    const aggregateComplianceRate = totalPages > 0 ? parseFloat((weightedSum / totalPages).toFixed(1)) : 0;

    // Build legal summary: deduplicated non-compliant criteria with descriptions
    const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js');
    const legalSummary = {
      nonCompliantCriteria: [...allNonCompliantArticles].sort().map((article) => ({
        article,
        desc: rgaaFlatMapping[article]?.desc ?? '',
        level: rgaaFlatMapping[article]?.level ?? '',
      })),
      totalNonCompliant: allNonCompliantArticles.size,
      overallComplianceRate: aggregateComplianceRate,
    };

    const technicalRisk = allNonCompliantArticles.size > 0 ? 50000 : 0;
    const legalRiskTotal = technicalRisk + 25000;

    await setStatus('completed', {
      completedAt: new Date(),
      complianceRate: aggregateComplianceRate,
      legalRiskTotal,
      legalSummary,
      totalDiscovered: urlList.length,
      totalTemplates: templates.length,
      totalAudited,
      pagesSkipped: skipped,
    });

    console.log(
      `[site-audit] Done. ${templates.length} templates | ${totalAudited} audited | ${skipped} skipped | Compliance: ${aggregateComplianceRate}%`
    );
  } catch (err) {
    console.error('[site-audit] Fatal error:', err);
    if (err && err.stack) {
      console.error('[site-audit] Fatal stack:', err.stack);
    }
    try {
      const message = err instanceof Error
        ? `${err.message}${err.stack ? `\n${err.stack}` : ''}`.slice(0, 4000)
        : String(err);
      await prisma.audit.update({
        where: { id: auditId },
        data: { status: 'failed', errorMessage: message },
      });
    } catch { /* ignore */ }
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

runSiteAudit().catch((err) => {
  console.error('[site-audit] Unhandled error:', err);
  process.exit(1);
});
