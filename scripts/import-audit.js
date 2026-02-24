#!/usr/bin/env node
'use strict';

/**
 * Import an old audit JSON (v2 format from exportAuditData.js) into the database.
 * Usage: node scripts/import-audit.js <path-to-audit.json>
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const [, , filePath] = process.argv;

if (!filePath) {
  console.error('Usage: node scripts/import-audit.js <path-to-audit.json>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

async function importAudit() {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const { meta, summary, statistics, criteria } = raw;

  if (!meta || !criteria) {
    console.error('Invalid audit JSON: missing meta or criteria fields');
    process.exit(1);
  }

  console.log(`Importing audit for: ${meta.url}`);
  console.log(`  Date: ${meta.generatedAt}`);
  console.log(`  Criteria: ${Object.keys(criteria).length}`);

  const audit = await prisma.audit.create({
    data: {
      url: meta.url,
      status: 'completed',
      model: meta.model || null,
      llmAvailable: meta.llmAvailable ?? false,
      complianceRate: (() => {
        if (summary?.complianceRate != null) return summary.complianceRate;
        const applicable = (statistics?.total ?? 0) - (statistics?.notApplicable ?? 0);
        return applicable > 0
          ? parseFloat(((statistics.compliant / applicable) * 100).toFixed(1))
          : null;
      })(),
      totalViolations: summary?.totalViolations ?? statistics?.nonCompliant ?? null,
      legalRiskTotal: summary?.legalRisk?.total ?? null,
      statistics: statistics ?? null,
      rawAxeResults: raw.violations ? { violations: raw.violations } : null,
      completedAt: meta.generatedAt ? new Date(meta.generatedAt) : new Date(),
      createdAt: meta.generatedAt ? new Date(meta.generatedAt) : new Date(),
    },
  });

  console.log(`Created audit record: ${audit.id}`);

  const criteriaEntries = Object.entries(criteria);
  const BATCH_SIZE = 20;

  for (let i = 0; i < criteriaEntries.length; i += BATCH_SIZE) {
    const batch = criteriaEntries.slice(i, i + BATCH_SIZE);
    await prisma.criterionResult.createMany({
      data: batch.map(([article, c]) => ({
        auditId: audit.id,
        article,
        status: c.status || 'needs_review',
        confidence: c.confidence ?? 0,
        reasoning: c.reasoning ?? null,
        issues: c.issues ?? [],
        recommendations: c.recommendations ?? [],
        testedBy: c.testedBy ?? null,
        elementCount: c.elementCount ?? -1,
      })),
    });
    process.stdout.write(`  Written ${Math.min(i + BATCH_SIZE, criteriaEntries.length)}/${criteriaEntries.length} criteria\r`);
  }

  console.log(`\n✅ Import complete. Audit ID: ${audit.id}`);
  console.log(`   View at: http://localhost:3001/audits/${audit.id}`);
}

importAudit()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
