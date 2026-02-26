'use strict';

const AxeBuilder = require('@axe-core/playwright').default;
const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js');
const llmClient = require('../utils/llmClient.js');

const { COMPLIANCE_STATUS } = llmClient;

const VIEWPORTS = {
  desktop: { name: 'desktop', width: 1920, height: 1080 },
  tablet:  { name: 'tablet',  width: 768,  height: 1024 },
  mobile:  { name: 'mobile',  width: 375,  height: 812  },
};

const DEFAULT_VIEWPORT = VIEWPORTS.desktop;

/**
 * Resolve a viewport config from a name string or object.
 * @param {string|object|undefined} viewport
 * @returns {{ name: string, width: number, height: number }}
 */
function resolveViewport(viewport) {
  if (!viewport) return DEFAULT_VIEWPORT;
  if (typeof viewport === 'object') return viewport;
  return VIEWPORTS[viewport] ?? DEFAULT_VIEWPORT;
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
  const { concurrency = 2, llmModel = 'mistral:7b-instruct-v0.3-q4_K_M', onProgress = null } = options;

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.log(`[audit-core] Page load timeout for ${url}, continuing with partial content...`);
      } else {
        throw err;
      }
    }

    await page.waitForTimeout(2000);

    const pageHTML = await page.content();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const violationsByRule = {};
    results.violations.forEach((v) => {
      violationsByRule[v.id] = v;
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
              [COMPLIANCE_STATUS.COMPLIANT]: 'OK',
              [COMPLIANCE_STATUS.NON_COMPLIANT]: 'FAIL',
              [COMPLIANCE_STATUS.NOT_APPLICABLE]: 'N/A',
              [COMPLIANCE_STATUS.NEEDS_REVIEW]: 'REVIEW',
            };
            onProgress(completed, total, criterion, result, icons[result.status] || '?');
          }
        : null;

      analysisResults = await llmClient.analyzeAllWithStatus(
        allCriteria,
        { url, html: pageHTML, useCache: true, model: llmModel },
        violationsByRule,
        { concurrency, onProgress: progressCb }
      );
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
            testedBy: 'element_detection',
          });
        } else if (violations.length > 0) {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NON_COMPLIANT,
            confidence: 95,
            reasoning: `Automated testing detected ${violations.length} violation(s)`,
            issues: violations.map((v) => ({ type: 'violation', message: v.help })),
            recommendations: [criterion.fix],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: 'axe_core',
          });
        } else {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NEEDS_REVIEW,
            confidence: 0,
            reasoning: 'LLM not available - manual review required',
            issues: [],
            recommendations: [],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: 'none',
          });
        }
      }
    }

    llmClient.aiCache.flushCache();

    const compliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.COMPLIANT);
    const nonCompliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NON_COMPLIANT);
    const notApplicable = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NOT_APPLICABLE);
    const needsReview = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NEEDS_REVIEW);

    const testMethodCounts = analysisResults.reduce((acc, r) => {
      const method = r.testedBy || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const applicableCount = analysisResults.length - notApplicable.length;
    const complianceRate =
      applicableCount > 0
        ? parseFloat(((compliant.length / applicableCount) * 100).toFixed(1))
        : 0;

    const statistics = {
      total: Object.keys(rgaaFlatMapping).length,
      compliant: compliant.length,
      nonCompliant: nonCompliant.length,
      notApplicable: notApplicable.length,
      needsReview: needsReview.length,
      analyzed: analysisResults.length,
      byTestMethod: {
        axeCore: testMethodCounts['axe_core'] || 0,
        ai: testMethodCounts['ai'] || 0,
        elementDetection: testMethodCounts['element_detection'] || 0,
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
