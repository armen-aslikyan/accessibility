'use client';

import { useState } from 'react';

interface CriterionRow {
  article: string;
  desc: string;
  level: string;
  byViewport: Record<string, string>; // viewport -> status
}

interface ViewportResultData {
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
  viewportResults: ViewportResultData[];
}

const STATUS_CLASSES: Record<string, string> = {
  compliant: 'bg-emerald-100 text-emerald-700',
  non_compliant: 'bg-red-100 text-red-700',
  not_applicable: 'bg-slate-100 text-slate-500',
  needs_review: 'bg-orange-100 text-orange-700',
};

const STATUS_SHORT: Record<string, string> = {
  compliant: 'Pass',
  non_compliant: 'Fail',
  not_applicable: 'N/A',
  needs_review: 'Review',
};

const VIEWPORT_ICONS: Record<string, string> = {
  desktop: '🖥',
  tablet: '📱',
  mobile: '📱',
};

function getRowClass(byViewport: Record<string, string>): string {
  const statuses = Object.values(byViewport);
  if (statuses.every((s) => s === 'non_compliant')) return 'bg-red-50';
  if (statuses.some((s) => s === 'non_compliant')) return 'bg-orange-50';
  if (statuses.every((s) => s === 'compliant')) return '';
  return '';
}

export default function ViewportComparisonTable({ viewportResults }: Props) {
  const [filter, setFilter] = useState<'all' | 'issues' | 'viewport-diff'>('issues');

  if (!viewportResults.length) return null;

  const viewports = viewportResults.map((vr) => vr.viewport);

  // Build unified row list
  const articleMap = new Map<string, CriterionRow>();
  for (const vr of viewportResults) {
    for (const c of vr.criteria) {
      if (!articleMap.has(c.article)) {
        articleMap.set(c.article, {
          article: c.article,
          desc: '',
          level: '',
          byViewport: {},
        });
      }
      articleMap.get(c.article)!.byViewport[vr.viewport] = c.status;
    }
  }

  const rows = [...articleMap.values()].sort((a, b) => {
    const [aMaj, aMin] = a.article.split('.').map(Number);
    const [bMaj, bMin] = b.article.split('.').map(Number);
    return aMaj - bMaj || aMin - bMin;
  });

  const filtered = rows.filter((row) => {
    const statuses = Object.values(row.byViewport);
    if (filter === 'issues') return statuses.some((s) => s === 'non_compliant');
    if (filter === 'viewport-diff') {
      const unique = new Set(statuses.filter((s) => s !== 'not_applicable'));
      return unique.size > 1;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-2 text-xs">
        {(['issues', 'viewport-diff', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'issues' && 'Failures only'}
            {f === 'viewport-diff' && 'Viewport differences'}
            {f === 'all' && 'All criteria'}
          </button>
        ))}
        <span className="ml-auto text-slate-400 self-center">{filtered.length} criteria</span>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">No matching criteria.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-20">Criterion</th>
                {viewports.map((vp) => (
                  <th key={vp} className="text-center px-3 py-3 font-semibold text-slate-600 w-24">
                    {VIEWPORT_ICONS[vp]} {vp.charAt(0).toUpperCase() + vp.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.article} className={getRowClass(row.byViewport)}>
                  <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{row.article}</td>
                  {viewports.map((vp) => {
                    const status = row.byViewport[vp] ?? 'needs_review';
                    return (
                      <td key={vp} className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLASSES[status] ?? ''}`}
                        >
                          {STATUS_SHORT[status] ?? status}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
