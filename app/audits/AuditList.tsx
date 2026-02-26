'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuditStatusBadge from '@/components/AuditStatusBadge';

interface AuditItemProps {
  audit: {
    id: string;
    url: string;
    status: string;
    mode: string;
    viewport: string | null;
    complianceRate: number | null;
    totalDiscovered: number | null;
    totalTemplates: number | null;
    pagesSkipped: number | null;
    createdAt: string | Date;
    completedAt: string | Date | null;
  };
}

function AuditItem({ audit }: AuditItemProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this audit?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/audits/${audit.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete audit');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete audit');
    } finally {
      setDeleting(false);
    }
  };

  const isSite = audit.mode === 'site';

  return (
    <div className="relative group">
      <Link
        href={`/audits/${audit.id}`}
        className={`flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5 hover:shadow-md transition ${
          isSite ? 'hover:border-indigo-200' : 'hover:border-slate-300'
        } ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={`font-mono font-medium truncate ${
                isSite ? 'text-indigo-600 group-hover:text-indigo-700' : 'text-slate-600 group-hover:text-slate-800'
              }`}
            >
              {audit.url}
            </p>
            <span
              className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isSite ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isSite ? 'Full Audit' : `Quick Check · ${audit.viewport ?? 'desktop'}`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{new Date(audit.createdAt).toLocaleString()}</span>
            {isSite && audit.totalDiscovered != null && (
              <span className="text-slate-500">
                {audit.totalDiscovered} pages
                {audit.totalTemplates != null && ` · ${audit.totalTemplates} templates`}
                {(audit.pagesSkipped ?? 0) > 0 && ` · ${audit.pagesSkipped} skipped`}
              </span>
            )}
            {audit.completedAt && (
              <span>· completed {new Date(audit.completedAt).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
          {audit.status === 'completed' && audit.complianceRate != null && (
            <span
              className={`font-black ${isSite ? 'text-2xl' : 'text-lg text-slate-500'} ${
                isSite
                  ? audit.complianceRate > 80
                    ? 'text-emerald-500'
                    : audit.complianceRate > 50
                    ? 'text-orange-500'
                    : 'text-red-500'
                  : ''
              }`}
            >
              {audit.complianceRate.toFixed(1)}%
            </span>
          )}
          <AuditStatusBadge status={audit.status} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Delete audit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
}

export function AuditList({ audits }: { audits: any[] }) {
  const siteAudits = audits.filter((a) => a.mode === 'site');
  const pageAudits = audits.filter((a) => a.mode !== 'site');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* ── Full Site Audits ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-800">Full Site Audits</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {siteAudits.length}
          </span>
        </div>

        {siteAudits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-300 text-6xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No site audits yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
              Run a Full Site Audit to discover all pages, cluster them by structure, and get a
              complete RGAA 4.1 compliance report with legal weight.
            </p>
            <Link
              href="/audits/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              Start a Site Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {siteAudits.map((audit) => (
              <AuditItem key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </section>

      {/* ── Quick Checks ─────────────────────────────────────────────────── */}
      {pageAudits.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800">Quick Checks</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {pageAudits.length}
            </span>
            <span className="text-xs text-slate-400 italic">Single page, no legal weight</span>
          </div>

          <div className="space-y-2">
            {pageAudits.map((audit) => (
              <AuditItem key={audit.id} audit={audit} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state when nothing at all */}
      {audits.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="text-slate-300 text-7xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No audits yet</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Start by running a Full Site Audit to discover and audit all pages of a website for
            RGAA 4.1 compliance.
          </p>
          <Link
            href="/audits/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Start Your First Audit
          </Link>
        </div>
      )}
    </main>
  );
}
