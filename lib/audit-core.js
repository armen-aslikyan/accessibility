"use strict";

const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs/promises");
const path = require("path");
const { createHash } = require("crypto");
const { rgaaFlatMapping } = require("../constants/rgaaMapping.complete.js");
const llmClient = require("../utils/llmClient.js");

const { COMPLIANCE_STATUS } = llmClient;

const VIEWPORTS = {
  desktop: { name: "desktop", width: 1920, height: 1080 },
  tablet: { name: "tablet", width: 768, height: 1024 },
  mobile: { name: "mobile", width: 375, height: 812 },
};

const DEFAULT_VIEWPORT = VIEWPORTS.desktop;
const EVIDENCE_OVERLAY_ID = "__vta_evidence_overlay__";
const MAX_AI_EVIDENCE_NODES = 6;

/**
 * Resolve a viewport config from a name string or object.
 * @param {string|object|undefined} viewport
 * @returns {{ name: string, width: number, height: number }}
 */
function resolveViewport(viewport) {
  if (!viewport) return DEFAULT_VIEWPORT;
  if (typeof viewport === "object") return viewport;
  return VIEWPORTS[viewport] ?? DEFAULT_VIEWPORT;
}

function sanitizeSegment(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeScope(scope) {
  const parts = String(scope || "").split("/").filter(Boolean);
  if (parts.length === 0) return "default";
  return parts.map(sanitizeSegment).join("/");
}

function buildEvidencePaths(options, viewportName, criterionArticle) {
  if (!options.evidenceRootDir || !options.evidenceBaseUrl) return null;

  const scope = sanitizeScope(options.evidenceScope || viewportName || "desktop");
  const fileHash = createHash("sha1")
    .update(`${criterionArticle}|${viewportName}|${Date.now()}|${Math.random()}`)
    .digest("hex")
    .slice(0, 10);
  const fileName = `${sanitizeSegment(criterionArticle)}-${fileHash}.png`;
  const dirPath = path.join(options.evidenceRootDir, scope);
  const filePath = path.join(dirPath, fileName);
  const baseUrl = String(options.evidenceBaseUrl).replace(/\/+$/, "");
  const publicPath = `${baseUrl}/${scope}/${fileName}`;

  return { dirPath, filePath, publicPath };
}

async function clearEvidenceOverlay(page) {
  await page.evaluate((overlayId) => {
    const existing = document.getElementById(overlayId);
    if (existing) existing.remove();
  }, EVIDENCE_OVERLAY_ID);
}

async function addEvidenceOverlay(page, boxes) {
  await page.evaluate(
    ({ overlayId, overlays }) => {
      const existing = document.getElementById(overlayId);
      if (existing) existing.remove();

      const root = document.createElement("div");
      root.id = overlayId;
      root.style.position = "fixed";
      root.style.inset = "0";
      root.style.pointerEvents = "none";
      root.style.zIndex = "2147483647";
      document.body.appendChild(root);

      overlays.forEach((box, index) => {
        const frame = document.createElement("div");
        frame.style.position = "fixed";
        frame.style.left = `${box.x}px`;
        frame.style.top = `${box.y}px`;
        frame.style.width = `${box.width}px`;
        frame.style.height = `${box.height}px`;
        frame.style.border = "3px solid #ef4444";
        frame.style.background = "rgba(239, 68, 68, 0.12)";
        frame.style.boxSizing = "border-box";
        root.appendChild(frame);

        const label = document.createElement("div");
        label.textContent = String(index + 1);
        label.style.position = "fixed";
        label.style.left = `${box.x}px`;
        label.style.top = `${Math.max(0, box.y - 20)}px`;
        label.style.background = "#ef4444";
        label.style.color = "white";
        label.style.padding = "1px 6px";
        label.style.fontSize = "11px";
        label.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        label.style.fontWeight = "700";
        label.style.borderRadius = "4px";
        root.appendChild(label);
      });
    },
    { overlayId: EVIDENCE_OVERLAY_ID, overlays: boxes }
  );
}

async function readElementMeta(locator) {
  return locator.evaluate((el) => {
    function domPath(target) {
      const segments = [];
      let current = target;
      while (current && current.nodeType === 1 && segments.length < 8) {
        let segment = current.tagName.toLowerCase();
        if (current.id) {
          segment += `#${current.id}`;
          segments.unshift(segment);
          break;
        }
        const classes = (current.className || "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2);
        if (classes.length > 0) segment += `.${classes.join(".")}`;
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter((x) => x.tagName === current.tagName);
          if (siblings.length > 1) segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
        segments.unshift(segment);
        current = parent;
      }
      return segments.join(" > ");
    }

    return {
      domPath: domPath(el),
      outerHTML: (el.outerHTML || "").slice(0, 1200),
      src: el.getAttribute?.("src") || null,
      href: el.getAttribute?.("href") || null,
    };
  });
}

async function captureSingleOccurrenceScreenshot(page, viewportName, options, key, box) {
  const evidencePaths = buildEvidencePaths(options, viewportName, key);
  if (!evidencePaths) return { screenshotUrl: null, screenshotPath: null };
  await fs.mkdir(evidencePaths.dirPath, { recursive: true });
  try {
    await addEvidenceOverlay(page, [box]);
    await page.screenshot({ path: evidencePaths.filePath, fullPage: false });
  } finally {
    await clearEvidenceOverlay(page);
  }
  return {
    screenshotUrl: evidencePaths.publicPath,
    screenshotPath: path.relative(process.cwd(), evidencePaths.filePath),
  };
}

async function captureAxeRuleOccurrences(page, criterion, rule, occurrenceStatus, viewportName, options) {
  const nodes = Array.isArray(rule?.nodes) ? rule.nodes : [];
  const occurrences = [];

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const selectorChain = Array.isArray(node.target) ? node.target.filter((s) => typeof s === "string" && s.trim()) : [];
    const selector = selectorChain[0] || "";
    const base = {
      pageUrl: page.url(),
      viewport: viewportName,
      highlightIndex: 1,
      axeRuleId: rule.id,
      impact: node.impact || rule.impact || null,
      help: rule.help || rule.description || rule.id,
      helpUrl: rule.helpUrl || null,
      selector,
      selectorChain,
      domPath: "",
      elementHtml: node.html || "",
      elementSource: null,
      failureSummary: node.failureSummary || null,
      occurrenceStatus,
      occurrenceReason:
        occurrenceStatus === "non_compliant"
          ? node.failureSummary || rule.help || "Automated check failed for this element"
          : `Automated ${rule.id} check passed for this element`,
      occurrenceIndex: index + 1,
      screenshotUrl: null,
      screenshotPath: null,
      boundingBox: null,
    };

    if (!selector) {
      occurrences.push(base);
      continue;
    }

    try {
      let locator = null;
      let resolvedSelector = "";
      for (const candidate of selectorChain.length > 0 ? selectorChain : [selector]) {
        try {
          const testLocator = page.locator(candidate).first();
          if ((await testLocator.count()) > 0) {
            locator = testLocator;
            resolvedSelector = candidate;
            break;
          }
        } catch {
          // Try next candidate selector.
        }
      }
      if (!locator) {
        occurrences.push(base);
        continue;
      }
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      const box = await locator.boundingBox();
      if (!box || box.width < 2 || box.height < 2) {
        occurrences.push(base);
        continue;
      }

      const meta = await readElementMeta(locator);
      const normalizedBox = {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
      const screenshot = await captureSingleOccurrenceScreenshot(
        page,
        viewportName,
        options,
        `${criterion.article}-${rule.id}-${occurrenceStatus}-${index + 1}`,
        normalizedBox
      );

      occurrences.push({
        ...base,
        selector: resolvedSelector || base.selector,
        selectorChain: selectorChain.length > 0 ? selectorChain : [resolvedSelector],
        domPath: meta.domPath,
        elementHtml: meta.outerHTML || base.elementHtml,
        elementSource: meta.src || meta.href || null,
        boundingBox: normalizedBox,
        screenshotUrl: screenshot.screenshotUrl,
        screenshotPath: screenshot.screenshotPath,
      });
    } catch {
      occurrences.push(base);
    }
  }

  return occurrences;
}

async function captureElementDetectionOccurrences(page, criterion, result, viewportName, options) {
  const selectors = getAiSelectorsForCriterion(criterion.article);
  if (selectors.length === 0) {
    return [
      {
        pageUrl: page.url(),
        viewport: viewportName,
        highlightIndex: 1,
        axeRuleId: `element-detection-${criterion.article}`,
        impact: null,
        help: "Element detection applicability check",
        helpUrl: null,
        selector: "",
        selectorChain: [],
        domPath: "",
        elementHtml: "",
        elementSource: null,
        failureSummary: null,
        occurrenceStatus: result.status === COMPLIANCE_STATUS.NOT_APPLICABLE ? "compliant" : "needs_review",
        occurrenceReason: result.reasoning || "No matching elements found during applicability check",
        occurrenceIndex: 1,
        screenshotUrl: null,
        screenshotPath: null,
        boundingBox: null,
      },
    ];
  }

  const occurrences = [];
  let idx = 0;
  for (const selector of selectors) {
    if (occurrences.length >= 3) break;
    try {
      const locator = page.locator(selector);
      const count = Math.min(await locator.count(), 1);
      for (let i = 0; i < count; i++) {
        const node = locator.nth(i);
        await node.scrollIntoViewIfNeeded().catch(() => {});
        const box = await node.boundingBox();
        if (!box || box.width < 2 || box.height < 2) continue;
        const meta = await readElementMeta(node);
        const normalizedBox = {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
        const screenshot = await captureSingleOccurrenceScreenshot(
          page,
          viewportName,
          options,
          `${criterion.article}-element-detection-${idx + 1}`,
          normalizedBox
        );
        idx++;
        occurrences.push({
          pageUrl: page.url(),
          viewport: viewportName,
          highlightIndex: 1,
          axeRuleId: `element-detection-${criterion.article}`,
          impact: null,
          help: "Element detection applicability check",
          helpUrl: null,
          selector,
          selectorChain: [selector],
          domPath: meta.domPath,
          elementHtml: meta.outerHTML || "",
          elementSource: meta.src || meta.href || null,
          failureSummary: null,
          occurrenceStatus: result.status === COMPLIANCE_STATUS.NOT_APPLICABLE ? "compliant" : "needs_review",
          occurrenceReason: result.reasoning || "Element detection context",
          occurrenceIndex: idx,
          screenshotUrl: screenshot.screenshotUrl,
          screenshotPath: screenshot.screenshotPath,
          boundingBox: normalizedBox,
        });
      }
    } catch {
      // Continue with next selector.
    }
  }

  if (occurrences.length > 0) return occurrences;
  return [
    {
      pageUrl: page.url(),
      viewport: viewportName,
      highlightIndex: 1,
      axeRuleId: `element-detection-${criterion.article}`,
      impact: null,
      help: "Element detection applicability check",
      helpUrl: null,
      selector: selectors[0] || "",
      selectorChain: selectors.slice(0, 3),
      domPath: "",
      elementHtml: "",
      elementSource: null,
      failureSummary: null,
      occurrenceStatus: result.status === COMPLIANCE_STATUS.NOT_APPLICABLE ? "compliant" : "needs_review",
      occurrenceReason: result.reasoning || "No visible target could be captured",
      occurrenceIndex: 1,
      screenshotUrl: null,
      screenshotPath: null,
      boundingBox: null,
    },
  ];
}

function getAiSelectorsForCriterion(article) {
  const extractor = llmClient?.htmlExtractor;
  if (!extractor) return [];

  const specific = extractor.CRITERION_SPECIFIC_SELECTORS?.[article];
  if (specific) {
    return String(specific)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const theme = extractor.getThemeFromArticle?.(article);
  const themeSelector = theme ? extractor.THEME_SELECTORS?.[theme] : null;
  if (!themeSelector) return [];
  return String(themeSelector)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function captureAiCriterionEvidence(page, criterion, analysisResult, viewportName, options) {
  const selectors = getAiSelectorsForCriterion(criterion.article);
  if (selectors.length === 0) return [];

  const candidates = [];
  const seenDomPath = new Set();

  for (const selector of selectors) {
    if (candidates.length >= MAX_AI_EVIDENCE_NODES) break;
    try {
      const locator = page.locator(selector);
      const count = Math.min(await locator.count(), 3);

      for (let i = 0; i < count; i++) {
        if (candidates.length >= MAX_AI_EVIDENCE_NODES) break;
        const node = locator.nth(i);
        await node.scrollIntoViewIfNeeded().catch(() => {});
        const box = await node.boundingBox();
        if (!box || box.width < 2 || box.height < 2) continue;

        const meta = await readElementMeta(node);

        const domKey = `${selector}::${meta.domPath}`;
        if (seenDomPath.has(domKey)) continue;
        seenDomPath.add(domKey);

        candidates.push({
          selector,
          box: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          },
          domPath: meta.domPath,
          elementHtml: meta.outerHTML,
          elementSource: meta.src || meta.href || null,
        });
      }
    } catch {
      // Ignore invalid or unsupported selector.
    }
  }

  if (candidates.length === 0) return [];

  const evidence = [];
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];
    const evidencePaths = buildEvidencePaths(options, viewportName, `${criterion.article}-ai-${index + 1}`);
    if (!evidencePaths) continue;

    await fs.mkdir(evidencePaths.dirPath, { recursive: true });
    try {
      await addEvidenceOverlay(page, [candidate.box]);
      await page.screenshot({ path: evidencePaths.filePath, fullPage: false });
    } finally {
      await clearEvidenceOverlay(page);
    }

    const relativePath = path.relative(process.cwd(), evidencePaths.filePath);
    evidence.push({
      screenshotUrl: evidencePaths.publicPath,
      screenshotPath: relativePath,
      pageUrl: page.url(),
      viewport: viewportName,
      highlightIndex: 1,
      boundingBox: candidate.box,
      axeRuleId: `ai-candidate-${criterion.article}`,
      impact: null,
      help: "AI candidate location for manual verification",
      helpUrl: null,
      selector: candidate.selector,
      selectorChain: [candidate.selector],
      domPath: candidate.domPath,
      elementHtml: candidate.elementHtml,
      elementSource: candidate.elementSource,
      failureSummary: Array.isArray(analysisResult?.issues)
        ? analysisResult.issues
            .map((x) => x?.message)
            .filter(Boolean)
            .slice(0, 2)
            .join(" | ")
        : null,
      occurrenceStatus: analysisResult?.status === COMPLIANCE_STATUS.COMPLIANT ? "compliant" : analysisResult?.status,
      occurrenceReason: analysisResult?.reasoning || null,
      occurrenceIndex: index + 1,
    });
  }

  return evidence;
}

/**
 * Run a full RGAA audit on a single page at a given viewport.
 *
 * @param {import('playwright').Browser} browser
 * @param {string} url
 * @param {string|{ name: string, width: number, height: number }} viewport
 * @param {{ concurrency?: number, llmModel?: string, onProgress?: Function }} options
 * @returns {Promise<{
 *   analysisResults: object[],
 *   statistics: object,
 *   rawAxeResults: object,
 *   complianceRate: number,
 *   totalViolations: number,
 *   legalRiskTotal: number,
 *   llmAvailable: boolean,
 * }>}
 */
async function auditPageAtViewport(browser, url, viewport, options = {}) {
  const vp = resolveViewport(viewport);
  const { concurrency = 2, llmModel = "mistral:7b-instruct-v0.3-q4_K_M", onProgress = null } = options;

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    try {
      await page.goto(url, { waitUntil: "load", timeout: 60000 });
    } catch (err) {
      if (err.name === "TimeoutError") {
        console.log(`[audit-core] Page load timeout for ${url}, continuing with partial content...`);
      } else {
        throw err;
      }
    }

    await page.waitForTimeout(2000);

    const pageHTML = await page.content();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();

    const violationsByRule = {};
    results.violations.forEach((v) => {
      violationsByRule[v.id] = v;
    });
    const passesByRule = {};
    results.passes.forEach((p) => {
      passesByRule[p.id] = p;
    });

    const allCriteria = Object.entries(rgaaFlatMapping).map(([article, criterion]) => ({
      article,
      ...criterion,
    }));

    const llmAvailable = await llmClient.checkHealth();

    let analysisResults = [];

    if (llmAvailable) {
      const progressCb = onProgress
        ? (completed, total, criterion, result) => {
            const icons = {
              [COMPLIANCE_STATUS.COMPLIANT]: "OK",
              [COMPLIANCE_STATUS.NON_COMPLIANT]: "FAIL",
              [COMPLIANCE_STATUS.NOT_APPLICABLE]: "N/A",
              [COMPLIANCE_STATUS.NEEDS_REVIEW]: "REVIEW",
            };
            onProgress(completed, total, criterion, result, icons[result.status] || "?");
          }
        : null;

      analysisResults = await llmClient.analyzeAllWithStatus(allCriteria, { url, html: pageHTML, useCache: true, model: llmModel }, violationsByRule, {
        concurrency,
        onProgress: progressCb,
      });
    } else {
      const applicabilityMap = llmClient.htmlExtractor.batchCheckApplicability(pageHTML, allCriteria);

      for (const criterion of allCriteria) {
        const app = applicabilityMap.get(criterion.article);
        const axeRules = criterion.axeRules || [];
        const violations = axeRules.map((ruleId) => violationsByRule[ruleId]).filter(Boolean);

        if (app && !app.applicable) {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            confidence: 100,
            reasoning: app.reason,
            issues: [],
            recommendations: [],
            elementCount: 0,
            timestamp: new Date().toISOString(),
            testedBy: "element_detection",
          });
        } else if (violations.length > 0) {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NON_COMPLIANT,
            confidence: 95,
            reasoning: `Automated testing detected ${violations.length} violation(s)`,
            issues: violations.map((v) => ({ type: "violation", message: v.help })),
            recommendations: [criterion.fix],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: "axe_core",
          });
        } else {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NEEDS_REVIEW,
            confidence: 0,
            reasoning: "LLM not available - manual review required",
            issues: [],
            recommendations: [],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: "none",
          });
        }
      }
    }

    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const criterion = allCriteria.find((c) => c.article === result.criterion);
      const axeRules = criterion?.axeRules || [];
      if (!criterion || axeRules.length === 0) continue;

      const ruleIssues = [];
      let failedTotal = 0;
      let passedTotal = 0;

      for (const ruleId of axeRules) {
        const violation = violationsByRule[ruleId];
        const pass = passesByRule[ruleId];
        const failedOccurrences = violation
          ? await captureAxeRuleOccurrences(page, criterion, violation, "non_compliant", vp.name, options)
          : [];
        const passedOccurrences = pass
          ? await captureAxeRuleOccurrences(page, criterion, pass, "compliant", vp.name, options)
          : [];
        const evidence = [...failedOccurrences, ...passedOccurrences];
        if (evidence.length === 0) continue;

        failedTotal += failedOccurrences.length;
        passedTotal += passedOccurrences.length;
        ruleIssues.push({
          type: "rule_occurrences",
          ruleId,
          message: violation?.help || pass?.help || `Rule ${ruleId}`,
          totalOccurrences: evidence.length,
          failedOccurrences: failedOccurrences.length,
          passedOccurrences: passedOccurrences.length,
          needsReviewOccurrences: 0,
          evidence,
        });
      }

      if (ruleIssues.length > 0) {
        analysisResults[i] = {
          ...result,
          status: failedTotal > 0 ? COMPLIANCE_STATUS.NON_COMPLIANT : result.status,
          issues: ruleIssues,
        };
      }
    }

    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const hasEvidence = (result.issues || []).some((issue) => Array.isArray(issue.evidence) && issue.evidence.length > 0);
      if (hasEvidence) continue;
      if (result.testedBy !== "element_detection") continue;
      const criterion = allCriteria.find((c) => c.article === result.criterion);
      if (!criterion) continue;

      const evidence = await captureElementDetectionOccurrences(page, criterion, result, vp.name, options);
      analysisResults[i] = {
        ...result,
        issues: [
          {
            type: "rule_occurrences",
            ruleId: `element-detection-${criterion.article}`,
            message: "Element detection applicability check",
            totalOccurrences: evidence.length,
            passedOccurrences: result.status === COMPLIANCE_STATUS.NOT_APPLICABLE ? evidence.length : 0,
            failedOccurrences: 0,
            needsReviewOccurrences: result.status !== COMPLIANCE_STATUS.NOT_APPLICABLE ? evidence.length : 0,
            evidence,
          },
        ],
      };
    }

    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const existingEvidence = (result.issues || []).some((issue) => Array.isArray(issue.evidence) && issue.evidence.length > 0);
      if (existingEvidence) continue;
      if (result.testedBy !== "ai") continue;
      if (result.status === COMPLIANCE_STATUS.NOT_APPLICABLE) continue;

      const criterion = allCriteria.find((c) => c.article === result.criterion);
      if (!criterion) continue;

      const aiEvidence = await captureAiCriterionEvidence(page, criterion, result, vp.name, options);
      if (aiEvidence.length === 0) continue;

      const baseIssues = Array.isArray(result.issues) ? result.issues : [];
      if (baseIssues.length === 0) {
        analysisResults[i] = {
          ...result,
          issues: [
            {
              type: "rule_occurrences",
              ruleId: `ai-${criterion.article}`,
              message: "AI visual verification targets",
              totalOccurrences: aiEvidence.length,
              passedOccurrences: result.status === COMPLIANCE_STATUS.COMPLIANT ? aiEvidence.length : 0,
              failedOccurrences: result.status === COMPLIANCE_STATUS.NON_COMPLIANT ? aiEvidence.length : 0,
              needsReviewOccurrences: result.status === COMPLIANCE_STATUS.NEEDS_REVIEW ? aiEvidence.length : 0,
              evidence: aiEvidence,
            },
          ],
        };
      } else {
        const counts = {
          passedOccurrences: result.status === COMPLIANCE_STATUS.COMPLIANT ? aiEvidence.length : 0,
          failedOccurrences: result.status === COMPLIANCE_STATUS.NON_COMPLIANT ? aiEvidence.length : 0,
          needsReviewOccurrences: result.status === COMPLIANCE_STATUS.NEEDS_REVIEW ? aiEvidence.length : 0,
        };
        analysisResults[i] = {
          ...result,
          issues: baseIssues.map((issue, index) => ({
            ...issue,
            type: "rule_occurrences",
            ruleId: issue.ruleId || `ai-${criterion.article}-${index + 1}`,
            totalOccurrences: aiEvidence.length,
            ...counts,
            evidence: aiEvidence,
          })),
        };
      }
    }

    llmClient.aiCache.flushCache();

    const compliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.COMPLIANT);
    const nonCompliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NON_COMPLIANT);
    const notApplicable = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NOT_APPLICABLE);
    const needsReview = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NEEDS_REVIEW);

    const testMethodCounts = analysisResults.reduce((acc, r) => {
      const method = r.testedBy || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const applicableCount = analysisResults.length - notApplicable.length;
    const complianceRate = applicableCount > 0 ? parseFloat(((compliant.length / applicableCount) * 100).toFixed(1)) : 0;

    const statistics = {
      total: Object.keys(rgaaFlatMapping).length,
      compliant: compliant.length,
      nonCompliant: nonCompliant.length,
      notApplicable: notApplicable.length,
      needsReview: needsReview.length,
      analyzed: analysisResults.length,
      byTestMethod: {
        axeCore: testMethodCounts["axe_core"] || 0,
        ai: testMethodCounts["ai"] || 0,
        elementDetection: testMethodCounts["element_detection"] || 0,
      },
    };

    const totalViolations = results.violations.length;
    const technicalRisk = nonCompliant.length > 0 ? 50000 : 0;
    const legalRiskTotal = technicalRisk + 25000;

    const rawAxeResults = {
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        tags: v.tags,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          impact: n.impact,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      })),
      passes: results.passes.map((p) => ({
        id: p.id,
        impact: p.impact,
        description: p.description,
        help: p.help,
        helpUrl: p.helpUrl,
        tags: p.tags,
        nodes: p.nodes.map((n) => ({
          html: n.html,
          impact: n.impact,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      })),
    };

    return {
      analysisResults,
      statistics,
      rawAxeResults,
      complianceRate,
      totalViolations,
      legalRiskTotal,
      llmAvailable,
    };
  } finally {
    await page.close();
    await context.close();
  }
}

module.exports = { auditPageAtViewport, resolveViewport, VIEWPORTS, DEFAULT_VIEWPORT };
