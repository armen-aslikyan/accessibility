import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import RGAAReport from './components/RGAAReport';
import ViolationsReport from './components/ViolationsReport';
import CarbonReport from './components/CarbonReport';
import AccessibilityStatement from './components/AccessibilityStatement/AccessibilityStatement';
import LanguageSwitcher from './components/LanguageSwitcher';
import { loadLatestAudit } from './utils/dataLoader';
import './App.css';

// Helper function to prepare data for AccessibilityStatement component
function prepareStatementData(auditData) {
  const { meta, statistics, criteria } = auditData;
  
  // Calculate compliance status
  const applicableCount = statistics.analyzed - (statistics.notApplicable || 0);
  const complianceRate = applicableCount > 0 
    ? ((statistics.compliant / applicableCount) * 100).toFixed(1)
    : 0;
  
  let complianceStatus = 'non';
  if (complianceRate >= 100) complianceStatus = 'totalement';
  else if (complianceRate >= 50) complianceStatus = 'partiellement';
  
  // Extract non-compliant items from criteria
  const nonCompliantItems = Object.entries(criteria)
    .filter(([, criterion]) => criterion.status === 'non_compliant')
    .slice(0, 10) // Limit to first 10 for readability
    .map(([key, criterion]) => `Critère ${key} : ${criterion.desc}`);
  
  // Get audit date
  const auditDate = new Date(meta.generatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return {
    siteName: meta.url || "Site Web",
    organizationName: "Organisation",
    complianceStatus,
    complianceRate: parseFloat(complianceRate),
    auditDate,
    auditorName: "Audit Automatisé RGAA",
    technologies: ["HTML5", "CSS", "JavaScript", "WAI-ARIA"],
    testEnvironment: [
      "Analyse automatisée avec axe-core",
      "Analyse IA avec Mistral",
      "Détection d'éléments automatique"
    ],
    nonCompliantItems: nonCompliantItems.length > 0 
      ? nonCompliantItems 
      : ["Aucune non-conformité majeure détectée"],
    contactEmail: "accessibilite@exemple.fr",
    contactFormUrl: "/contact"
  };
}

function App() {
  const { t } = useTranslation();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadAuditData();
  }, []);

  async function loadAuditData() {
    try {
      setLoading(true);
      const data = await loadLatestAudit();
      setAuditData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('app.error')}</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadAuditData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {t('app.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-slate-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('app.noData')}</h2>
          <p className="text-slate-600">{t('app.noDataDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {t('app.title')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {auditData.meta.url} • {new Date(auditData.meta.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={loadAuditData}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <span>🔄</span>
                {t('app.refresh')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', icon: '📊' },
              { id: 'rgaa', icon: '📋' },
              { id: 'violations', icon: '⚠️' },
              { id: 'carbon', icon: '🌱' },
              { id: 'statement', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {t(`nav.${tab.id}`)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard data={auditData} />}
        {activeTab === 'rgaa' && <RGAAReport data={auditData} />}
        {activeTab === 'violations' && <ViolationsReport data={auditData} />}
        {activeTab === 'carbon' && <CarbonReport data={auditData} />}
        {activeTab === 'statement' && <AccessibilityStatement data={prepareStatementData(auditData)} />}
      </main>
    </div>
  );
}

export default App;
