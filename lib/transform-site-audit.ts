import type { AuditData, CriterionData } from '@/lib/transform-audit';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js') as {
  rgaaFlatMapping: Record<string, {
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
  }>;
};

type SiteCriterion = {
  article: string;
  status: string;
  reasoning: string | null;
  issues: Array<{ type: string; message: string; elements?: string[]; impact?: string }> | null;
};

type SiteViewport = {
  viewport: 'desktop' | 'tablet' | 'mobile';
  criteria: SiteCriterion[];
};

type SiteTemplate = {
  viewportResults: SiteViewport[];
};

type SiteAuditLike = {
  url: string;
  model: string | null;
  llmAvailable: boolean;
  completedAt: Date | null;
  createdAt: Date;
  templates: SiteTemplate[];
};

const STATUS_ORDER: Record<string, number> = {
  non_compliant: 4,
  needs_review: 3,
  compliant: 2,
  not_applicable: 1,
};

function getWorstStatus(statuses: string[]): string {
  if (statuses.length === 0) return 'not_applicable';
  return statuses.reduce((worst, s) => (STATUS_ORDER[s] > STATUS_ORDER[worst] ? s : worst), 'not_applicable');
}

export function transformSiteAuditForUI(audit: SiteAuditLike): AuditData {
  const observations = new Map<string, Array<SiteCriterion & { viewport: 'desktop' | 'tablet' | 'mobile' }>>();

  for (const template of audit.templates) {
    for (const viewport of template.viewportResults) {
      for (const c of viewport.criteria) {
        if (!observations.has(c.article)) observations.set(c.article, []);
        observations.get(c.article)!.push({ ...c, viewport: viewport.viewport });
      }
    }
  }

  const criteria: Record<string, CriterionData> = {};
  let compliant = 0;
  let nonCompliant = 0;
  let notApplicable = 0;
  let needsReview = 0;

  for (const [article, mapping] of Object.entries(rgaaFlatMapping)) {
    const seen = observations.get(article) ?? [];
    const statuses = seen.map((s) => s.status);
    const finalStatus = getWorstStatus(statuses);
    const primary = seen.find((s) => s.status === finalStatus) ?? seen[0] ?? null;

    const issueMap = new Map<string, { type: string; message: string; elements?: string[]; impact?: string }>();
    for (const obs of seen) {
      for (const issue of obs.issues ?? []) {
        if (issue?.message && !issueMap.has(issue.message)) issueMap.set(issue.message, issue);
      }
    }

    const issues = [...issueMap.values()];
    const viewportBreakdown: CriterionData['viewportBreakdown'] = {};
    for (const viewport of ['desktop', 'tablet', 'mobile'] as const) {
      const byViewport = seen.filter((s) => s.viewport === viewport);
      if (byViewport.length === 0) continue;
      const vpStatus = getWorstStatus(byViewport.map((s) => s.status));
      const vpPrimary = byViewport.find((s) => s.status === vpStatus) ?? byViewport[0];
      const vpIssueMap = new Map<string, { type: string; message: string; elements?: string[]; impact?: string }>();
      for (const obs of byViewport) {
        for (const issue of obs.issues ?? []) {
          if (issue?.message && !vpIssueMap.has(issue.message)) vpIssueMap.set(issue.message, issue);
        }
      }
      viewportBreakdown[viewport] = {
        status: vpStatus,
        reasoning: vpPrimary?.reasoning ?? null,
        issues: [...vpIssueMap.values()],
      };
    }
    const recommendations = mapping.fix ? [mapping.fix] : [];
    const confidence =
      finalStatus === 'non_compliant' ? 90 :
      finalStatus === 'compliant' ? 85 :
      finalStatus === 'needs_review' ? 60 : 100;

    criteria[article] = {
      ...mapping,
      article,
      status: finalStatus,
      confidence,
      reasoning: primary?.reasoning ?? null,
      issues,
      recommendations,
      testedBy: 'multi_viewport',
      elementCount: -1,
      viewportBreakdown,
    };

    if (finalStatus === 'compliant') compliant++;
    else if (finalStatus === 'non_compliant') nonCompliant++;
    else if (finalStatus === 'needs_review') needsReview++;
    else notApplicable++;
  }

  const total = Object.keys(rgaaFlatMapping).length;
  const analyzed = total - notApplicable;
  const complianceRate = analyzed > 0 ? parseFloat(((compliant / analyzed) * 100).toFixed(1)) : 0;
  const technical = nonCompliant > 0 ? 50000 : 0;
  const administrative = 25000;

  return {
    meta: {
      version: '2.0.0-site',
      generatedAt: audit.completedAt?.toISOString() ?? audit.createdAt.toISOString(),
      url: audit.url,
      llmAvailable: audit.llmAvailable,
      model: audit.model ?? 'site-aggregate',
    },
    summary: {
      accessibilityScore: Math.max(0, 100 - (nonCompliant * 3)),
      complianceRate,
      totalViolations: nonCompliant,
      legalRisk: { technical, administrative, total: technical + administrative },
    },
    statistics: {
      total,
      compliant,
      nonCompliant,
      notApplicable,
      needsReview,
      analyzed,
      byTestMethod: { axeCore: 0, ai: 0, elementDetection: 0 },
    },
    criteria,
  };
}
