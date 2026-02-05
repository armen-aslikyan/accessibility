import { useState } from 'react';

function RGAAReport({ data }) {
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
          106 Critères RGAA 4.1
        </h2>
        <div className="flex flex-wrap gap-4">
          <StatBadge label="Conformes" value={statistics.passed} color="emerald" />
          <StatBadge label="Non-Conformes" value={statistics.failed} color="red" />
          <StatBadge label="Vérification Manuelle" value={statistics.requiresManual} color="orange" />
          <StatBadge label="Vérification IA" value={statistics.requiresAI} color="blue" />
          <StatBadge label="Non Testés" value={statistics.notTested} color="slate" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un critère..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'passed', label: 'Conformes' },
              { id: 'failed', label: 'Non-Conformes' },
              { id: 'manual', label: 'Manuel' },
              { id: 'ai', label: 'IA' }
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
                {filter.label}
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
            <p className="text-slate-500">Aucun critère ne correspond à votre recherche.</p>
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
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    passed: { label: 'Conforme', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    failed: { label: 'Non-Conforme', color: 'bg-red-100 text-red-800', icon: '✗' },
    requires_manual_check: { label: 'Vérification Manuelle', color: 'bg-orange-100 text-orange-800', icon: '👤' },
    requires_ai_check: { label: 'Vérification IA', color: 'bg-blue-100 text-blue-800', icon: '🧠' },
    not_tested: { label: 'Non Testé', color: 'bg-slate-100 text-slate-800', icon: '?' }
  };

  const status = statusConfig[criterion.result] || statusConfig.not_tested;

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
                Violations Détectées ({criterion.violations.length})
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
              <h4 className="font-bold text-slate-900 mb-2">Analyse IA</h4>
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
              <h4 className="font-bold text-slate-900 mb-2">Références WCAG</h4>
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
