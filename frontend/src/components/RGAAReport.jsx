import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Status constants matching the backend
const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non_compliant',
  NOT_APPLICABLE: 'not_applicable',
  NEEDS_REVIEW: 'needs_review'
};

function RGAAReport({ data }) {
  const { t } = useTranslation();
  const { criteria, statistics } = data;
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const criteriaArray = Object.values(criteria);

  const filteredCriteria = criteriaArray.filter((criterion) => {
    const searchText = criterion.desc || criterion.descEn || '';
    const matchesSearch =
      criterion.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchText.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'compliant') return matchesSearch && criterion.status === COMPLIANCE_STATUS.COMPLIANT;
    if (filterStatus === 'non_compliant') return matchesSearch && criterion.status === COMPLIANCE_STATUS.NON_COMPLIANT;
    if (filterStatus === 'not_applicable') return matchesSearch && criterion.status === COMPLIANCE_STATUS.NOT_APPLICABLE;
    if (filterStatus === 'needs_review') return matchesSearch && criterion.status === COMPLIANCE_STATUS.NEEDS_REVIEW;

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
          <StatBadge label={t('rgaa.compliant')} value={statistics.compliant || 0} color="emerald" icon="✅" />
          <StatBadge label={t('rgaa.nonCompliant')} value={statistics.nonCompliant || 0} color="red" icon="❌" />
          <StatBadge label={t('rgaa.notApplicable')} value={statistics.notApplicable || 0} color="slate" icon="⊘" />
          <StatBadge label={t('rgaa.needsReview')} value={statistics.needsReview || 0} color="orange" icon="🔍" />
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
              { id: 'all', icon: '📋' },
              { id: 'compliant', icon: '✅' },
              { id: 'non_compliant', icon: '❌' },
              { id: 'not_applicable', icon: '⊘' },
              { id: 'needs_review', icon: '🔍' }
            ].map((filter) => (
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
                {filter.id === 'all' ? t('rgaa.all') : 
                 filter.id === 'compliant' ? t('rgaa.compliant') :
                 filter.id === 'non_compliant' ? t('rgaa.nonCompliant') :
                 filter.id === 'not_applicable' ? t('rgaa.notApplicable') :
                 t('rgaa.needsReview')}
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

function StatBadge({ label, value, color, icon }) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    slate: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className={`${colorClasses[color]} px-4 py-2 rounded-lg flex items-center gap-2`}>
      {icon && <span>{icon}</span>}
      <span className="font-bold">{value}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function CriterionCard({ criterion }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // New status configuration using compliance status
  const statusConfig = {
    [COMPLIANCE_STATUS.COMPLIANT]: { labelKey: 'rgaa.statusLabels.compliant', color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
    [COMPLIANCE_STATUS.NON_COMPLIANT]: { labelKey: 'rgaa.statusLabels.nonCompliant', color: 'bg-red-100 text-red-800', icon: '❌' },
    [COMPLIANCE_STATUS.NOT_APPLICABLE]: { labelKey: 'rgaa.statusLabels.notApplicable', color: 'bg-slate-100 text-slate-600', icon: '⊘' },
    [COMPLIANCE_STATUS.NEEDS_REVIEW]: { labelKey: 'rgaa.statusLabels.needsReview', color: 'bg-orange-100 text-orange-800', icon: '🔍' }
  };

  const statusInfo = statusConfig[criterion.status] || statusConfig[COMPLIANCE_STATUS.NEEDS_REVIEW];
  const status = { ...statusInfo, label: t(statusInfo.labelKey) };

  // Get description (support both French and English)
  const description = criterion.desc || criterion.descEn || '';

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
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                {status.icon} {status.label}
              </span>
              {criterion.level && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                  {criterion.level}
                </span>
              )}
              {criterion.testedBy && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  {criterion.testedBy}
                </span>
              )}
              {criterion.confidence !== undefined && criterion.confidence > 0 && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {criterion.confidence}% {t('rgaa.confidence')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700">{description}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition">
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''} inline-block`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-4 space-y-4 bg-slate-50">
          {/* Reasoning */}
          {criterion.reasoning && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.reasoning')}</h4>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-700">{criterion.reasoning}</p>
              </div>
            </div>
          )}

          {/* Issues */}
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
                          <code key={i} className="block text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                            {el}
                          </code>
                        ))}
                        {issue.elements.length > 3 && (
                          <p className="text-xs text-slate-500 mt-1">+{issue.elements.length - 3} more...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {criterion.recommendations && criterion.recommendations.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.recommendations')}</h4>
              <ul className="list-disc list-inside space-y-1">
                {criterion.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Fix suggestion from criterion definition */}
          {criterion.fix && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('rgaa.howToFix')}</h4>
              <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                <p className="text-sm text-emerald-800">{criterion.fix}</p>
              </div>
            </div>
          )}

          {/* Business Impact */}
          {criterion.risk && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">{t('rgaa.riskLevel')}</p>
                <p className={`font-bold ${
                  criterion.risk === 'Critical' ? 'text-red-600' :
                  criterion.risk === 'High' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>{criterion.risk}</p>
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

export default RGAAReport;
