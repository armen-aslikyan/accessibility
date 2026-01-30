const fs = require('fs');
const { analyzeRGAACompliance } = require('./rgaaReport.js');

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
 * Generate official French accessibility declaration
 * @param {Object} results - Axe results object
 * @param {string} url - URL that was audited
 * @param {Object} options - Configuration options
 */
function generateDeclarationAccessibilite(results, url, options = {}) {
    // Analyze RGAA compliance
    const rgaaStatus = analyzeRGAACompliance(results);
    
    // Calculate statistics
    const stats = {
        total: Object.keys(rgaaStatus).length,
        passed: 0,
        failed: 0,
        manual: 0,
        notApplicable: 0,
        incomplete: 0,
        notTested: 0
    };
    
    const violations = [];
    
    Object.values(rgaaStatus).forEach(criterion => {
        if (criterion.status === 'pass') stats.passed++;
        else if (criterion.status === 'fail') {
            stats.failed++;
            // Collect violations for the report
            criterion.failedRules.forEach(rule => {
                violations.push({
                    criterion: criterion.number,
                    title: criterion.title,
                    help: rule.help,
                    impact: rule.impact
                });
            });
        }
        else if (criterion.status === 'manual') stats.manual++;
        else if (criterion.status === 'not-applicable') stats.notApplicable++;
        else if (criterion.status === 'incomplete') stats.incomplete++;
        else if (criterion.status === 'not-tested') stats.notTested++;
    });
    
    // Calculate compliance percentages
    // Only count criteria that are actually testable and present on the page
    // "not-applicable" = Elements genuinely don't exist (should exclude)
    // "not-tested" = Our mapping failed, treat as manual (should keep in calculation)
    const applicableCriteria = stats.total - stats.notApplicable;
    const manualAndNotTested = stats.manual + stats.notTested; // Both need human verification
    const testableAutomatedCriteria = applicableCriteria - manualAndNotTested;
    
    // Compliance percentage based on automated tests that can actually run
    const compliancePercent = testableAutomatedCriteria > 0 
        ? Math.round((stats.passed / testableAutomatedCriteria) * 100) 
        : 0;
    
    // Overall percentage including manual tests
    const totalCriteriaPercent = applicableCriteria > 0
        ? Math.round((stats.passed / applicableCriteria) * 100)
        : 0;
    
    // Determine compliance status
    let conformityStatus = 'non conforme';
    if (compliancePercent === 100 && stats.failed === 0) {
        conformityStatus = 'totalement conforme';
    } else if (compliancePercent >= 50 || (stats.failed === 0 && stats.passed > 0)) {
        conformityStatus = 'partiellement conforme';
    }
    
    // Extract configuration
    const entityName = options.entityName || '[Nom de l\'entité]';
    const siteName = options.siteName || '[Nom du site]';
    const email = options.email || '[Email du client]';
    const contactForm = options.contactForm || '[Lien vers formulaire de contact]';
    const schemaUrl = options.schemaUrl || '[Lien vers le document]';
    const actionPlanUrl = options.actionPlanUrl || '[Lien vers le document]';
    const testedPages = options.testedPages || [
        { name: 'Accueil', url: url }
    ];
    
    const currentDate = new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Déclaration d'accessibilité - ${escapeHtml(siteName)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Marianne', Arial, sans-serif; }
        .section-title { color: #000091; border-bottom: 2px solid #000091; }
    </style>
</head>
<body class="bg-white text-slate-900">
    <div class="max-w-4xl mx-auto py-12 px-6">
        
        <header class="mb-12">
            <h1 class="text-4xl font-bold text-slate-900 mb-4">Déclaration d'accessibilité</h1>
            <p class="text-slate-600 text-sm">Conforme à l'article 47 de la loi n° 2005-102 du 11 février 2005</p>
        </header>

        <main class="space-y-12 text-base leading-relaxed">
            
            <!-- Introduction -->
            <section>
                <p class="mb-4">
                    <strong>${escapeHtml(entityName)}</strong> s'engage à rendre ses services numériques accessibles, conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005.
                </p>
                
                <p class="mb-4">À cette fin, elle met en œuvre la stratégie et les actions suivantes :</p>
                
                <ul class="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>Schéma pluriannuel de mise en accessibilité 2024-2026 : <a href="${schemaUrl}" class="text-blue-600 underline hover:text-blue-800">${schemaUrl === '[Lien vers le document]' ? '[Lien vers le document]' : 'Consulter le document'}</a></li>
                    <li>Plan d'action de l'année en cours : <a href="${actionPlanUrl}" class="text-blue-600 underline hover:text-blue-800">${actionPlanUrl === '[Lien vers le document]' ? '[Lien vers le document]' : 'Consulter le document'}</a></li>
                </ul>
                
                <p>
                    Cette déclaration d'accessibilité s'applique au site : <strong>${escapeHtml(siteName)}</strong> 
                    (<a href="${escapeHtml(url)}" class="text-blue-600 underline hover:text-blue-800">${escapeHtml(url)}</a>)
                </p>
            </section>

            <!-- État de conformité -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">État de conformité</h2>
                <p>
                    Le site <strong>${escapeHtml(siteName)}</strong> est <strong>${conformityStatus}</strong> avec le référentiel général d'amélioration de l'accessibilité (RGAA), version 4.1.2, en raison des non-conformités et des dérogations énumérées ci-dessous.
                </p>
            </section>

            <!-- Résultats des tests -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Résultats des tests</h2>
                <p class="mb-4">
                    L'audit de conformité réalisé par ${escapeHtml(entityName)} révèle que :
                </p>
                
                <div class="bg-blue-50 border-l-4 border-blue-600 p-6 mb-4">
                    <p class="text-2xl font-bold text-blue-900 mb-3">
                        ${compliancePercent}% des critères applicables sont conformes.
                    </p>
                    <div class="text-sm text-blue-700 space-y-1">
                        <p><strong>Critères applicables :</strong> ${applicableCriteria} sur ${stats.total} (${stats.notApplicable} critères non applicables exclus)</p>
                        <p><strong>Tests automatisés :</strong> ${testableAutomatedCriteria} critères (${stats.manual} manuels${stats.notTested > 0 ? ` + ${stats.notTested} non testés` : ''} = ${manualAndNotTested} nécessitent vérification humaine)</p>
                        <p><strong>Conformité des tests automatisés :</strong> ${stats.passed} réussis / ${testableAutomatedCriteria} testés = <span class="font-bold">${compliancePercent}%</span></p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 text-sm mb-6">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-green-700">${stats.passed}</p>
                        <p class="text-green-600 text-xs uppercase font-semibold mt-1">Conformes</p>
                    </div>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-red-700">${stats.failed}</p>
                        <p class="text-red-600 text-xs uppercase font-semibold mt-1">Non-conformes</p>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-yellow-700">${stats.manual}</p>
                        <p class="text-yellow-600 text-xs uppercase font-semibold mt-1">Manuels</p>
                    </div>
                    <div class="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-slate-600">${stats.notApplicable}</p>
                        <p class="text-slate-600 text-xs uppercase font-semibold mt-1">Non applicables</p>
                    </div>
                    ${stats.incomplete > 0 ? `
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-orange-700">${stats.incomplete}</p>
                        <p class="text-orange-600 text-xs uppercase font-semibold mt-1">Incomplets</p>
                    </div>
                    ` : ''}
                    ${stats.notTested > 0 ? `
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-purple-700">${stats.notTested}</p>
                        <p class="text-purple-600 text-xs uppercase font-semibold mt-1">Non testés</p>
                    </div>
                    ` : ''}
                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                        <p class="text-3xl font-bold text-indigo-700">${stats.total}</p>
                        <p class="text-indigo-600 text-xs uppercase font-semibold mt-1">Total</p>
                    </div>
                </div>
                
                <div class="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600">
                    <p class="font-semibold mb-2 text-sm">
                        📊 Vérification des 106 critères RGAA 4.1.2
                    </p>
                    
                    <div class="space-y-2 mb-3">
                        <p class="font-semibold text-slate-700">Répartition complète :</p>
                        <p>${stats.passed} Conformes + ${stats.failed} Non-conformes + ${stats.manual} Manuels + ${stats.notApplicable} Non applicables${stats.incomplete > 0 ? ` + ${stats.incomplete} Incomplets` : ''}${stats.notTested > 0 ? ` + ${stats.notTested} Non testés` : ''} = <strong>${stats.passed + stats.failed + stats.manual + stats.notApplicable + stats.incomplete + stats.notTested}</strong> critères ✓</p>
                    </div>
                    
                    <div class="bg-blue-50 border-l-2 border-blue-400 p-2 mb-3">
                        <p class="font-semibold text-slate-700 mb-1">Calcul du taux de conformité :</p>
                        <p class="text-slate-600">
                            ${stats.total} critères totaux<br>
                            - ${stats.notApplicable} non applicables (éléments absents)<br>
                            = <strong>${applicableCriteria} critères applicables</strong>
                        </p>
                        <p class="text-slate-600 mt-2">
                            ${applicableCriteria} critères applicables<br>
                            - ${stats.manual} manuels (test humain requis)<br>
                            ${stats.notTested > 0 ? `- ${stats.notTested} non testés (mapping incomplet)<br>` : ''}
                            = <strong>${testableAutomatedCriteria} critères testés automatiquement</strong>
                        </p>
                        <p class="text-blue-700 font-bold mt-2">
                            ➜ Taux de conformité : ${stats.passed} / ${testableAutomatedCriteria} = ${compliancePercent}%
                        </p>
                    </div>
                    
                    <p class="text-[10px] text-slate-500 border-t pt-2 mt-2">
                        <strong>Note :</strong> Conformément aux règles RGAA, seuls les critères applicables (présents sur la page) sont pris en compte dans le calcul du taux de conformité. 
                        <br><br>
                        <strong>Critères "Non applicables"</strong> : Éléments qui n'existent pas sur cette page (ex: iframes, vidéos, tableaux de données complexes) - <em>exclus du calcul</em>.
                        <br>
                        <strong>Critères "Non testés"</strong> : Règles mappées mais non exécutées (limitation de l'outil) - <em>comptés comme nécessitant vérification manuelle</em>.
                    </p>
                </div>
            </section>

            <!-- Détails des contenus non accessibles -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Détails des contenus non accessibles</h2>
                
                <h3 class="text-xl font-bold mb-3 text-slate-800">Non-conformités :</h3>
                
                ${violations.length > 0 ? `
                    <ul class="space-y-3 mb-6">
                        ${violations.map((v, index) => `
                            <li class="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                                <p class="font-semibold text-slate-900">${index + 1}. ${escapeHtml(v.help)}</p>
                                <p class="text-sm text-slate-600 mt-1">
                                    <span class="font-medium">Critère RGAA ${v.criterion} :</span> ${escapeHtml(v.title)}
                                </p>
                                <p class="text-xs text-slate-500 mt-1">
                                    Impact : <span class="uppercase font-bold">${v.impact}</span>
                                </p>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <p class="text-green-700 bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                        ✓ Aucune non-conformité détectée par les tests automatisés.
                    </p>
                `}
                
                <h3 class="text-xl font-bold mb-3 text-slate-800">Dérogations pour charge disproportionnée :</h3>
                <p class="text-slate-600 mb-6 italic">Aucune dérogation n'est invoquée.</p>
                
                <h3 class="text-xl font-bold mb-3 text-slate-800">Contenus non soumis à l'obligation d'accessibilité :</h3>
                <ul class="list-disc list-inside space-y-2 ml-4 text-slate-600">
                    <li>Cartographie tierce (ex: Google Maps)</li>
                    <li>Lecteurs de fichiers PDF d'archives</li>
                    <li>Contenus de tiers non maîtrisés</li>
                </ul>
            </section>

            <!-- Établissement de cette déclaration -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Établissement de cette déclaration d'accessibilité</h2>
                <p class="mb-2">Cette déclaration a été établie le <strong>${currentDate}</strong>.</p>
                <p>Elle a été mise à jour le <strong>${currentDate}</strong>.</p>
            </section>

            <!-- Technologies utilisées -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Technologies utilisées pour la réalisation du site</h2>
                <ul class="list-disc list-inside space-y-1 ml-4">
                    <li>HTML5</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                </ul>
            </section>

            <!-- Environnement de test -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Environnement de test</h2>
                <p class="mb-4">
                    Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA :
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Navigateur :</strong> Google Chrome / Firefox / Safari</li>
                    <li><strong>Technologies d'assistance :</strong> NVDA / VoiceOver / JAWS</li>
                </ul>
            </section>

            <!-- Pages testées -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Pages du site ayant fait l'objet de la vérification de conformité</h2>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    ${testedPages.map(page => `
                        <li><strong>${escapeHtml(page.name)} :</strong> <a href="${escapeHtml(page.url)}" class="text-blue-600 underline hover:text-blue-800">${escapeHtml(page.url)}</a></li>
                    `).join('')}
                </ul>
            </section>

            <!-- Retour d'information et contact -->
            <section>
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Retour d'information et contact</h2>
                <p class="mb-4">
                    Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable du site pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme :
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Email :</strong> <a href="mailto:${email}" class="text-blue-600 underline hover:text-blue-800">${email}</a></li>
                    <li><strong>Formulaire :</strong> <a href="${contactForm}" class="text-blue-600 underline hover:text-blue-800">${contactForm === '[Lien vers formulaire de contact]' ? '[Lien vers formulaire de contact]' : 'Accéder au formulaire'}</a></li>
                </ul>
            </section>

            <!-- Voies de recours -->
            <section class="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h2 class="text-2xl font-bold mb-4 pb-2 section-title">Voies de recours</h2>
                <p class="mb-4">
                    Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, vous pouvez saisir le Défenseur des droits :
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li>Écrire un message au Défenseur des droits : <a href="https://formulaire.defenseurdesdroits.fr/" target="_blank" rel="noopener" class="text-blue-600 underline hover:text-blue-800">https://formulaire.defenseurdesdroits.fr/</a></li>
                    <li>Contacter le délégué du Défenseur des droits dans votre région</li>
                    <li>Appeler le numéro de téléphone : <strong>09 69 39 00 00</strong></li>
                    <li>Envoyer un courrier par la poste (gratuit, sans timbre) : <strong>Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07</strong></li>
                </ul>
            </section>

        </main>

        <footer class="mt-16 pt-8 border-t text-center text-sm text-slate-500">
            <p>© ${new Date().getFullYear()} ${escapeHtml(entityName)} - Tous droits réservés</p>
            <p class="mt-2 text-xs">Document généré automatiquement par TonAuditAI v2.0 le ${currentDate}</p>
        </footer>

    </div>
</body>
</html>
    `;

    fs.writeFileSync('reports/declaration_accessibilite.html', htmlContent);
    console.log("\n📄 DÉCLARATION D'ACCESSIBILITÉ GÉNÉRÉE: reports/declaration_accessibilite.html");
    console.log(`📊 Conformité: ${compliancePercent}% | Statut: ${conformityStatus}`);
}

module.exports = {
    generateDeclarationAccessibilite
};
