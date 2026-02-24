import Link from 'next/link';
import prisma from '@/lib/prisma';
import AuditStatusBadge from '@/components/AuditStatusBadge';

export const dynamic = 'force-dynamic';

export default async function AuditsPage() {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      status: true,
      complianceRate: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">RGAA Accessibility Audits</h1>
            <p className="text-sm text-slate-400 mt-1">RGAA 4.1 compliance monitoring</p>
          </div>
          <Link
            href="/audits/new"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            + New Audit
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {audits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="text-slate-300 text-7xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No audits yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Start by auditing a website for RGAA 4.1 compliance. The audit checks all 106
              RGAA criteria using axe-core and AI analysis.
            </p>
            <Link
              href="/audits/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Start Your First Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => (
              <Link
                key={audit.id}
                href={`/audits/${audit.id}`}
                className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5 hover:shadow-md hover:border-indigo-200 transition group"
              >
                <div className="min-w-0">
                  <p className="font-mono text-indigo-600 font-medium truncate group-hover:text-indigo-700">
                    {audit.url}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(audit.createdAt).toLocaleString()}
                    {audit.completedAt && (
                      <span className="ml-2">
                        · completed {new Date(audit.completedAt).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  {audit.status === 'completed' && audit.complianceRate !== null && (
                    <span
                      className={`text-2xl font-black ${
                        audit.complianceRate > 80
                          ? 'text-emerald-500'
                          : audit.complianceRate > 50
                          ? 'text-orange-500'
                          : 'text-red-500'
                      }`}
                    >
                      {audit.complianceRate.toFixed(1)}%
                    </span>
                  )}
                  <AuditStatusBadge status={audit.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
