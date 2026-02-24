import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { transformAuditForUI } from '@/lib/transform-audit';
import AuditDetail from '@/components/AuditDetail';
import AuditStatusBadge from '@/components/AuditStatusBadge';

export const dynamic = 'force-dynamic';

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: { criteria: { orderBy: { article: 'asc' } } },
  });

  if (!audit) notFound();

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
            <p className="font-mono text-indigo-600 font-medium truncate">{audit.url}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Started {new Date(audit.createdAt).toLocaleString()}
            </p>
          </div>
          <AuditStatusBadge status={audit.status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
