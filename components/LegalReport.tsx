'use client';

interface NonCompliantCriterion {
  article: string;
  desc: string;
  level: string;
}

interface LegalSummaryData {
  nonCompliantCriteria: NonCompliantCriterion[];
  totalNonCompliant: number;
  overallComplianceRate: number;
}

interface Props {
  baseUrl: string;
  legalSummary: LegalSummaryData;
  legalRiskTotal: number | null;
  auditDate: string;
}

export default function LegalReport({ baseUrl, legalSummary, legalRiskTotal, auditDate }: Props) {
  const { nonCompliantCriteria, totalNonCompliant, overallComplianceRate } = legalSummary;

  const complianceColor =
    overallComplianceRate >= 80 ? 'text-emerald-600'
    : overallComplianceRate >= 50 ? 'text-orange-600'
    : 'text-red-600';

  const levelGroups: Record<string, NonCompliantCriterion[]> = {};
  for (const c of nonCompliantCriteria) {
    const lvl = c.level || 'Unknown';
    levelGroups[lvl] = levelGroups[lvl] ?? [];
    levelGroups[lvl].push(c);
  }

  return (
    <div className="space-y-6">
      {/* Legal disclaimer banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">Legal Compliance Document</p>
        <p className="text-xs text-amber-700">
          This report summarises accessibility non-conformities regardless of the viewport or page
          template in which they were detected. An issue is an issue. This document can be used as
          evidence for RGAA 4.1 accessibility compliance assessment.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4">
          <p className="text-white font-bold text-lg">RGAA 4.1 Compliance Summary</p>
          <p className="text-slate-400 text-sm mt-0.5">{baseUrl}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Overall Compliance
            </p>
            <p className={`text-5xl font-black ${complianceColor}`}>
              {overallComplianceRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Weighted across all templates</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Non-Compliant Criteria
            </p>
            <p className="text-5xl font-black text-red-600">{totalNonCompliant}</p>
            <p className="text-xs text-slate-400 mt-1">Unique issues (all viewports, all pages)</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Audit Date
            </p>
            <p className="text-xl font-bold text-slate-700 mt-2">
              {new Date(auditDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Automated RGAA 4.1 audit</p>
          </div>
        </div>
      </div>

      {/* Legal risk */}
      {legalRiskTotal != null && legalRiskTotal > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-red-600 px-6 py-3">
            <p className="text-white text-xs font-bold uppercase tracking-wider">
              Estimated Legal Risk
            </p>
          </div>
          <div className="p-6 flex items-center gap-6">
            <div>
              <p className="text-6xl font-black text-red-600 tracking-tighter">
                €{legalRiskTotal.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400 mt-2 italic">
                Indicative estimate based on RGAA non-conformities (not legal advice)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Non-compliant criteria list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            Non-Compliant Criteria
            {totalNonCompliant > 0 && (
              <span className="ml-2 text-sm font-normal text-red-600">
                ({totalNonCompliant} issues found)
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Each criterion below was found non-compliant on at least one audited page or viewport.
          </p>
        </div>

        {totalNonCompliant === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-bold text-emerald-600">No non-compliant criteria found</p>
            <p className="text-sm text-slate-500 mt-1">All audited criteria passed across all viewports.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {['A', 'AA', 'AAA'].map((level) => {
              const items = levelGroups[level];
              if (!items?.length) return null;
              return (
                <div key={level} className="px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Level {level} — {items.length} {items.length === 1 ? 'criterion' : 'criteria'}
                  </p>
                  <div className="space-y-2">
                    {items.map((c) => (
                      <div key={c.article} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-14 text-center text-xs font-bold font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {c.article}
                        </span>
                        <p className="text-sm text-slate-700">{c.desc || `Criterion ${c.article}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Any unlevel'd items */}
            {Object.entries(levelGroups)
              .filter(([lvl]) => !['A', 'AA', 'AAA'].includes(lvl))
              .map(([lvl, items]) => (
                <div key={lvl} className="px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {lvl} — {items.length} criteria
                  </p>
                  <div className="space-y-2">
                    {items.map((c) => (
                      <div key={c.article} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-14 text-center text-xs font-bold font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {c.article}
                        </span>
                        <p className="text-sm text-slate-700">{c.desc || `Criterion ${c.article}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
