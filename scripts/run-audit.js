#!/usr/bin/env node
"use strict";

const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const { auditPageAtViewport } = require("../lib/audit-core.js");
const llmClient = require("../utils/llmClient.js");

const prisma = new PrismaClient();

const [, , auditId, url, viewportArg] = process.argv;

if (!auditId || !url) {
  console.error("Usage: node scripts/run-audit.js <auditId> <url> [viewport]");
  process.exit(1);
}

const BATCH_SIZE = 20;

async function attachElementFixSuggestions(auditId, viewportName, analysisResults, llmAvailable, llmModel) {
  if (!llmAvailable) return analysisResults;

  for (const result of analysisResults) {
    if (result.status !== "non_compliant" && result.status !== "needs_review") continue;
    const evidences = Array.isArray(result.evidence) ? result.evidence : [];

    for (const ev of evidences) {
      if (!ev.elementHash) continue;

      const existing = await prisma.elementFixSuggestion.findFirst({
        where: { auditId, elementHash: ev.elementHash },
        select: { suggestion: true },
      });
      if (existing) {
        ev.aiSuggestion = existing.suggestion;
        continue;
      }

      const html = (ev.elementHtml || "").slice(0, 300);
      const prompt = `You are an accessibility expert. A web element failed the RGAA ${result.criterion} accessibility criterion.

Element HTML: ${html || "(no HTML available)"}
Criterion: ${result.criterion} - ${result.desc || ""}
Issue: ${ev.occurrenceReason || ev.failureSummary || "Accessibility violation"}

Provide a short, concrete fix suggestion (1-2 sentences max). Start directly with the fix, e.g. "Add aria-label=\"...\"" or "Replace <div> with <button>".`;

      try {
        const raw = await llmClient.query(prompt, {
          model: llmModel,
          ollamaOptions: { num_predict: 200, temperature: 0.1 },
        });
        const suggestion = raw.trim().slice(0, 500);
        if (!suggestion) continue;

        ev.aiSuggestion = suggestion;
        await prisma.elementFixSuggestion.create({
          data: {
            auditId,
            article: result.criterion,
            ruleId: ev.axeRuleId || null,
            viewport: viewportName,
            url: ev.pageUrl || "",
            selector: ev.selector || null,
            domPath: ev.domPath || null,
            screenshotPath: ev.screenshotPath || null,
            elementHash: ev.elementHash,
            suggestion,
          },
        });
      } catch {
        // Non-fatal: skip suggestion for this element
      }
    }
  }

  return analysisResults;
}

async function runAudit() {
  let browser;

  try {
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: "running" },
    });

    console.log(`[run-audit] Starting ${viewportArg || "desktop"} audit for: ${url}`);

    browser = await chromium.launch({ headless: true, timeout: 60000 });

    const onProgress = async (completed, total, criterion, result, icon) => {
      console.log(`[run-audit] [${completed}/${total}] ${icon} RGAA ${criterion.article}`);

      // Persist lightweight progress so the UI can show live status for Quick Checks.
      try {
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            statistics: {
              quickProgress: {
                completed,
                total,
                currentCriterion: criterion.article,
              },
            },
          },
        });
      } catch (err) {
        console.error("[run-audit] Failed to update progress:", err);
      }
    };

    const evidenceRootDir = path.join(process.cwd(), "public", "audit-evidence", auditId);
    const evidenceBaseUrl = `/audit-evidence/${auditId}`;

    const phaseLabels = {
      capturing_axe_evidence: "Capturing axe evidence",
      capturing_element_detection_evidence: "Capturing element detection evidence",
      capturing_ai_evidence: "Capturing AI evidence",
    };
    const onPhaseProgress = async (phase) => {
      console.log(`[run-audit] Phase: ${phaseLabels[phase] || phase}`);
      try {
        await prisma.audit.update({
          where: { id: auditId },
          data: { statistics: { quickProgress: { phase, label: phaseLabels[phase] || phase } } },
        });
      } catch {
        // Non-fatal — progress update failure should not stop the audit.
      }
    };

    const { analysisResults, statistics, rawAxeResults, complianceRate, totalViolations, legalRiskTotal, llmAvailable } = await auditPageAtViewport(
      browser,
      url,
      viewportArg || "desktop",
      {
        concurrency: 1,
        llmModel: "mistral:7b-instruct-v0.3-q4_K_M",
        onProgress,
        onPhaseProgress,
        evidenceRootDir,
        evidenceBaseUrl,
        evidenceScope: viewportArg || "desktop",
      },
    );

    const enrichedResults = await attachElementFixSuggestions(
      auditId,
      viewportArg || "desktop",
      analysisResults,
      llmAvailable,
      "mistral:7b-instruct-v0.3-q4_K_M",
    );

    for (let i = 0; i < analysisResults.length; i += BATCH_SIZE) {
      const batch = enrichedResults.slice(i, i + BATCH_SIZE);
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
        status: "completed",
        completedAt: new Date(),
        llmAvailable,
        model: "mistral",
        complianceRate,
        totalViolations,
        legalRiskTotal,
        statistics,
        rawAxeResults,
        viewport: viewportArg || "desktop",
      },
    });

    console.log(`[run-audit] Completed. Compliance: ${complianceRate}% | Non-compliant: ${statistics.nonCompliant}`);
  } catch (err) {
    console.error("[run-audit] Fatal error:", err);
    try {
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: "failed",
          errorMessage: err instanceof Error ? err.message : String(err),
        },
      });
    } catch (dbErr) {
      console.error("[run-audit] Failed to update audit status:", dbErr);
    }
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

runAudit().catch((err) => {
  console.error("[run-audit] Unhandled error:", err);
  process.exit(1);
});
