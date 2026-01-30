const fs = require('fs');
const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Generate comprehensive detailed RGAA report showing ALL 106 criteria
 * @param {Object} rgaaStatus - RGAA analysis from analyzeRGAACompliance
 * @param {string} url - URL that was audited
 */
function generateDetailedRGAAReport(rgaaStatus, url) {
    // Calculate statistics
    const stats = {
        total: 106,
        passed: 0,
        failed: 0,
        manual: 0,
        notApplicable: 0,
        notTested: 0,
        incomplete: 0
    };

    Object.values(rgaaStatus).forEach(criterion => {
        if (criterion.status === 'pass') stats.passed++;
        else if (criterion.status === 'fail') stats.failed++;
        else if (criterion.status === 'manual') stats.manual++;
        else if (criterion.status === 'not-applicable') stats.notApplicable++;
        else if (criterion.status === 'not-tested') stats.notTested++;
        else if (criterion.status === 'incomplete') stats.incomplete++;
    });

    // Group by theme
    const themes = {};
    for (let i = 1; i <= 13; i++) {
        themes[i] = Object.entries(rgaaStatus)
            .filter(([_, criterion]) => criterion.theme === i)
            .map(([article, criterion]) => ({ article, ...criterion }))
            .sort((a, b) => {
                const aNum = parseFloat(a.article);
                const bNum = parseFloat(b.article);
                return aNum - bNum;
            });
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport Détaillé RGAA - Tous les 106 Critères</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .status-pass { background: #dcfce7; color: #166534; border-left: 4px solid #22c55e; }
            .status-fail { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; }
            .status-manual { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
            .status-not-applicable { background: #f3f4f6; color: #6b7280; border-left: 4px solid #9ca3af; }
            .status-not-tested { background: #e0e7ff; color: #3730a3; border-left: 4px solid #6366f1; }
            .status-incomplete { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
            
            .filter-btn { cursor: pointer; transition: all 0.2s; }
            .filter-btn:hover { transform: scale(1.05); }
            .filter-btn.active { ring: 2px; ring-color: #3b82f6; }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-900">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            <!-- Header -->
            <header class="mb-8 pb-6 border-b border-slate-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-4xl font-black text-slate-900 mb-2">Rapport Détaillé RGAA 4.1.2</h1>
                        <p class="text-sm text-slate-500 mb-2">Tous les 106 Critères - Vue Exhaustive</p>
                        <p class="text-lg text-slate-600">Cible : <span class="font-mono text-indigo-600">${escapeHtml(url)}</span></p>
                        <p class="text-sm text-slate-400 mt-1">Généré le : ${new Date().toLocaleString('fr-FR')}</p>
                    </div>
                    <div class="text-right">
                        <div class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                            TonAuditAI v2.0
                        </div>
                    </div>
                </div>
            </header>

            <!-- Statistics Dashboard -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 class="text-xl font-bold mb-4">Vue d'ensemble - 106 Critères RGAA</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div class="filter-btn bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center" data-status="pass">
                        <p class="text-3xl font-black text-green-700">${stats.passed}</p>
                        <p class="text-green-600 text-xs uppercase font-bold mt-1">✓ Conformes</p>
                    </div>
                    <div class="filter-btn bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center" data-status="fail">
                        <p class="text-3xl font-black text-red-700">${stats.failed}</p>
                        <p class="text-red-600 text-xs uppercase font-bold mt-1">✗ Non-conformes</p>
                    </div>
                    <div class="filter-btn bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center" data-status="manual">
                        <p class="text-3xl font-black text-yellow-700">${stats.manual}</p>
                        <p class="text-yellow-600 text-xs uppercase font-bold mt-1">◐ Manuels</p>
                    </div>
                    <div class="filter-btn bg-slate-100 border-2 border-slate-300 rounded-lg p-4 text-center" data-status="not-applicable">
                        <p class="text-3xl font-black text-slate-600">${stats.notApplicable}</p>
                        <p class="text-slate-600 text-xs uppercase font-bold mt-1">- N/A</p>
                    </div>
                    <div class="filter-btn bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 text-center" data-status="not-tested">
                        <p class="text-3xl font-black text-indigo-700">${stats.notTested}</p>
                        <p class="text-indigo-600 text-xs uppercase font-bold mt-1">? Non testés</p>
                    </div>
                    ${stats.incomplete > 0 ? `
                    <div class="filter-btn bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center" data-status="incomplete">
                        <p class="text-3xl font-black text-orange-700">${stats.incomplete}</p>
                        <p class="text-orange-600 text-xs uppercase font-bold mt-1">⚠ Incomplets</p>
                    </div>
                    ` : ''}
                    <div class="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4 text-center">
                        <p class="text-3xl font-black text-indigo-700">${stats.total}</p>
                        <p class="text-indigo-600 text-xs uppercase font-bold mt-1">Total</p>
                    </div>
                </div>
                <p class="text-xs text-slate-500 mt-4 text-center italic">
                    Cliquez sur une catégorie pour filtrer les critères ci-dessous
                </p>
            </div>

            <!-- Legend -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h3 class="text-sm font-bold text-slate-700 mb-4">Légende des Statuts</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                    <div>
                        <p class="font-bold text-green-700 mb-1">✓ CONFORME</p>
                        <p class="text-slate-600">Tests automatisés réussis</p>
                    </div>
                    <div>
                        <p class="font-bold text-red-700 mb-1">✗ NON-CONFORME</p>
                        <p class="text-slate-600">Violations détectées</p>
                    </div>
                    <div>
                        <p class="font-bold text-yellow-700 mb-1">◐ MANUEL</p>
                        <p class="text-slate-600">Test manuel requis</p>
                    </div>
                    <div>
                        <p class="font-bold text-slate-700 mb-1">- NON APPLICABLE</p>
                        <p class="text-slate-600">Éléments absents</p>
                    </div>
                    <div>
                        <p class="font-bold text-indigo-700 mb-1">? NON TESTÉ</p>
                        <p class="text-slate-600">Règles non exécutées</p>
                    </div>
                    <div>
                        <p class="font-bold text-orange-700 mb-1">⚠ INCOMPLET</p>
                        <p class="text-slate-600">Vérification nécessaire</p>
                    </div>
                </div>
            </div>

            <!-- All 106 Criteria by Theme -->
            ${Object.entries(themes).map(([themeNum, criteria]) => {
                const themeNames = {
                    1: 'Images', 2: 'Cadres', 3: 'Couleurs', 4: 'Multimédia',
                    5: 'Tableaux', 6: 'Liens', 7: 'Scripts', 8: 'Éléments obligatoires',
                    9: 'Structuration de l\'information', 10: 'Présentation de l\'information',
                    11: 'Formulaires', 12: 'Navigation', 13: 'Consultation'
                };
                
                return `
                <div class="mb-8">
                    <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-xl p-4 text-white">
                        <div class="flex items-center gap-3">
                            <span class="bg-white text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">${themeNum}</span>
                            <h2 class="text-2xl font-black">${themeNames[themeNum]}</h2>
                            <span class="text-indigo-100 text-sm">— ${criteria.length} critères</span>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-b-xl shadow-sm border border-slate-200">
                        <table class="w-full">
                            <thead class="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th class="text-left p-3 text-xs font-bold text-slate-600 uppercase w-20">Critère</th>
                                    <th class="text-left p-3 text-xs font-bold text-slate-600 uppercase w-32">Statut</th>
                                    <th class="text-left p-3 text-xs font-bold text-slate-600 uppercase">Description</th>
                                    <th class="text-left p-3 text-xs font-bold text-slate-600 uppercase w-32">Méthode de test</th>
                                    <th class="text-left p-3 text-xs font-bold text-slate-600 uppercase w-24">Niveau</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${criteria.map(criterion => {
                                    const statusClass = `status-${criterion.status}`;
                                    const statusLabel = {
                                        'pass': '✓ CONFORME',
                                        'fail': '✗ NON-CONFORME',
                                        'manual': '◐ MANUEL',
                                        'not-applicable': '- NON APPLICABLE',
                                        'not-tested': '? NON TESTÉ',
                                        'incomplete': '⚠ INCOMPLET'
                                    }[criterion.status] || criterion.status;
                                    
                                    const testMethodLabel = {
                                        'axe-core': '🤖 Automatisé',
                                        'axe-core,manual': '🤖👤 Auto + Manuel',
                                        'manual': '👤 Manuel',
                                        'ai': '🤖 IA Assisté'
                                    }[criterion.testMethod] || criterion.testMethod;
                                    
                                    return `
                                    <tr class="${statusClass} border-b border-slate-100 criterion-row" data-status="${criterion.status}">
                                        <td class="p-3">
                                            <span class="font-mono font-bold text-sm">${criterion.number}</span>
                                        </td>
                                        <td class="p-3">
                                            <span class="text-xs font-bold">${statusLabel}</span>
                                        </td>
                                        <td class="p-3">
                                            <p class="text-sm">${escapeHtml(criterion.title)}</p>
                                            ${criterion.status === 'fail' && criterion.failedRules?.length > 0 ? `
                                                <div class="mt-2 text-xs">
                                                    <p class="font-bold text-red-800">Violations :</p>
                                                    <ul class="ml-4 mt-1 space-y-1">
                                                        ${criterion.failedRules.map(rule => `
                                                            <li class="text-red-700">• ${escapeHtml(rule.help)} (${rule.nodeCount} élément${rule.nodeCount > 1 ? 's' : ''})</li>
                                                        `).join('')}
                                                    </ul>
                                                </div>
                                            ` : ''}
                                            ${criterion.status === 'pass' && criterion.passedRules?.length > 0 ? `
                                                <p class="mt-1 text-xs text-green-700">
                                                    Règles testées : ${criterion.passedRules.join(', ')}
                                                </p>
                                            ` : ''}
                                            ${criterion.status === 'not-applicable' ? `
                                                <p class="mt-1 text-xs text-slate-600 italic">
                                                    Les éléments testés par ce critère n'existent pas sur cette page.
                                                </p>
                                            ` : ''}
                                            ${criterion.testMethod === 'axe-core,manual' && (criterion.status === 'pass' || criterion.status === 'fail') ? `
                                                <div class="mt-2 bg-orange-100 border-l-2 border-orange-500 p-2">
                                                    <p class="text-xs text-orange-900 font-bold">
                                                        👤 Vérification manuelle requise pour conformité complète
                                                    </p>
                                                </div>
                                            ` : ''}
                                        </td>
                                        <td class="p-3">
                                            <span class="text-xs">${testMethodLabel}</span>
                                            ${criterion.relatedAxeRules?.length > 0 ? `
                                                <p class="text-[10px] text-slate-500 mt-1">${criterion.relatedAxeRules.length} règle${criterion.relatedAxeRules.length > 1 ? 's' : ''} axe-core</p>
                                            ` : ''}
                                        </td>
                                        <td class="p-3">
                                            <span class="inline-block px-2 py-1 rounded text-xs font-bold ${criterion.level === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                                                ${criterion.level}
                                            </span>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                `;
            }).join('')}

            <!-- Footer -->
            <footer class="mt-12 text-center border-t pt-6">
                <p class="text-slate-400 text-xs uppercase font-bold tracking-widest">© 2026 TonAuditAI - Rapport Détaillé RGAA 4.1.2</p>
                <p class="text-slate-400 text-xs mt-2 italic">
                    Ce rapport exhaustif liste tous les 106 critères RGAA avec leur statut individuel.
                    Pour plus de détails sur chaque violation, consultez le rapport RGAA complet.
                </p>
            </footer>
        </div>

        <script>
            // Filter functionality
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const status = this.dataset.status;
                    const rows = document.querySelectorAll('.criterion-row');
                    
                    // Toggle active state
                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                        rows.forEach(row => row.style.display = '');
                    } else {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        rows.forEach(row => {
                            row.style.display = row.dataset.status === status ? '' : 'none';
                        });
                    }
                });
            });
        </script>
    </body>
    </html>
    `;

    fs.writeFileSync('reports/rgaa_detailed_all_106.html', htmlContent);
    console.log("\n📋 RAPPORT DÉTAILLÉ GÉNÉRÉ: reports/rgaa_detailed_all_106.html");
    console.log(`📊 Tous les 106 critères RGAA avec statuts détaillés`);
}

module.exports = {
    generateDetailedRGAAReport
};
