import { useTranslation } from 'react-i18next';

function CarbonReport({ data }) {
  const { t } = useTranslation();
  const { summary, meta } = data;
  const { carbon } = summary;

  // Calculate yearly projections based on visits
  const calculateProjections = (perVisit, visits) => {
    const totalGrams = perVisit * visits;
    const totalKg = totalGrams / 1000;
    return totalKg;
  };

  const scenarios = [
    { visits: 1000, labelKey: 'carbon.visitsPerYear.1k' },
    { visits: 10000, labelKey: 'carbon.visitsPerYear.10k' },
    { visits: 100000, labelKey: 'carbon.visitsPerYear.100k' },
    { visits: 1000000, labelKey: 'carbon.visitsPerYear.1m' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl p-8 border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌱</span>
          <h2 className="text-2xl font-bold text-slate-900">{t('carbon.title')}</h2>
        </div>
        <p className="text-slate-700 mb-6">
          {t('carbon.description')}{' '}
          <a
            href="https://www.thegreenwebfoundation.org/co2-js/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold underline"
          >
            {t('carbon.methodology')}
          </a>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">{t('carbon.perVisit')}</p>
            <p className="text-4xl font-black text-emerald-700">{carbon.perVisit.toFixed(3)}g</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">{t('carbon.pageSize')}</p>
            <p className="text-4xl font-black text-slate-900">{carbon.pageSizeMB} MB</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">{t('carbon.dataTransferred')}</p>
            <p className="text-4xl font-black text-slate-900">
              {(carbon.totalBytes / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
      </div>

      {/* Projections */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          {t('carbon.annualProjections')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scenario) => {
            const co2Kg = calculateProjections(carbon.perVisit, scenario.visits);
            return (
              <div key={scenario.visits} className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">{t(scenario.labelKey)}</p>
                <p className="text-3xl font-bold text-emerald-700">{co2Kg.toFixed(2)} kg</p>
                <p className="text-xs text-slate-500 mt-2">CO2</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context & Comparisons */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          {t('carbon.contextAndEquivalents')}
        </h3>
        <div className="space-y-4">
          <ComparisonCard
            icon="🚗"
            title={t('carbon.carEquivalent')}
            description={t('carbon.carDescription', { km: (carbon.perVisit / 120).toFixed(4) })}
          />
          <ComparisonCard
            icon="🌳"
            title={t('carbon.treeAbsorption')}
            description={t('carbon.treeDescription', { 
              trees: (calculateProjections(carbon.perVisit, 1000000) / 25).toFixed(0) 
            })}
          />
          <ComparisonCard
            icon="💡"
            title={t('carbon.electricalConsumption')}
            description={t('carbon.electricalDescription')}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          {t('carbon.recommendations')}
        </h3>
        <ul className="space-y-3">
          <RecommendationItem text={t('carbon.recommendationsList.images')} />
          <RecommendationItem text={t('carbon.recommendationsList.minify')} />
          <RecommendationItem text={t('carbon.recommendationsList.cache')} />
          <RecommendationItem text={t('carbon.recommendationsList.cdn')} />
          <RecommendationItem text={t('carbon.recommendationsList.greenHosting')} />
          <RecommendationItem text={t('carbon.recommendationsList.thirdParty')} />
          <RecommendationItem text={t('carbon.recommendationsList.lazyLoading')} />
        </ul>
      </div>

      {/* Source */}
      <div className="bg-slate-100 rounded-lg p-6 text-center">
        <p className="text-sm text-slate-600">
          {t('carbon.sourceNote')}{' '}
          <a
            href="https://www.thegreenwebfoundation.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold underline"
          >
            {t('carbon.greenWebFoundation')}
          </a>
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {t('carbon.auditPerformed')} {new Date(meta.generatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function ComparisonCard({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg">
      <span className="text-3xl">{icon}</span>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function RecommendationItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-emerald-600 mt-1">✓</span>
      <span className="text-slate-700">{text}</span>
    </li>
  );
}

export default CarbonReport;
