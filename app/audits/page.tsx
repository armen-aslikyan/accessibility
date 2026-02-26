import Link from 'next/link';
import prisma from '@/lib/prisma';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AuditList } from './AuditList';

export const dynamic = 'force-dynamic';

export default async function AuditsPage() {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">RGAA Accessibility Audits</h1>
            <p className="text-sm text-slate-400 mt-1">RGAA 4.1 compliance monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/audits/new"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              + New Audit
            </Link>
          </div>
        </div>
      </header>

      <AuditList audits={audits} />
    </div>
  );
}
