const fs = require('fs');
// Ensure this path is correct for your project structure
const rgaaMasterMapping = require('./rgaaMapping.js'); 

// Escape HTML to prevent injection and layout breaking
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateProReport(results, co2Data, url) {
    const totalViolations = results.violations.length;
    
    // SCORING LOGIC
    const score = Math.max(0, 100 - (totalViolations * 3));
    
    // LEGAL RISK LOGIC (Updated for 2026 Enforcement)
    // Technical Fine (Art. 47 / Ordonnance 2023-859): Up to €50k for public/large entities
    const technicalRisk = totalViolations > 0 ? 50000 : 0; 
    // Declarative Fine: €25k for missing Accessibility Statement/Page
    const adminRisk = 25000; 
    const totalExposure = technicalRisk + adminRisk;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Rapport Audit Accessibilité & Carbone - ${url}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .risk-gradient { background: linear-gradient(90deg, #fee2e2 0%, #fecaca 100%); }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-900 font-sans leading-relaxed">
        <div class="max-w-5xl mx-auto py-12 px-6">
            
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-slate-200 pb-8">
                <div>
                    <h1 class="text-3xl font-black text-slate-900 tracking-tight">RAPPORT DE CONFORMITÉ 2026</h1>
                    <p class="text-lg text-slate-500 font-medium">Cible : <span class="font-mono text-indigo-600">${url}</span></p>
                </div>
                <div class="mt-4 md:mt-0 text-left md:text-right">
                    <div class="inline-block bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-2">TonAuditAI v2.0</div>
                    <p class="text-sm text-slate-400 font-bold uppercase">${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                </div>
            </header>

            <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-slate-200">
                <div class="bg-red-600 px-8 py-3">
                    <p class="text-white text-xs font-black uppercase tracking-widest">Alerte Exposition Juridique (Loi n° 2023-171 & EAA 2025)</p>
                </div>
                <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p class="text-slate-500 font-bold uppercase text-xs mb-1">Risque Sanction Cumulé</p>
                        <p class="text-6xl font-black text-red-600 tracking-tighter">€${totalExposure.toLocaleString()}</p>
                        <p class="text-sm text-slate-400 mt-2 font-medium italic">*Estimation basée sur les plafonds de l'Ordonnance n° 2023-859</p>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <div class="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <p class="text-sm text-slate-600"><strong>€50,000 :</strong> Amende technique max (renouvelable tous les 6 mois).</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <p class="text-sm text-slate-600"><strong>€25,000 :</strong> Amende pour défaut de déclaration d'accessibilité.</p>
                        </div>
                        <div class="flex items-start gap-3 border-t pt-3 mt-3">
                            <p class="text-xs text-slate-500 font-medium">Source : <a href="https://www.legifrance.gouv.fr" class="underline">Légifrance - Ordonnance du 6 sept. 2023</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <p class="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Santé Accessibilité</p>
                    <div class="flex items-end gap-2">
                        <span class="text-6xl font-black ${score > 80 ? 'text-emerald-500' : 'text-orange-500'}">${score}%</span>
                        <span class="text-slate-400 font-bold mb-2">Conformité RGAA</span>
                    </div>
                </div>
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <p class="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Éco-Conception</p>
                    <div class="flex items-end gap-2 text-emerald-700">
                        <span class="text-6xl font-black">${co2Data.toFixed(2)}g</span>
                        <span class="text-slate-400 font-bold mb-2 text-sm">CO2 par chargement</span>
                    </div>
                </div>
            </div>

            <div class="bg-indigo-50 border-l-4 border-indigo-500 p-6 mb-12 rounded-r-xl">
                <h4 class="text-indigo-900 font-black text-sm uppercase mb-2 italic">Jurisprudence & Actualité</h4>
                <p class="text-indigo-800 text-sm leading-relaxed">
                    <strong>Rappel 2025 :</strong> Les sanctions ne sont plus théoriques. L'amende record de <strong>90 000 €</strong> infligée à <strong>Vueling</strong> (2024) pour discrimination numérique a marqué le tournant répressif en Europe. En France, l'ARCOM supervise désormais activement la mise en conformité des acteurs privés.
                </p>
            </div>

            <h2 class="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                Détails de l'Audit <span class="bg-slate-200 text-slate-600 text-sm px-2 py-0.5 rounded-full">${totalViolations} Erreurs</span>
            </h2>
            
            <div class="space-y-6">
                ${results.violations.map(v => {
                    const mapping = rgaaMasterMapping[v.id] || { article: "Général", brand: "Risque de plainte usager et exclusion.", fix: "Vérifier la sémantique HTML." };
                    return `
                    <div class="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-4">
                                <span class="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider italic">Article RGAA ${mapping.article}</span>
                                <span class="text-slate-300 font-mono text-[10px]">ID: ${v.id}</span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">${escapeHtml(v.help)}</h3>
                            <p class="text-slate-500 text-sm mb-6">${escapeHtml(v.description)}</p>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100">
                                <div>
                                    <h4 class="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Impact Business</h4>
                                    <p class="text-sm text-slate-700 font-medium">${escapeHtml(mapping.brand)}</p>
                                </div>
                                <div>
                                    <h4 class="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-indigo-500">Solution Technique</h4>
                                    <p class="text-sm font-bold text-indigo-700">${escapeHtml(mapping.fix)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <footer class="mt-16 text-center border-t pt-8">
                <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest">© 2026 TonAuditAI - Solution Indépendante de Monitoring d'Accessibilité</p>
                <p class="text-slate-400 text-[9px] mt-2 italic px-12">
                    L’audit automatisé ne remplace pas une certification humaine réalisée par un expert. 
                    Le risque financier est une estimation basée sur les plafonds légaux français en vigueur au 1er janvier 2026.
                </p>
            </footer>
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync('Rapport_Audit.html', htmlContent);
    console.log("\n🚀 RAPPORT STRATÉGIQUE GÉNÉRÉ : Rapport_Audit.html");
    console.log("💰 Risque financier identifié : €" + totalExposure.toLocaleString());
}

module.exports = {
    generateProReport
};