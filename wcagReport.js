const fs = require('fs');
const wcagCriteria = require('./constants/wcagMapping.js');

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
 * Analyze WCAG compliance based on axe results
 * @param {Object} results - Axe results object
 * @returns {Object} WCAG analysis with pass/fail/manual status for each criterion
 */
function analyzeWCAGCompliance(results) {
    const wcagStatus = {};

    // Get all rule IDs that were tested
    const allRules = [
        ...results.violations.map(v => v.id),
        ...results.passes.map(p => p.id),
        ...results.incomplete.map(i => i.id),
        ...results.inapplicable.map(i => i.id)
    ];

    // For each WCAG criterion, check if its associated rules passed or failed
    Object.keys(wcagCriteria).forEach(criterionId => {
        const criterion = wcagCriteria[criterionId];
        const relatedRules = criterion.axeRules;

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
            details.push('Manual testing required - no automated rules available');
        } else {
            // Check if any rules failed
            if (violations.length > 0) {
                status = 'fail';
                violations.forEach(v => {
                    failedRules.push({
                        id: v.id,
                        help: v.help,
                        impact: v.impact,
                        nodeCount: v.nodes.length,
                        nodes: v.nodes
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
                details.push(`Not applicable: The elements checked by these rules (${inapplicableRules.join(', ')}) don't exist on this page`);
            } else {
                // Rules exist but didn't run for some reason
                status = 'not-tested';
                details.push('Rules exist but were not executed');
            }
        }

        wcagStatus[criterionId] = {
            ...criterion,
            status,
            failedRules,
            passedRules,
            inapplicableRules,
            details,
            incompleteCount: incomplete.length
        };
    });

    return wcagStatus;
}

/**
 * Generate comprehensive WCAG compliance report
 * @param {Object} results - Axe results object
 * @param {string} url - URL that was audited
 */
function generateWCAGReport(results, url) {
    const wcagStatus = analyzeWCAGCompliance(results);

    // Calculate statistics
    const stats = {
        total: Object.keys(wcagStatus).length,
        passed: 0,
        failed: 0,
        manual: 0,
        notApplicable: 0,
        incomplete: 0,
        levelA: { total: 0, passed: 0, failed: 0 },
        levelAA: { total: 0, passed: 0, failed: 0 },
        levelAAA: { total: 0, passed: 0, failed: 0 }
    };

    Object.values(wcagStatus).forEach(criterion => {
        if (criterion.status === 'pass') stats.passed++;
        else if (criterion.status === 'fail') stats.failed++;
        else if (criterion.status === 'manual') stats.manual++;
        else if (criterion.status === 'not-applicable') stats.notApplicable++;
        else if (criterion.status === 'incomplete') stats.incomplete++;

        // Level statistics
        const level = criterion.level;
        if (level === 'A') {
            stats.levelA.total++;
            if (criterion.status === 'pass') stats.levelA.passed++;
            if (criterion.status === 'fail') stats.levelA.failed++;
        } else if (level === 'AA') {
            stats.levelAA.total++;
            if (criterion.status === 'pass') stats.levelAA.passed++;
            if (criterion.status === 'fail') stats.levelAA.failed++;
        } else if (level === 'AAA') {
            stats.levelAAA.total++;
            if (criterion.status === 'pass') stats.levelAAA.passed++;
            if (criterion.status === 'fail') stats.levelAAA.failed++;
        }
    });

    // Calculate compliance percentages
    const automatedTests = stats.total - stats.manual - stats.notApplicable;
    const compliancePercent = automatedTests > 0 
        ? Math.round((stats.passed / automatedTests) * 100) 
        : 0;

    const levelAPercent = stats.levelA.total > 0
        ? Math.round(((stats.levelA.passed + stats.levelA.failed) / stats.levelA.total) * 100)
        : 0;

    const levelAAPercent = stats.levelAA.total > 0
        ? Math.round(((stats.levelAA.passed + stats.levelAA.failed) / stats.levelAA.total) * 100)
        : 0;

    // Group criteria by principle
    const principles = {
        1: { name: 'Perceivable', criteria: [] },
        2: { name: 'Operable', criteria: [] },
        3: { name: 'Understandable', criteria: [] },
        4: { name: 'Robust', criteria: [] }
    };

    Object.entries(wcagStatus).forEach(([id, criterion]) => {
        const principleNum = parseInt(id.split('.')[0]);
        principles[principleNum].criteria.push({ id, ...criterion });
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WCAG 2.1 Compliance Report - ${escapeHtml(url)}</title>
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
                        <h1 class="text-4xl font-black text-slate-900 mb-2">WCAG 2.1 Compliance Report</h1>
                        <p class="text-lg text-slate-600">Target: <span class="font-mono text-indigo-600">${escapeHtml(url)}</span></p>
                        <p class="text-sm text-slate-400 mt-1">Generated: ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <div class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                            TonAuditAI v2.0
                        </div>
                    </div>
                </div>
            </header>

            <!-- Summary Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Compliance Score</p>
                    <p class="text-5xl font-black ${compliancePercent >= 80 ? 'text-green-600' : compliancePercent >= 50 ? 'text-yellow-600' : 'text-red-600'}">${compliancePercent}%</p>
                    <p class="text-xs text-slate-500 mt-1">${stats.passed}/${automatedTests} automated tests passed</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Level A</p>
                    <p class="text-3xl font-black text-slate-700">${stats.levelA.total} Criteria</p>
                    <div class="flex gap-2 mt-2 text-xs">
                        <span class="text-green-600 font-bold">✓ ${stats.levelA.passed}</span>
                        <span class="text-red-600 font-bold">✗ ${stats.levelA.failed}</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Level AA</p>
                    <p class="text-3xl font-black text-slate-700">${stats.levelAA.total} Criteria</p>
                    <div class="flex gap-2 mt-2 text-xs">
                        <span class="text-green-600 font-bold">✓ ${stats.levelAA.passed}</span>
                        <span class="text-red-600 font-bold">✗ ${stats.levelAA.failed}</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Criteria</p>
                    <p class="text-3xl font-black text-slate-700">${stats.total}</p>
                    <p class="text-xs text-slate-500 mt-1">${stats.manual} require manual testing</p>
                </div>
            </div>

            <!-- Legend -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h3 class="text-sm font-bold text-slate-700 mb-4">Status Legend</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-pass px-3 py-1 rounded-full font-bold">✓ Pass</span>
                            <span class="text-slate-600 font-bold">${stats.passed}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Automated tests passed</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-fail px-3 py-1 rounded-full font-bold">✗ Fail</span>
                            <span class="text-slate-600 font-bold">${stats.failed}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Violations detected</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-manual px-3 py-1 rounded-full font-bold">◐ Manual</span>
                            <span class="text-slate-600 font-bold">${stats.manual}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">No automated rules exist</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-incomplete px-3 py-1 rounded-full font-bold">⚠ Review</span>
                            <span class="text-slate-600 font-bold">${stats.incomplete}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Needs manual verification</p>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-not-applicable px-3 py-1 rounded-full font-bold">- N/A</span>
                            <span class="text-slate-600 font-bold">${stats.notApplicable}</span>
                        </div>
                        <p class="text-slate-500 text-[10px]">Elements don't exist on page</p>
                    </div>
                </div>
            </div>

            <!-- WCAG Principles -->
            ${Object.entries(principles).map(([num, principle]) => `
                <div class="mb-12">
                    <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <span class="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">${num}</span>
                        ${principle.name}
                    </h2>
                    
                    <div class="space-y-4">
                        ${principle.criteria.map(criterion => {
                            const statusClass = `status-${criterion.status}`;
                            const statusIcon = criterion.status === 'pass' ? '✓' : 
                                              criterion.status === 'fail' ? '✗' : 
                                              criterion.status === 'manual' ? '◐' :
                                              criterion.status === 'incomplete' ? '⚠' : '-';
                            
                            return `
                            <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <div class="p-6">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <span class="${statusClass} px-3 py-1 rounded-full text-xs font-bold">${statusIcon} ${criterion.status.toUpperCase()}</span>
                                            <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">${criterion.number}</span>
                                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Level ${criterion.level}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 class="text-lg font-bold text-slate-800 mb-2">${criterion.name}</h3>
                                    <p class="text-sm text-slate-600 mb-4">${escapeHtml(criterion.description)}</p>
                                    
                                    ${criterion.status === 'fail' && criterion.failedRules.length > 0 ? `
                                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                            <h4 class="text-xs font-bold text-red-900 uppercase tracking-wider mb-3">Failed Rules (${criterion.failedRules.length})</h4>
                                            <div class="space-y-3">
                                                ${criterion.failedRules.map(rule => `
                                                    <div class="border-l-4 border-red-500 pl-3">
                                                        <p class="text-sm font-bold text-red-900">${escapeHtml(rule.help)}</p>
                                                        <p class="text-xs text-red-700 mt-1">Rule: <code class="bg-red-100 px-1 rounded">${rule.id}</code> | Impact: <span class="font-bold">${rule.impact.toUpperCase()}</span></p>
                                                        <p class="text-xs text-red-600 mt-1">${rule.nodeCount} element(s) affected</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'pass' && criterion.passedRules.length > 0 ? `
                                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                            <p class="text-xs text-green-700">
                                                <span class="font-bold">Passed automated checks:</span> ${criterion.passedRules.join(', ')}
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'manual' ? `
                                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                            <p class="text-xs text-yellow-800 font-medium">⚠️ Manual testing required - no automated rules available for this criterion</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.status === 'not-applicable' && criterion.inapplicableRules?.length > 0 ? `
                                        <div class="bg-slate-50 border border-slate-300 rounded-lg p-4 mt-4">
                                            <p class="text-xs text-slate-700 font-medium mb-2">
                                                ℹ️ Not Applicable - The elements that these rules check for don't exist on this page
                                            </p>
                                            <p class="text-xs text-slate-600">
                                                <span class="font-semibold">Rules that didn't run:</span> 
                                                <code class="bg-slate-200 px-1 rounded font-mono">${criterion.inapplicableRules.join(', ')}</code>
                                            </p>
                                            <p class="text-xs text-slate-500 mt-2 italic">
                                                Example: iframe rules won't run if the page has no iframes, video rules won't run if there are no videos, etc.
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    ${criterion.axeRules.length > 0 ? `
                                        <details class="mt-4">
                                            <summary class="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                                Related axe-core rules (${criterion.axeRules.length})
                                            </summary>
                                            <div class="mt-2 text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded">
                                                ${criterion.axeRules.join(', ')}
                                            </div>
                                        </details>
                                    ` : ''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}

            <!-- Footer -->
            <footer class="mt-16 text-center border-t pt-8">
                <p class="text-slate-400 text-xs uppercase font-bold tracking-widest">© 2026 TonAuditAI - WCAG 2.1 Compliance Analysis</p>
                <p class="text-slate-400 text-xs mt-2 italic">
                    This automated report identifies accessibility issues but does not replace manual testing by certified auditors.
                    Compliance percentages are based on automated tests only.
                </p>
            </footer>
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync('reports/wcag_reqs_full.html', htmlContent);
    console.log("\n📋 WCAG COMPLIANCE REPORT GENERATED: reports/wcag_reqs_full.html");
    console.log(`✓ Passed: ${stats.passed} | ✗ Failed: ${stats.failed} | ◐ Manual: ${stats.manual} | Compliance: ${compliancePercent}%`);
}

module.exports = {
    generateWCAGReport,
    analyzeWCAGCompliance
};
