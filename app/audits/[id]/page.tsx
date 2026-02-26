import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { transformAuditForUI } from '@/lib/transform-audit';
import { transformSiteAuditForUI } from '@/lib/transform-site-audit';
import AuditDetail from '@/components/AuditDetail';
import AuditStatusBadge from '@/components/AuditStatusBadge';
import SiteAuditDetail from '@/components/SiteAuditDetail';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export const dynamic = 'force-dynamic';

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      criteria: { orderBy: { article: 'asc' } },
      templates: {
        include: {
          viewportResults: {
            include: { criteria: { orderBy: { article: 'asc' } } },
          },
          pages: true,
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!audit) notFound();

  const isSite = audit.mode === 'site';

  // ── Page-mode audit (Quick Check) ─────────────────────────────────────────
  if (!isSite) {
    const auditData =
      audit.status === 'completed' && audit.criteria.length > 0
        ? transformAuditForUI(audit)
        : null;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
            <Link href="/audits" className="text-slate-400 hover:text-slate-600 transition text-sm">
              ← All audits
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-indigo-600 font-medium truncate">{audit.url}</p>
                <span className="flex-shrink-0 text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                  Quick Check · {audit.viewport ?? 'desktop'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Started {new Date(audit.createdAt).toLocaleString()}
              </p>
            </div>
            <LanguageSwitcher />
            <AuditStatusBadge status={audit.status} />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Disclaimer */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
            <span className="font-semibold">Quick Check</span> — This is a single-page audit at{' '}
            <span className="font-mono">{audit.viewport ?? 'desktop'}</span> viewport only. It is not a full
            compliance audit and carries no legal weight.
          </div>

          <AuditDetail
            auditId={audit.id}
            auditUrl={audit.url}
            status={audit.status}
            auditData={auditData}
          />
        </main>
      </div>
    );
  }

  // ── Site-mode audit (Full Site Audit) ────────────────────────────────────
  const siteRgaaData = transformSiteAuditForUI(audit);
  const siteData = {
    id: audit.id,
    url: audit.url,
    status: audit.status,
    errorMessage: audit.errorMessage,
    mode: audit.mode,
    discoveryMethod: audit.discoveryMethod,
    totalDiscovered: audit.totalDiscovered,
    totalTemplates: audit.totalTemplates,
    totalAudited: audit.totalAudited,
    pagesSkipped: audit.pagesSkipped,
    complianceRate: audit.complianceRate,
    legalRiskTotal: audit.legalRiskTotal,
    legalSummary: audit.legalSummary as {
      nonCompliantCriteria: Array<{ article: string; desc: string; level: string }>;
      totalNonCompliant: number;
      overallComplianceRate: number;
    } | null,
    createdAt: audit.createdAt.toISOString(),
    completedAt: audit.completedAt?.toISOString() ?? null,
    templates: audit.templates.map((t) => ({
      id: t.id,
      name: t.name,
      pageCount: t.pageCount,
      representativeUrl: t.representativeUrl,
      examplePaths: t.examplePaths as string[],
      complianceRate: t.complianceRate,
      viewportResults: t.viewportResults.map((vr) => ({
        id: vr.id,
        viewport: vr.viewport,
        width: vr.width,
        height: vr.height,
        url: vr.url,
        complianceRate: vr.complianceRate,
        totalViolations: vr.totalViolations,
        criteria: vr.criteria.map((c) => ({
          article: c.article,
          status: c.status,
          reasoning: c.reasoning,
          issues: c.issues as Array<{ type: string; message: string }> | null,
        })),
      })),
    })),
    rgaaData: siteRgaaData,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
          <Link href="/audits" className="text-slate-400 hover:text-slate-600 transition text-sm">
            ← All audits
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono text-indigo-600 font-medium truncate">{audit.url}</p>
              <span className="flex-shrink-0 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Full Site Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Started {new Date(audit.createdAt).toLocaleString()}
              {audit.completedAt && (
                <span className="ml-2">· Completed {new Date(audit.completedAt).toLocaleString()}</span>
              )}
            </p>
          </div>
          <LanguageSwitcher />
          <AuditStatusBadge status={audit.status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SiteAuditDetail auditId={audit.id} initialData={siteData} />
      </main>
    </div>
  );
}
