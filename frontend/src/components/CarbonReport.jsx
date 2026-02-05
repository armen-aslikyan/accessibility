function CarbonReport({ data }) {
  const { summary, meta } = data;
  const { carbon } = summary;

  // Calculate yearly projections based on visits
  const calculateProjections = (perVisit, visits) => {
    const totalGrams = perVisit * visits;
    const totalKg = totalGrams / 1000;
    return totalKg;
  };

  const scenarios = [
    { visits: 1000, label: '1K visites/an' },
    { visits: 10000, label: '10K visites/an' },
    { visits: 100000, label: '100K visites/an' },
    { visits: 1000000, label: '1M visites/an' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl p-8 border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌱</span>
          <h2 className="text-2xl font-bold text-slate-900">Empreinte Carbone Numérique</h2>
        </div>
        <p className="text-slate-700 mb-6">
          Analyse de l'impact environnemental de votre site web basée sur la méthodologie{' '}
          <a
            href="https://www.thegreenwebfoundation.org/co2-js/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold underline"
          >
            CO2.js
          </a>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">CO2 par visite</p>
            <p className="text-4xl font-black text-emerald-700">{carbon.perVisit.toFixed(3)}g</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Taille de la page</p>
            <p className="text-4xl font-black text-slate-900">{carbon.pageSizeMB} MB</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Données transférées</p>
            <p className="text-4xl font-black text-slate-900">
              {(carbon.totalBytes / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
      </div>

      {/* Projections */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Projections Annuelles CO2
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scenario) => {
            const co2Kg = calculateProjections(carbon.perVisit, scenario.visits);
            return (
              <div key={scenario.visits} className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">{scenario.label}</p>
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
          Contexte & Équivalences
        </h3>
        <div className="space-y-4">
          <ComparisonCard
            icon="🚗"
            title="Équivalent voiture"
            description={`${(carbon.perVisit / 120).toFixed(4)} km parcourus en voiture (120g CO2/km)`}
          />
          <ComparisonCard
            icon="🌳"
            title="Absorption par arbre"
            description={`Un arbre absorbe environ 25kg de CO2 par an. Pour 1M de visites, il faudrait ${(
              calculateProjections(carbon.perVisit, 1000000) / 25
            ).toFixed(0)} arbres.`}
          />
          <ComparisonCard
            icon="💡"
            title="Consommation électrique"
            description="L'empreinte carbone inclut l'énergie du datacenter, du réseau et des appareils des utilisateurs."
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          Recommandations pour Réduire l'Impact
        </h3>
        <ul className="space-y-3">
          <RecommendationItem text="Optimiser et compresser les images (WebP, AVIF)" />
          <RecommendationItem text="Minimiser et combiner les fichiers CSS/JS" />
          <RecommendationItem text="Mettre en cache les ressources statiques" />
          <RecommendationItem text="Utiliser un CDN géographiquement distribué" />
          <RecommendationItem text="Choisir un hébergement vert (énergie renouvelable)" />
          <RecommendationItem text="Réduire les requêtes tierces inutiles" />
          <RecommendationItem text="Implémenter le lazy loading pour les images" />
        </ul>
      </div>

      {/* Source */}
      <div className="bg-slate-100 rounded-lg p-6 text-center">
        <p className="text-sm text-slate-600">
          Calculs basés sur le modèle SWD (Sustainable Web Design) de{' '}
          <a
            href="https://www.thegreenwebfoundation.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold underline"
          >
            The Green Web Foundation
          </a>
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Audit effectué le {new Date(meta.generatedAt).toLocaleString('fr-FR')}
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
