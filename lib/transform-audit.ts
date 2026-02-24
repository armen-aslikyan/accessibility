import type { Audit, CriterionResult } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js') as {
  rgaaFlatMapping: Record<string, RGAAEntry>;
};

interface RGAAEntry {
  desc: string;
  descEn: string;
  level: string;
  risk: string;
  financial: string;
  brand: string;
  fix: string;
  testMethod: string;
  axeRules: string[];
  tests: string[];
  prompt?: string;
}

export interface CriterionData extends RGAAEntry {
  article: string;
  status: string;
  confidence: number;
  reasoning: string | null;
  issues: Array<{ type: string; message: string; elements?: string[]; impact?: string }>;
  recommendations: string[];
  testedBy: string | null;
  elementCount: number;
}

export interface AuditData {
  meta: {
    version: string;
    generatedAt: string;
    url: string;
    llmAvailable: boolean;
    model: string;
  };
  summary: {
    accessibilityScore: number;
    complianceRate: number;
    totalViolations: number;
    legalRisk: { technical: number; administrative: number; total: number };
  };
  statistics: {
    total: number;
    compliant: number;
    nonCompliant: number;
    notApplicable: number;
    needsReview: number;
    analyzed: number;
    byTestMethod: { axeCore: number; ai: number; elementDetection: number };
  };
  criteria: Record<string, CriterionData>;
}

type AuditWithCriteria = Audit & { criteria: CriterionResult[] };

export function transformAuditForUI(audit: AuditWithCriteria): AuditData {
  const stats = audit.statistics as AuditData['statistics'] | null;
  const totalViolations = audit.totalViolations ?? (stats?.nonCompliant ?? 0);
  const applicable = (stats?.total ?? 0) - (stats?.notApplicable ?? 0);
  const complianceRate =
    audit.complianceRate ??
    (applicable > 0
      ? parseFloat(((stats?.compliant ?? 0) / applicable * 100).toFixed(1))
      : 0);
  const technical = totalViolations > 0 ? 50000 : 0;
  const administrative = 25000;

  const criteria: Record<string, CriterionData> = {};
  for (const result of audit.criteria) {
    const mapping = (rgaaFlatMapping[result.article] ?? {}) as RGAAEntry;
    criteria[result.article] = {
      ...mapping,
      article: result.article,
      status: result.status,
      confidence: result.confidence,
      reasoning: result.reasoning,
      issues: (result.issues as CriterionData['issues']) ?? [],
      recommendations: (result.recommendations as string[]) ?? [],
      testedBy: result.testedBy,
      elementCount: result.elementCount,
    };
  }

  return {
    meta: {
      version: '2.0.0',
      generatedAt: audit.completedAt?.toISOString() ?? audit.createdAt.toISOString(),
      url: audit.url,
      llmAvailable: audit.llmAvailable,
      model: audit.model ?? 'unknown',
    },
    summary: {
      accessibilityScore: Math.max(0, 100 - ((stats?.nonCompliant ?? 0) * 3)),
      complianceRate,
      totalViolations,
      legalRisk: { technical, administrative, total: technical + administrative },
    },
    statistics: stats ?? {
      total: 106,
      compliant: 0,
      nonCompliant: 0,
      notApplicable: 0,
      needsReview: 0,
      analyzed: 0,
      byTestMethod: { axeCore: 0, ai: 0, elementDetection: 0 },
    },
    criteria,
  };
}
