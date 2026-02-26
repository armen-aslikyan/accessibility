#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { auditPageAtViewport } = require('../lib/audit-core.js');

const prisma = new PrismaClient();

const [, , auditId, url, viewportArg] = process.argv;

if (!auditId || !url) {
  console.error('Usage: node scripts/run-audit.js <auditId> <url> [viewport]');
  process.exit(1);
}

const BATCH_SIZE = 20;

async function runAudit() {
  let browser;

  try {
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'running' },
    });

    console.log(`[run-audit] Starting ${viewportArg || 'desktop'} audit for: ${url}`);

    browser = await chromium.launch({ headless: true, timeout: 60000 });

    const onProgress = (completed, total, criterion, result, icon) => {
      console.log(`[run-audit] [${completed}/${total}] ${icon} RGAA ${criterion.article}`);
    };

    const { analysisResults, statistics, rawAxeResults, complianceRate, totalViolations, legalRiskTotal, llmAvailable } =
      await auditPageAtViewport(browser, url, viewportArg || 'desktop', {
        concurrency: 1,
        llmModel: 'mistral:7b-instruct-v0.3-q4_K_M',
        onProgress,
      });

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
        model: 'mistral',
        complianceRate,
        totalViolations,
        legalRiskTotal,
        statistics,
        rawAxeResults,
        viewport: viewportArg || 'desktop',
      },
    });

    console.log(
      `[run-audit] Completed. Compliance: ${complianceRate}% | Non-compliant: ${statistics.nonCompliant}`
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
