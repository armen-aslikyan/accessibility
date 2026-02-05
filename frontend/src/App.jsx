import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RGAAReport from './components/RGAAReport';
import ViolationsReport from './components/ViolationsReport';
import CarbonReport from './components/CarbonReport';
import { loadLatestAudit } from './utils/dataLoader';
import './App.css';

function App() {
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
          <p className="mt-4 text-slate-600 font-medium">Chargement des données d'audit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadAuditData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Réessayer
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune donnée disponible</h2>
          <p className="text-slate-600">Veuillez exécuter un audit pour générer des données.</p>
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
                Rapport d'Audit Accessibilité
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {auditData.meta.url} • {new Date(auditData.meta.generatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              onClick={loadAuditData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>🔄</span>
              Actualiser
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
              { id: 'rgaa', label: 'Critères RGAA', icon: '📋' },
              { id: 'violations', label: 'Violations', icon: '⚠️' },
              { id: 'carbon', label: 'Empreinte Carbone', icon: '🌱' }
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
                {tab.label}
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
      </main>
    </div>
  );
}

export default App;
