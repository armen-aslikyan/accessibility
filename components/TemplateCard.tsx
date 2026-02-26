'use client';

import { useState } from 'react';
import ViewportComparisonTable from './ViewportComparisonTable';

interface ViewportBadge {
  viewport: string;
  complianceRate: number | null;
  criteria: Array<{
    article: string;
    status: string;
    reasoning: string | null;
    issues: Array<{ type: string; message: string }> | null;
  }>;
}

interface Props {
  name: string;
  pageCount: number;
  representativeUrl: string;
  examplePaths: string[];
  complianceRate: number | null;
  viewportResults: ViewportBadge[];
}

const VIEWPORT_ORDER = ['desktop', 'tablet', 'mobile'];

function ComplianceBadge({ rate, label }: { rate: number | null; label: string }) {
  const value = rate ?? 0;
  const color =
    value >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : value >= 50 ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className={`border rounded-lg px-3 py-2 text-center ${color}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-lg font-black">{rate !== null ? `${rate.toFixed(1)}%` : '—'}</p>
    </div>
  );
}

export default function TemplateCard({
  name,
  pageCount,
  representativeUrl,
  examplePaths,
  complianceRate,
  viewportResults,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const sortedViewports = [...viewportResults].sort(
    (a, b) => VIEWPORT_ORDER.indexOf(a.viewport) - VIEWPORT_ORDER.indexOf(b.viewport)
  );

  // Detect viewport-specific issues
  const viewportIssues: Record<string, string[]> = {};
  for (const vr of sortedViewports) {
    for (const c of vr.criteria) {
      if (c.status !== 'non_compliant') continue;
      const othersFail = sortedViewports
        .filter((v) => v.viewport !== vr.viewport)
        .some((v) => v.criteria.find((cc) => cc.article === c.article)?.status === 'non_compliant');
      if (!othersFail) {
        viewportIssues[vr.viewport] = viewportIssues[vr.viewport] ?? [];
        viewportIssues[vr.viewport].push(c.article);
      }
    }
  }
  const hasViewportDiffs = Object.keys(viewportIssues).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900">{name}</h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </span>
              {hasViewportDiffs && (
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  Viewport differences
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-indigo-600 truncate max-w-sm">{representativeUrl}</p>
          </div>

          {complianceRate !== null && (
            <p
              className={`text-3xl font-black flex-shrink-0 ${
                complianceRate >= 80 ? 'text-emerald-500' : complianceRate >= 50 ? 'text-orange-500' : 'text-red-500'
              }`}
            >
              {complianceRate.toFixed(1)}%
            </p>
          )}
        </div>

        {/* Viewport badges */}
        {sortedViewports.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {sortedViewports.map((vr) => (
              <ComplianceBadge
                key={vr.viewport}
                rate={vr.complianceRate}
                label={vr.viewport.charAt(0).toUpperCase() + vr.viewport.slice(1)}
              />
            ))}
          </div>
        )}

        {/* Viewport-specific issue highlights */}
        {hasViewportDiffs && (
          <div className="mt-4 space-y-1.5">
            {Object.entries(viewportIssues).map(([vp, articles]) => (
              <p key={vp} className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-1.5">
                <span className="font-semibold capitalize">{vp}-only failures:</span>{' '}
                {articles.slice(0, 5).join(', ')}
                {articles.length > 5 && ` +${articles.length - 5} more`}
              </p>
            ))}
          </div>
        )}

        {/* Example paths */}
        {examplePaths.length > 1 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
              Includes pages like
            </p>
            <div className="flex flex-wrap gap-1">
              {examplePaths.slice(0, 5).map((p) => (
                <span key={p} className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {(() => { try { return new URL(p).pathname || '/'; } catch { return p; } })()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expand button */}
        {sortedViewports.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            {expanded ? '▲ Hide criteria breakdown' : '▼ Show full criteria breakdown'}
          </button>
        )}
      </div>

      {/* Expanded comparison table */}
      {expanded && sortedViewports.length > 0 && (
        <div className="border-t border-slate-200 px-6 py-5">
          <ViewportComparisonTable viewportResults={sortedViewports} />
        </div>
      )}
    </div>
  );
}
