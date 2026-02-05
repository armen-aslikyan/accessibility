import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function RGAAReport({ data }) {
  const { t } = useTranslation();
  const { criteria, statistics } = data;
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const criteriaArray = Object.values(criteria);

  const filteredCriteria = criteriaArray.filter((criterion) => {
    const matchesSearch =
      criterion.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'passed') return matchesSearch && criterion.result === 'passed';
    if (filterStatus === 'failed') return matchesSearch && criterion.result === 'failed';
    if (filterStatus === 'manual')
      return matchesSearch && criterion.result === 'requires_manual_check';
    if (filterStatus === 'ai') return matchesSearch && criterion.result === 'requires_ai_check';

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {t('rgaa.title')}
        </h2>
        <div className="flex flex-wrap gap-4">
          <StatBadge label={t('rgaa.compliant')} value={statistics.passed} color="emerald" />
          <StatBadge label={t('rgaa.nonCompliant')} value={statistics.failed} color="red" />
          <StatBadge label={t('rgaa.manualVerification')} value={statistics.requiresManual} color="orange" />
          <StatBadge label={t('rgaa.aiVerification')} value={statistics.requiresAI} color="blue" />
          <StatBadge label={t('rgaa.notTested')} value={statistics.notTested} color="slate" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
            {[
              { id: 'all' },
              { id: 'passed' },
              { id: 'failed' },
              { id: 'manual' },
              { id: 'ai' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filterStatus === filter.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter.id === 'all' ? t('rgaa.all') : 
                 filter.id === 'passed' ? t('rgaa.compliant') :
                 filter.id === 'failed' ? t('rgaa.nonCompliant') :
                 filter.id === 'manual' ? t('dashboard.manual') :
                 t('dashboard.ai')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Criteria List */}
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

function StatBadge({ label, value, color }) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    slate: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className={`${colorClasses[color]} px-4 py-2 rounded-lg`}>
      <span className="font-bold">{value}</span>
      <span className="ml-2 text-sm">{label}</span>
    </div>
  );
}

function CriterionCard({ criterion }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    passed: { labelKey: 'rgaa.statusLabels.passed', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    failed: { labelKey: 'rgaa.statusLabels.failed', color: 'bg-red-100 text-red-800', icon: '✗' },
    requires_manual_check: { labelKey: 'rgaa.statusLabels.requiresManual', color: 'bg-orange-100 text-orange-800', icon: '👤' },
    requires_ai_check: { labelKey: 'rgaa.statusLabels.requiresAI', color: 'bg-blue-100 text-blue-800', icon: '🧠' },
    not_tested: { labelKey: 'rgaa.statusLabels.notTested', color: 'bg-slate-100 text-slate-800', icon: '?' }
  };

  const statusInfo = statusConfig[criterion.result] || statusConfig.not_tested;
  const status = { ...statusInfo, label: t(statusInfo.labelKey) };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-bold text-indigo-600">
                {criterion.article}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                {status.icon} {status.label}
              </span>
              {criterion.testedBy && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  {criterion.testedBy}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {criterion.title}
            </h3>
            {criterion.description && (
              <p className="text-sm text-slate-600">{criterion.description}</p>
            )}
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition">
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-4 space-y-4 bg-slate-50">
          {/* Violations */}
          {criterion.violations && criterion.violations.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                {t('rgaa.violationsDetected')} ({criterion.violations.length})
              </h4>
              <div className="space-y-2">
                {criterion.violations.map((violation, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-red-200">
                    <p className="text-sm font-medium text-slate-900">{violation.description}</p>
                    {violation.help && (
                      <p className="text-xs text-slate-600 mt-1">{violation.help}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LLM Analysis */}
          {criterion.llmAnalysis && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.aiAnalysis')}</h4>
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {criterion.llmAnalysis}
                </p>
              </div>
            </div>
          )}

          {/* WCAG References */}
          {criterion.wcag && criterion.wcag.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.wcagReferences')}</h4>
              <div className="flex flex-wrap gap-2">
                {criterion.wcag.map((ref, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-mono">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RGAAReport;
