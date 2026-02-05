import { useState } from 'react';

function ViolationsReport({ data }) {
  const { violations } = data;
  const [selectedImpact, setSelectedImpact] = useState('all');

  const impactCounts = violations.reduce((acc, v) => {
    acc[v.impact] = (acc[v.impact] || 0) + 1;
    return acc;
  }, {});

  const filteredViolations =
    selectedImpact === 'all'
      ? violations
      : violations.filter((v) => v.impact === selectedImpact);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Violations d'Accessibilité Détectées
        </h2>
        <div className="flex flex-wrap gap-4">
          <ImpactBadge label="Critique" count={impactCounts.critical || 0} color="red" />
          <ImpactBadge label="Sérieux" count={impactCounts.serious || 0} color="orange" />
          <ImpactBadge label="Modéré" count={impactCounts.moderate || 0} color="yellow" />
          <ImpactBadge label="Mineur" count={impactCounts.minor || 0} color="blue" />
          <ImpactBadge label="Total" count={violations.length} color="slate" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'critical', label: 'Critique' },
            { id: 'serious', label: 'Sérieux' },
            { id: 'moderate', label: 'Modéré' },
            { id: 'minor', label: 'Mineur' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedImpact(filter.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedImpact === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter.label}
              {filter.id !== 'all' && impactCounts[filter.id] && (
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  {impactCounts[filter.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.map((violation, idx) => (
          <ViolationCard key={idx} violation={violation} />
        ))}
        {filteredViolations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-slate-500">Aucune violation de ce type détectée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ImpactBadge({ label, count, color }) {
  const colorClasses = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    slate: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className={`${colorClasses[color]} px-4 py-2 rounded-lg`}>
      <span className="font-bold">{count}</span>
      <span className="ml-2 text-sm">{label}</span>
    </div>
  );
}

function ViolationCard({ violation }) {
  const [expanded, setExpanded] = useState(false);

  const impactColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    serious: 'bg-orange-100 text-orange-800 border-orange-300',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    minor: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const impactColor = impactColors[violation.impact] || impactColors.moderate;

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${impactColor.split(' ')[2]} overflow-hidden`}>
      <div
        className="p-6 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${impactColor}`}>
                {violation.impact}
              </span>
              <span className="font-mono text-sm text-slate-600">{violation.id}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {violation.help}
            </h3>
            <p className="text-sm text-slate-600">{violation.description}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <span>Éléments affectés: {violation.nodes.length}</span>
            </div>
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
          {/* Help URL */}
          {violation.helpUrl && (
            <div>
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-2"
              >
                📖 Documentation WCAG
                <span className="text-xs">↗</span>
              </a>
            </div>
          )}

          {/* Tags */}
          {violation.tags && violation.tags.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2 text-sm">Standards</h4>
              <div className="flex flex-wrap gap-2">
                {violation.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Affected Nodes */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">
              Éléments Affectés ({violation.nodes.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {violation.nodes.map((node, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${impactColors[node.impact]}`}>
                      {node.impact}
                    </span>
                    <code className="text-xs text-slate-600 font-mono">
                      {node.target.join(' ')}
                    </code>
                  </div>
                  <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto font-mono text-slate-700">
                    {node.html}
                  </pre>
                  {node.failureSummary && (
                    <p className="text-xs text-slate-600 mt-2">
                      {node.failureSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViolationsReport;
