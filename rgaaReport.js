const fs = require('fs');
const rgaaStructure = require('./rgaaStructure.js');
const rgaaMasterMapping = require('./constants/rgaaMapping.js');

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
 * Analyze RGAA compliance based on axe results
 * @param {Object} results - Axe results object
 * @returns {Object} RGAA analysis with pass/fail/manual status for each criterion
 */
function analyzeRGAACompliance(results) {
    const rgaaStatus = {};

    // Create a reverse mapping: RGAA article -> axe rule IDs
    const articleToRules = {};
    Object.entries(rgaaMasterMapping).forEach(([ruleId, mapping]) => {
        if (mapping.article) {
            if (!articleToRules[mapping.article]) {
                articleToRules[mapping.article] = [];
            }
            articleToRules[mapping.article].push(ruleId);
        }
    });

    // For each theme and criterion in RGAA structure
    Object.values(rgaaStructure.themes).forEach(theme => {
        theme.criteria.forEach(criterion => {
            const criterionNumber = criterion.number;
            const relatedRules = articleToRules[criterionNumber] || [];

            // Find violations, passes, incomplete, and inapplicable for this criterion's rules
            const violations = results.violations.filter(v => relatedRules.includes(v.id));
            const passes = results.passes.filter(p => relatedRules.includes(p.id));
            const incomplete = results.incomplete.filter(i => relatedRules.includes(i.id));
            const inapplicable = results.inapplicable.filter(i => relatedRules.includes(i.id));

            let status = 'not-tested';
            let details = [];
            let failedRules = [];
            let passedRules = [];
            let inapplicableRules = [];

            if (relatedRules.length === 0) {
                // No automated rules available - requires manual check
                status = 'manual';
                details.push('Test manuel requis - aucune règle automatisée disponible');
            } else {
                // Check if any rules failed
                if (violations.length > 0) {
                    status = 'fail';
                    violations.forEach(v => {
                        const mapping = rgaaMasterMapping[v.id];
                        failedRules.push({
                            id: v.id,
                            help: v.help,
                            impact: v.impact,
                            nodeCount: v.nodes.length,
                            nodes: v.nodes,
                            financial: mapping?.financial || 'Non spécifié',
                            brand: mapping?.brand || 'Non spécifié',
                            fix: mapping?.fix || 'Consulter la documentation RGAA'
                        });
                    });
                } else if (incomplete.length > 0) {
                    status = 'incomplete';
                    details = incomplete.map(i => `${i.id}: ${i.description}`);
                } else if (passes.length > 0) {
                    status = 'pass';
                    passedRules = passes.map(p => p.id);
                } else if (inapplicable.length > 0) {
                    // Rules exist but weren't applicable to this page (no matching elements found)
                    status = 'not-applicable';
                    inapplicableRules = inapplicable.map(i => i.id);
                    details.push(`Non applicable: Les éléments vérifiés par ces règles (${inapplicableRules.join(', ')}) n'existent pas sur cette page`);
                } else {
                    // Rules exist but didn't run for some reason
                    status = 'not-tested';
                    details.push('Les règles existent mais n\'ont pas été exécutées');
                }
            }

            rgaaStatus[criterionNumber] = {
                ...criterion,
                theme: theme.number,
                themeName: theme.name,
                status,
                failedRules,
                passedRules,
                inapplicableRules,
                details,
                incompleteCount: incomplete.length,
                relatedAxeRules: relatedRules
            };
        });
    });

    return rgaaStatus;
}

/**
 * Generate comprehensive RGAA compliance report
 * @param {Object} results - Axe results object
 * @param {string} url - URL that was audited
 */
function generateRGAAReport(results, url) {
    const rgaaStatus = analyzeRGAACompliance(results);

    // Calculate statistics
    const stats = {
        total: Object.keys(rgaaStatus).length,
        passed: 0,
        failed: 0,
        manual: 0,
        notApplicable: 0,
        incomplete: 0,
        byTheme: {}
    };

    // Initialize theme stats
    Object.values(rgaaStructure.themes).forEach(theme => {
        stats.byTheme[theme.number] = {
            name: theme.name,
            total: theme.criteria.length,
            passed: 0,
            failed: 0,
            manual: 0,
            notApplicable: 0
        };
    });

    // Calculate statistics
    Object.values(rgaaStatus).forEach(criterion => {
        if (criterion.status === 'pass') stats.passed++;
        else if (criterion.status === 'fail') stats.failed++;
        else if (criterion.status === 'manual') stats.manual++;
        else if (criterion.status === 'not-applicable') stats.notApplicable++;
        else if (criterion.status === 'incomplete') stats.incomplete++;

        // Theme statistics
        const themeStats = stats.byTheme[criterion.theme];
        if (criterion.status === 'pass') themeStats.passed++;
        else if (criterion.status === 'fail') themeStats.failed++;
        else if (criterion.status === 'manual') themeStats.manual++;
        else if (criterion.status === 'not-applicable') themeStats.notApplicable++;
    });

    // Calculate compliance percentages
    const automatedTests = stats.total - stats.manual - stats.notApplicable;
    const compliancePercent = automatedTests > 0 
        ? Math.round((stats.passed / automatedTests) * 100) 
        : 0;

    // Estimate financial risk based on failures
    const criticalFailures = Object.values(rgaaStatus).filter(c => 
        c.status === 'fail' && c.failedRules.some(r => r.impact === 'critical' || r.impact === 'serious')
    ).length;
    const estimatedRisk = criticalFailures > 0 ? 75000 : 0; // €75k based on ordonnance

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport de Conformité RGAA 4.1 - ${escapeHtml(url)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .status-pass { background: #dcfce7; color: #166534; }
            .status-fail { background: #fee2e2; color: #991b1b; }
            .status-manual { background: #fef3c7; color: #92400e; }
            .status-incomplete { background: #fef3c7; color: #92400e; }
            .status-not-applicable { background: #f3f4f6; color: #6b7280; }
            .status-not-tested { background: #f3f4f6; color: #6b7280; }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-900">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            <!-- Header -->
            <header class="mb-12 pb-8 border-b border-slate-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-4xl font-black text-slate-900 mb-2">Rapport de Conformité RGAA 4.1</h1>
                        <p class="text-sm text-slate-500 mb-2">Référentiel Général d'Amélioration de l'Accessibilité</p>
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

            <!-- Legal Risk Alert -->
            ${stats.failed > 0 ? `
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-red-200">
                <div class="bg-red-600 px-8 py-3">
                    <p class="text-white text-xs font-black uppercase tracking-widest">⚠️ Alerte Exposition Juridique (Loi n° 2023-171 & EAA 2025)</p>
                </div>
                <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p class="text-slate-500 font-bold uppercase text-xs mb-1">Risque Sanction Estimé</p>
                        <p class="text-6xl font-black text-red-600 tracking-tighter">€${estimatedRisk.toLocaleString()}</p>
                        <p class="text-sm text-slate-400 mt-2 font-medium italic">*Estimation basée sur les plafonds de l'Ordonnance n° 2023-859</p>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <div class="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <p class="text-sm text-slate-600"><strong>${stats.failed} critères</strong> en échec détectés</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <p class="text-sm text-slate-600"><strong>€50,000 :</strong> Amende technique max (renouvelable tous les 6 mois)</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <p class="text-sm text-slate-600"><strong>€25,000 :</strong> Amende pour défaut de déclaration d'accessibilité</p>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Summary Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Score de Conformité</p>
                    <p class="text-5xl font-black ${compliancePercent >= 80 ? 'text-green-600' : compliancePercent >= 50 ? 'text-yellow-600' : 'text-red-600'}">${compliancePercent}%</p>
                    <p class="text-xs text-slate-500 mt-1">${stats.passed}/${automatedTests} tests automatisés réussis</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Critères Totaux</p>
                    <p class="text-3xl font-black text-slate-700">${stats.total}</p>
                    <div class="flex gap-2 mt-2 text-xs">
                        <span class="text-green-600 font-bold">✓ ${stats.passed}</span>
                        <span class="text-red-600 font-bold">✗ ${stats.failed}</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Tests Manuels</p>
                    <p class="text-3xl font-black text-yellow-700">${stats.manual}</p>
                    <p class="text-xs text-slate-500 mt-1">Nécessitent vérification humaine</p>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Thèmes RGAA</p>
                    <p class="text-3xl font-black text-slate-700">13</p>
                    <p class="text-xs text-slate-500 mt-1">Images, Couleurs, Formulaires...</p>
                </div>
            </div>

            <!-- Legend -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h3 class="text-sm font-bold text-slate-700 mb-4">Légende des Statuts</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-pass px-3 py-1 rounded-full font-bold">✓ Conforme</span>
                            <span class="text-slate-600 font-bold">${stats.passed}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Tests automatisés réussis</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-fail px-3 py-1 rounded-full font-bold">✗ Non-conforme</span>
                            <span class="text-slate-600 font-bold">${stats.failed}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Violations détectées</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-manual px-3 py-1 rounded-full font-bold">◐ Manuel</span>
                            <span class="text-slate-600 font-bold">${stats.manual}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Aucune règle automatisée</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-incomplete px-3 py-1 rounded-full font-bold">⚠ À vérifier</span>
                            <span class="text-slate-600 font-bold">${stats.incomplete}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Vérification manuelle nécessaire</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-not-applicable px-3 py-1 rounded-full font-bold">- N/A</span>
                            <span class="text-slate-600 font-bold">${stats.notApplicable}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Éléments absents de la page</p>
                    </div>
                </div>
            </div>

            <!-- RGAA Themes -->
            ${Object.values(rgaaStructure.themes).map(theme => {
                const themeStats = stats.byTheme[theme.number];
                const themeCriteria = Object.values(rgaaStatus).filter(c => c.theme === theme.number);
                
                return `
                <div class="mb-12">
                    <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-xl p-6 text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <span class="bg-white text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">${theme.number}</span>
                                <div>
                                    <h2 class="text-2xl font-black">${theme.name}</h2>
                                    <p class="text-indigo-100 text-sm">${theme.nameEn}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm opacity-90">${theme.criteria.length} critères</div>
                                <div class="flex gap-3 mt-1 text-xs">
                                    <span class="bg-green-500 px-2 py-1 rounded">✓ ${themeStats.passed}</span>
                                    <span class="bg-red-500 px-2 py-1 rounded">✗ ${themeStats.failed}</span>
                                    <span class="bg-yellow-500 px-2 py-1 rounded">◐ ${themeStats.manual}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-b-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        ${themeCriteria.map(criterion => {
                            const statusClass = `status-${criterion.status}`;
                            const statusIcon = criterion.status === 'pass' ? '✓' : 
                                              criterion.status === 'fail' ? '✗' : 
                                              criterion.status === 'manual' ? '◐' :
                                              criterion.status === 'incomplete' ? '⚠' : '-';
                            
                            return `
                            <div class="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                <div class="p-5">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3 flex-wrap">
                                            <span class="${statusClass} px-3 py-1 rounded-full text-xs font-bold">${statusIcon} ${criterion.status === 'pass' ? 'CONFORME' : criterion.status === 'fail' ? 'NON-CONFORME' : criterion.status === 'manual' ? 'MANUEL' : criterion.status === 'incomplete' ? 'À VÉRIFIER' : 'N/A'}</span>
                                            <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold">Critère ${criterion.number}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 class="text-base font-bold text-slate-800 mb-2">${escapeHtml(criterion.title)}</h3>
                                    
                                    ${criterion.status === 'fail' && criterion.failedRules.length > 0 ? `
                                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                            <h4 class="text-xs font-bold text-red-900 uppercase tracking-wider mb-3">
                                                ⚠️ Règles en échec (${criterion.failedRules.length})
                                            </h4>
                                            <div class="space-y-4">
                                                ${criterion.failedRules.map(rule => `
                                                    <div class="border-l-4 border-red-500 pl-4">
                                                        <p class="text-sm font-bold text-red-900">${escapeHtml(rule.help)}</p>
                                                        <p class="text-xs text-red-700 mt-1">
                                                            Règle axe-core: <code class="bg-red-100 px-1 rounded font-mono">${rule.id}</code> | 
                                                            Impact: <span class="font-bold">${rule.impact.toUpperCase()}</span> | 
                                                            ${rule.nodeCount} élément(s) affecté(s)
                                                        </p>
                                                        
                                                        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded">
                                                            <div>
                                                                <p class="text-[10px] text-red-600 font-bold uppercase mb-1">💰 Impact Financier</p>
                                                                <p class="text-xs text-slate-700">${escapeHtml(rule.financial)}</p>
                                                            </div>
                                                            <div>
                                                                <p class="text-[10px] text-red-600 font-bold uppercase mb-1">✨ Impact Marque</p>
                                                                <p class="text-xs text-slate-700">${escapeHtml(rule.brand)}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="mt-2 bg-green-50 border border-green-200 p-3 rounded">
                                                            <p class="text-[10px] text-green-700 font-bold uppercase mb-1">🛠️ Solution</p>
                                                            <p class="text-xs text-green-900 font-medium">${escapeHtml(rule.fix)}</p>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'pass' && criterion.passedRules.length > 0 ? `
                                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                            <p class="text-xs text-green-700">
                                                <span class="font-bold">✓ Tests automatisés réussis :</span> ${criterion.passedRules.join(', ')}
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'manual' ? `
                                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                            <p class="text-xs text-yellow-800 font-medium">
                                                ⚠️ Test manuel requis - aucune règle automatisée disponible pour ce critère
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'not-applicable' && criterion.inapplicableRules?.length > 0 ? `
                                        <div class="bg-slate-50 border border-slate-300 rounded-lg p-3 mt-3">
                                            <p class="text-xs text-slate-700 font-medium mb-2">
                                                ℹ️ Non applicable - Les éléments vérifiés par ces règles n'existent pas sur cette page
                                            </p>
                                            <p class="text-xs text-slate-600">
                                                <span class="font-semibold">Règles non exécutées:</span> 
                                                <code class="bg-slate-200 px-1 rounded font-mono">${criterion.inapplicableRules.join(', ')}</code>
                                            </p>
                                            <p class="text-xs text-slate-500 mt-2 italic">
                                                Exemple: les règles iframe ne s'exécutent pas s'il n'y a pas d'iframe, les règles vidéo ne s'exécutent pas sans vidéo, etc.
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.relatedAxeRules.length > 0 ? `
                                        <details class="mt-3">
                                            <summary class="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                                Règles axe-core associées (${criterion.relatedAxeRules.length})
                                            </summary>
                                            <div class="mt-2 text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded">
                                                ${criterion.relatedAxeRules.join(', ')}
                                            </div>
                                        </details>
                                    ` : ''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                `;
            }).join('')}

            <!-- Footer -->
            <footer class="mt-16 text-center border-t pt-8">
                <p class="text-slate-400 text-xs uppercase font-bold tracking-widest">© 2026 TonAuditAI - Analyse de Conformité RGAA 4.1</p>
                <p class="text-slate-400 text-xs mt-2 italic px-12">
                    Cet audit automatisé identifie les problèmes d'accessibilité mais ne remplace pas une certification humaine réalisée par un expert. 
                    Les pourcentages de conformité sont basés uniquement sur les tests automatisés.
                    Le risque financier est une estimation basée sur les plafonds légaux français en vigueur au 1er janvier 2026.
                </p>
            </footer>
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync('reports/rgaa_reqs_full.html', htmlContent);
    console.log("\n📋 RAPPORT DE CONFORMITÉ RGAA GÉNÉRÉ: reports/rgaa_reqs_full.html");
    console.log(`✓ Conforme: ${stats.passed} | ✗ Non-conforme: ${stats.failed} | ◐ Manuel: ${stats.manual} | Score: ${compliancePercent}%`);
}

module.exports = {
    generateRGAAReport,
    analyzeRGAACompliance
};
