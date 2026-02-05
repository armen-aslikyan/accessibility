import { useTranslation } from 'react-i18next';

function Dashboard({ data }) {
  const { t } = useTranslation();
  const { summary, statistics } = data;

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
              €{summary.legalRisk.total.toLocaleString()}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.accessibilityScore')}
          </p>
          <div className="flex items-end gap-2">
            <span
              className={`text-6xl font-black ${
                summary.accessibilityScore > 80 ? 'text-emerald-500' : 'text-orange-500'
              }`}
            >
              {summary.accessibilityScore}%
            </span>
            <span className="text-slate-400 font-bold mb-2">RGAA</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.violationsDetected')}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-red-600">{summary.totalViolations}</span>
            <span className="text-slate-400 font-bold mb-2">{t('dashboard.problems')}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
            {t('dashboard.ecoDesign')}
          </p>
          <div className="flex items-end gap-2 text-emerald-700">
            <span className="text-6xl font-black">{summary.carbon.perVisit.toFixed(2)}g</span>
            <span className="text-slate-400 font-bold mb-2 text-sm">CO2</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {t('carbon.pageSize')}: {summary.carbon.pageSizeMB} MB
          </p>
        </div>
      </div>

      {/* RGAA Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {t('dashboard.rgaaStatistics')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label={t('dashboard.totalCriteria')}
            value={statistics.total}
            color="text-slate-900"
            bgColor="bg-slate-100"
          />
          <StatCard
            label={t('dashboard.compliant')}
            value={statistics.passed}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label={t('dashboard.nonCompliant')}
            value={statistics.failed}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            label={t('dashboard.toVerify')}
            value={statistics.requiresManual + statistics.requiresAI}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Test Methods Breakdown */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {t('dashboard.testMethodBreakdown')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MethodCard
              label={t('dashboard.automated')}
              value={statistics.byAutomation}
              icon="🤖"
            />
            <MethodCard
              label={t('dashboard.hybrid')}
              value={statistics.byHybrid}
              icon="🔄"
            />
            <MethodCard
              label={t('dashboard.ai')}
              value={statistics.byAI}
              icon="🧠"
            />
            <MethodCard
              label={t('dashboard.manual')}
              value={statistics.byManual}
              icon="👤"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <p className="text-xs text-slate-600 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function MethodCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-slate-600 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default Dashboard;
