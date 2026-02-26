'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditData, CriterionData } from '@/lib/transform-audit';

const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non_compliant',
  NOT_APPLICABLE: 'not_applicable',
  NEEDS_REVIEW: 'needs_review',
} as const;

type ComplianceStatus = (typeof COMPLIANCE_STATUS)[keyof typeof COMPLIANCE_STATUS];
type ViewportKey = 'all' | 'desktop' | 'tablet' | 'mobile';

const COLORS: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  slate: 'bg-slate-100 text-slate-800',
};

function StatBadge({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className={`${COLORS[color]} px-4 py-2 rounded-lg flex items-center gap-2`}>
      <span>{icon}</span>
      <span className="font-bold">{value}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function CriterionCard({ criterion }: { criterion: CriterionData & { article: string; preliminaryStatus?: string } }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const testedByLabel = (() => {
    const map: Record<string, string> = {
      axe_core: t('rgaa.testedBy.axeCore'),
      ai: t('rgaa.testedBy.ai'),
      element_detection: t('rgaa.testedBy.elementDetection'),
      multi_viewport: t('rgaa.testedBy.multiViewport'),
      desktop: t('rgaa.viewports.desktop'),
      tablet: t('rgaa.viewports.tablet'),
      mobile: t('rgaa.viewports.mobile'),
      error: t('rgaa.testedBy.error'),
    };
    return criterion.testedBy ? (map[criterion.testedBy] ?? criterion.testedBy.replace(/_/g, ' ')) : null;
  })();

  const statusConfig: Record<ComplianceStatus, { labelKey: string; color: string; icon: string }> = {
    [COMPLIANCE_STATUS.COMPLIANT]: {
      labelKey: 'rgaa.statusLabels.compliant',
      color: 'bg-emerald-100 text-emerald-800',
      icon: '✅',
    },
    [COMPLIANCE_STATUS.NON_COMPLIANT]: {
      labelKey: 'rgaa.statusLabels.nonCompliant',
      color: 'bg-red-100 text-red-800',
      icon: '❌',
    },
    [COMPLIANCE_STATUS.NOT_APPLICABLE]: {
      labelKey: 'rgaa.statusLabels.notApplicable',
      color: 'bg-slate-100 text-slate-600',
      icon: '⊘',
    },
    [COMPLIANCE_STATUS.NEEDS_REVIEW]: {
      labelKey: 'rgaa.statusLabels.needsReview',
      color: 'bg-orange-100 text-orange-800',
      icon: '🔍',
    },
  };

  const statusInfo =
    statusConfig[criterion.status as ComplianceStatus] ??
    statusConfig[COMPLIANCE_STATUS.NEEDS_REVIEW];

  const description =
    i18n.language === 'en'
      ? criterion.descEn || criterion.desc || ''
      : criterion.desc || criterion.descEn || '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-indigo-600">
                {criterion.article}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.icon} {t(statusInfo.labelKey)}
              </span>
              {criterion.level && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                  {criterion.level}
                </span>
              )}
              {testedByLabel && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  {testedByLabel}
                </span>
              )}
              {criterion.confidence !== undefined && criterion.confidence > 0 && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {criterion.confidence}% {t('rgaa.confidence')}
                </span>
              )}
              {criterion.status === COMPLIANCE_STATUS.NEEDS_REVIEW && criterion.preliminaryStatus && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    criterion.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {criterion.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT
                    ? `↑ ${t('rgaa.likelyCompliant')}`
                    : `↓ ${t('rgaa.likelyNonCompliant')}`}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700">{description}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition" aria-label="Toggle details">
            <span
              className={`transform transition-transform inline-block ${expanded ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-4 space-y-4 bg-slate-50">
          {criterion.reasoning && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.reasoning')}</h4>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-700">{criterion.reasoning}</p>
              </div>
            </div>
          )}

          {criterion.issues && criterion.issues.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                {t('rgaa.issuesDetected')} ({criterion.issues.length})
              </h4>
              <div className="space-y-2">
                {criterion.issues.map((issue, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-red-200">
                    <p className="text-sm font-medium text-slate-900">{issue.message}</p>
                    {issue.elements && issue.elements.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">{t('rgaa.affectedElements')}:</p>
                        {issue.elements.slice(0, 3).map((el, i) => (
                          <code
                            key={i}
                            className="block text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto"
                          >
                            {el}
                          </code>
                        ))}
                        {issue.elements.length > 3 && (
                          <p className="text-xs text-slate-500 mt-1">
                            +{issue.elements.length - 3} more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {criterion.recommendations && criterion.recommendations.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.recommendations')}</h4>
              <ul className="list-disc list-inside space-y-1">
                {criterion.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {criterion.fix && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.howToFix')}</h4>
              <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                <p className="text-sm text-emerald-800">{criterion.fix}</p>
              </div>
            </div>
          )}

          {criterion.risk && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">{t('rgaa.riskLevel')}</p>
                <p
                  className={`font-bold ${
                    criterion.risk === 'Critical'
                      ? 'text-red-600'
                      : criterion.risk === 'High'
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {criterion.risk}
                </p>
              </div>
              {criterion.financial && (
                <div className="bg-white p-3 rounded border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">{t('rgaa.financialImpact')}</p>
                  <p className="text-sm text-slate-700">{criterion.financial}</p>
                </div>
              )}
              {criterion.brand && (
                <div className="bg-white p-3 rounded border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">{t('rgaa.brandImpact')}</p>
                  <p className="text-sm text-slate-700">{criterion.brand}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RGAAReport({ data }: { data: AuditData }) {
  const { t } = useTranslation();
  const { criteria } = data;
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewportFilter, setViewportFilter] = useState<ViewportKey>('all');

  const criteriaArray = Object.values(criteria) as (CriterionData & { article: string; preliminaryStatus?: string })[];
  const hasViewportBreakdown = criteriaArray.some((c) => c.viewportBreakdown && Object.keys(c.viewportBreakdown).length > 0);

  const viewportAdjustedCriteria = criteriaArray.map((criterion) => {
    if (!hasViewportBreakdown || viewportFilter === 'all' || !criterion.viewportBreakdown?.[viewportFilter]) {
      return criterion;
    }
    const vp = criterion.viewportBreakdown[viewportFilter];
    return {
      ...criterion,
      status: vp.status,
      reasoning: vp.reasoning,
      issues: vp.issues,
      testedBy: viewportFilter,
    };
  });

  const derivedStatistics = viewportAdjustedCriteria.reduce(
    (acc, c) => {
      acc.total += 1;
      if (c.status === COMPLIANCE_STATUS.COMPLIANT) acc.compliant += 1;
      else if (c.status === COMPLIANCE_STATUS.NON_COMPLIANT) acc.nonCompliant += 1;
      else if (c.status === COMPLIANCE_STATUS.NEEDS_REVIEW) acc.needsReview += 1;
      else acc.notApplicable += 1;
      return acc;
    },
    { total: 0, compliant: 0, nonCompliant: 0, notApplicable: 0, needsReview: 0 }
  );

  const filteredCriteria = viewportAdjustedCriteria.filter((criterion) => {
    const searchText = criterion.desc || criterion.descEn || '';
    const matchesSearch =
      criterion.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchText.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && criterion.status === filterStatus;
  });

  const filters = [
    { id: 'all', icon: '📋' },
    { id: 'compliant', icon: '✅' },
    { id: 'non_compliant', icon: '❌' },
    { id: 'not_applicable', icon: '⊘' },
    { id: 'needs_review', icon: '🔍' },
  ] as const;

  const filterLabel = (id: string) => {
    const map: Record<string, string> = {
      all: t('rgaa.all'),
      compliant: t('rgaa.compliant'),
      non_compliant: t('rgaa.nonCompliant'),
      not_applicable: t('rgaa.notApplicable'),
      needs_review: t('rgaa.needsReview'),
    };
    return map[id] ?? id;
  };
  const viewportLabel = (id: ViewportKey) => {
    const map: Record<ViewportKey, string> = {
      all: t('rgaa.viewports.all'),
      desktop: t('rgaa.viewports.desktop'),
      tablet: t('rgaa.viewports.tablet'),
      mobile: t('rgaa.viewports.mobile'),
    };
    return map[id];
  };
  const viewportTabs: ViewportKey[] = ['all', 'desktop', 'tablet', 'mobile'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('rgaa.title')}</h2>
        <div className="flex flex-wrap gap-4">
          <StatBadge label={t('rgaa.compliant')} value={derivedStatistics.compliant || 0} color="emerald" icon="✅" />
          <StatBadge label={t('rgaa.nonCompliant')} value={derivedStatistics.nonCompliant || 0} color="red" icon="❌" />
          <StatBadge label={t('rgaa.notApplicable')} value={derivedStatistics.notApplicable || 0} color="slate" icon="⊘" />
          <StatBadge label={t('rgaa.needsReview')} value={derivedStatistics.needsReview || 0} color="orange" icon="🔍" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col gap-4">
          {hasViewportBreakdown && (
            <div className="flex gap-2 flex-wrap">
              {viewportTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewportFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition ${
                    viewportFilter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {viewportLabel(tab)}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('rgaa.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  filterStatus === filter.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{filter.icon}</span>
                {filterLabel(filter.id)}
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCriteria.map((criterion) => (
          <CriterionCard key={criterion.article} criterion={criterion} />
        ))}
        {filteredCriteria.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">{t('rgaa.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
