import { useTranslation } from 'react-i18next';

function Dashboard({ data }) {
  const { t } = useTranslation();
  const { summary, statistics } = data;

  // Calculate compliance rate for display
  const applicableCount = statistics.analyzed - (statistics.notApplicable || 0);
  const complianceRate = applicableCount > 0 
    ? ((statistics.compliant / applicableCount) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Legal Risk Alert */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-red-600 px-6 py-3">
          <p className="text-white text-xs font-bold uppercase tracking-wider">
            {t('dashboard.legalRiskAlert')}
          </p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-slate-500 font-bold uppercase text-xs mb-1">
              {t('dashboard.cumulativeRiskSanction')}
            </p>
            <p className="text-6xl font-black text-red-600 tracking-tighter">
              €{summary.legalRisk?.total?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2 font-medium italic">
              {t('dashboard.estimationNote')}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-sm text-slate-600">
                {t('dashboard.technicalFine')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-sm text-slate-600">
                {t('dashboard.declarationFine')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.complianceRate')}
          </p>
          <div className="flex items-end gap-2">
            <span
              className={`text-6xl font-black ${
                complianceRate > 80 ? 'text-emerald-500' : complianceRate > 50 ? 'text-orange-500' : 'text-red-500'
              }`}
            >
              {complianceRate}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {t('dashboard.excludingNA')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.nonCompliant')}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-red-600">{statistics.nonCompliant || 0}</span>
            <span className="text-slate-400 font-bold mb-2">{t('dashboard.criteria')}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.needsReview')}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-orange-500">{statistics.needsReview || 0}</span>
            <span className="text-slate-400 font-bold mb-2">{t('dashboard.criteria')}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.ecoDesign')}
          </p>
          <div className="flex items-end gap-2 text-emerald-700">
            <span className="text-5xl font-black">{summary.carbon?.perVisit?.toFixed(2) || 0}g</span>
            <span className="text-slate-400 font-bold mb-2 text-sm">CO2</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {t('carbon.pageSize')}: {summary.carbon?.pageSizeMB || 0} MB
          </p>
        </div>
      </div>

      {/* RGAA Statistics - Outcome Based */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {t('dashboard.rgaaStatistics')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <StatCard
            label={t('dashboard.analyzed')}
            value={statistics.analyzed || 0}
            color="text-slate-900"
            bgColor="bg-slate-100"
          />
          <StatCard
            label={t('dashboard.compliant')}
            value={statistics.compliant || 0}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            icon="✅"
          />
          <StatCard
            label={t('dashboard.nonCompliant')}
            value={statistics.nonCompliant || 0}
            color="text-red-600"
            bgColor="bg-red-50"
            icon="❌"
          />
          <StatCard
            label={t('dashboard.notApplicable')}
            value={statistics.notApplicable || 0}
            color="text-slate-500"
            bgColor="bg-slate-50"
            icon="⊘"
          />
          <StatCard
            label={t('dashboard.needsReview')}
            value={statistics.needsReview || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
            icon="🔍"
          />
        </div>

        {/* Compliance Progress Bar */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {t('dashboard.complianceBreakdown')}
          </h3>
          <div className="h-8 bg-slate-200 rounded-full overflow-hidden flex">
            {statistics.compliant > 0 && (
              <div 
                className="bg-emerald-500 h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(statistics.compliant / statistics.analyzed) * 100}%` }}
              >
                {statistics.compliant}
              </div>
            )}
            {statistics.nonCompliant > 0 && (
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(statistics.nonCompliant / statistics.analyzed) * 100}%` }}
              >
                {statistics.nonCompliant}
              </div>
            )}
            {statistics.notApplicable > 0 && (
              <div 
                className="bg-slate-400 h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(statistics.notApplicable / statistics.analyzed) * 100}%` }}
              >
                {statistics.notApplicable}
              </div>
            )}
            {statistics.needsReview > 0 && (
              <div 
                className="bg-orange-500 h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${(statistics.needsReview / statistics.analyzed) * 100}%` }}
              >
                {statistics.needsReview}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>✅ {t('dashboard.compliant')}</span>
            <span>❌ {t('dashboard.nonCompliant')}</span>
            <span>⊘ {t('dashboard.notApplicable')}</span>
            <span>🔍 {t('dashboard.needsReview')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bgColor, icon }) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <p className="text-xs text-slate-600 font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <p className={`text-3xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
