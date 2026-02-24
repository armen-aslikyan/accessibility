#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { PrismaClient } = require('@prisma/client');
const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js');
const llmClient = require('../utils/llmClient.js');

const { COMPLIANCE_STATUS } = llmClient;
const CONCURRENCY = 2;
const PREFERRED_MODEL = 'mistral';

const prisma = new PrismaClient();

const [, , auditId, url] = process.argv;

if (!auditId || !url) {
  console.error('Usage: node scripts/run-audit.js <auditId> <url>');
  process.exit(1);
}

async function runAudit() {
  let browser;

  try {
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'running' },
    });

    console.log(`[run-audit] Starting audit for: ${url}`);

    browser = await chromium.launch({ headless: true, timeout: 60000 });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.log('[run-audit] Page load timeout, continuing with partial content...');
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
    const cacheStats = llmClient.aiCache.getCacheStats();
    console.log(
      `[run-audit] Cache: ${cacheStats.totalEntries} entries (${(cacheStats.size / 1024).toFixed(2)} KB)`
    );

    let analysisResults = [];

    if (llmAvailable) {
      const onProgress = (completed, total, criterion, result) => {
        const icons = {
          [COMPLIANCE_STATUS.COMPLIANT]: 'OK',
          [COMPLIANCE_STATUS.NON_COMPLIANT]: 'FAIL',
          [COMPLIANCE_STATUS.NOT_APPLICABLE]: 'N/A',
          [COMPLIANCE_STATUS.NEEDS_REVIEW]: 'REVIEW',
        };
        console.log(
          `[run-audit] [${completed}/${total}] ${icons[result.status] || '?'} RGAA ${criterion.article}`
        );
      };

      analysisResults = await llmClient.analyzeAllWithStatus(
        allCriteria,
        { url, html: pageHTML, useCache: true, model: PREFERRED_MODEL },
        violationsByRule,
        { concurrency: CONCURRENCY, onProgress }
      );
    } else {
      console.log('[run-audit] LLM not available. Running element detection only...');
      const applicabilityMap = llmClient.htmlExtractor.batchCheckApplicability(
        pageHTML,
        allCriteria
      );

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
    const nonCompliant = analysisResults.filter(
      (r) => r.status === COMPLIANCE_STATUS.NON_COMPLIANT
    );
    const notApplicable = analysisResults.filter(
      (r) => r.status === COMPLIANCE_STATUS.NOT_APPLICABLE
    );
    const needsReview = analysisResults.filter(
      (r) => r.status === COMPLIANCE_STATUS.NEEDS_REVIEW
    );

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

    // Write criteria results in batches to avoid overwhelming the DB
    const BATCH_SIZE = 20;
    for (let i = 0; i < analysisResults.length; i += BATCH_SIZE) {
      const batch = analysisResults.slice(i, i + BATCH_SIZE);
      await prisma.criterionResult.createMany({
        data: batch.map((r) => ({
          auditId,
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

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        llmAvailable,
        model: PREFERRED_MODEL,
        complianceRate,
        totalViolations,
        legalRiskTotal,
        statistics,
        rawAxeResults,
      },
    });

    console.log(
      `[run-audit] Completed. Compliance: ${complianceRate}% | Non-compliant: ${nonCompliant.length}`
    );
  } catch (err) {
    console.error('[run-audit] Fatal error:', err);
    try {
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : String(err),
        },
      });
    } catch (dbErr) {
      console.error('[run-audit] Failed to update audit status:', dbErr);
    }
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

runAudit().catch((err) => {
  console.error('[run-audit] Unhandled error:', err);
  process.exit(1);
});
