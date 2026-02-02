const fs = require('fs');
const path = require('path');
const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');

function generateComprehensiveRGAAReport(data) {
    const { 
        url, 
        automatedTests = [], 
        automatedWithHumanCheck = [],
        manualChecks = [],
        aiChecks = [],
        llmAvailable = false,
        timestamp 
    } = data;

    // Create a comprehensive map of all criteria with their results
    const allCriteria = {};
    
    // Initialize with all 106 criteria from mapping
    Object.entries(rgaaFlatMapping).forEach(([article, criterion]) => {
        allCriteria[article] = {
            ...criterion,
            article,
            testMethod: criterion.testMethod,
            result: 'not_tested',
            needsReview: false,
            testedBy: null,
            violations: [],
            llmAnalysis: null,
            llmStatus: null
        };
    });

    // Update with automated test results (axe-core only)
    automatedTests.forEach(test => {
        if (allCriteria[test.article]) {
            allCriteria[test.article].result = test.violations.length > 0 ? 'failed' : 'passed';
            allCriteria[test.article].violations = test.violations || [];
            allCriteria[test.article].testedBy = 'automated';
        }
    });

    // Update with automated + human check results (with AI analysis)
    automatedWithHumanCheck.forEach(test => {
        if (allCriteria[test.article]) {
            const hasViolations = test.violations.length > 0;
            allCriteria[test.article].result = hasViolations ? 'failed' : 'passed';
            allCriteria[test.article].needsReview = true;
            allCriteria[test.article].violations = test.violations || [];
            allCriteria[test.article].testedBy = 'automated+manual';
            // Add AI analysis if available
            allCriteria[test.article].llmAnalysis = test.llmAnalysis || null;
            allCriteria[test.article].llmStatus = test.llmStatus || 'not_analyzed';
        }
    });

    // Update with manual check results (with LLM analysis)
    manualChecks.forEach(check => {
        if (allCriteria[check.article]) {
            allCriteria[check.article].result = 'requires_manual_check';
            allCriteria[check.article].llmAnalysis = check.llmAnalysis || null;
            allCriteria[check.article].llmStatus = check.status || 'not_analyzed';
            allCriteria[check.article].testedBy = 'manual';
        }
    });

    // Update with AI check results (with LLM analysis)
    aiChecks.forEach(check => {
        if (allCriteria[check.article]) {
            allCriteria[check.article].result = 'requires_ai_check';
            allCriteria[check.article].llmAnalysis = check.llmAnalysis || null;
            allCriteria[check.article].llmStatus = check.status || 'not_analyzed';
            allCriteria[check.article].testedBy = 'ai';
        }
    });

    // Calculate statistics
    const stats = {
        total: Object.keys(allCriteria).length,
        // By Result
        passed: 0,
        failed: 0,
        passedNeedsReview: 0,
        failedNeedsReview: 0,
        requiresManual: 0,
        requiresAI: 0,
        notTested: 0,
        // By Method
        byAutomation: 0,
        byAI: 0,
        byManual: 0,
        byHybrid: 0
    };

    Object.values(allCriteria).forEach(criterion => {
        // Count by result
        if (criterion.result === 'passed' && !criterion.needsReview) {
            stats.passed++;
        } else if (criterion.result === 'failed' && !criterion.needsReview) {
            stats.failed++;
        } else if (criterion.result === 'passed' && criterion.needsReview) {
            stats.passedNeedsReview++;
        } else if (criterion.result === 'failed' && criterion.needsReview) {
            stats.failedNeedsReview++;
        } else if (criterion.result === 'requires_manual_check') {
            stats.requiresManual++;
        } else if (criterion.result === 'requires_ai_check') {
            stats.requiresAI++;
        } else {
            stats.notTested++;
        }

        // Count by method
        if (criterion.testedBy === 'automated') stats.byAutomation++;
        else if (criterion.testedBy === 'ai') stats.byAI++;
        else if (criterion.testedBy === 'manual') stats.byManual++;
        else if (criterion.testedBy === 'automated+manual') stats.byHybrid++;
    });

    // Generate HTML report
    const html = generateHTML(allCriteria, stats, url, timestamp, llmAvailable);

    // Write report to file
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `rgaa_comprehensive_all_106_${Date.now()}.html`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, html);
    console.log(`\n✨ Comprehensive RGAA Report generated: ${filename}`);
}

function generateHTML(allCriteria, stats, url, timestamp, llmAvailable) {
    const criteriaArray = Object.values(allCriteria).sort((a, b) => {
        const [aMajor, aMinor] = a.article.split('.').map(Number);
        const [bMajor, bMinor] = b.article.split('.').map(Number);
        return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport RGAA Complet - 106 Critères</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        header p {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .meta-info {
            background: #f8f9fa;
            padding: 20px 40px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 0.85em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .meta-value {
            font-size: 1.1em;
            color: #495057;
            margin-top: 5px;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .stat-card.total .stat-number { color: #6c757d; }
        .stat-card.passed .stat-number { color: #28a745; }
        .stat-card.failed .stat-number { color: #dc3545; }
        .stat-card.review .stat-number { color: #ffc107; }
        .stat-card.manual .stat-number { color: #17a2b8; }
        .stat-card.ai .stat-number { color: #6f42c1; }

        .filter-bar {
            padding: 20px 40px;
            background: white;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-btn {
            padding: 10px 20px;
            border: 2px solid #e9ecef;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
            transition: all 0.2s;
        }

        .filter-btn:hover {
            background: #f8f9fa;
        }

        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .filter-btn.all { border-color: #6c757d; }
        .filter-btn.passed { border-color: #28a745; }
        .filter-btn.failed { border-color: #dc3545; }
        .filter-btn.review { border-color: #ffc107; }
        .filter-btn.manual { border-color: #17a2b8; }
        .filter-btn.ai { border-color: #6f42c1; }

        .criteria-list {
            padding: 40px;
        }

        .criterion-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            transition: all 0.3s;
        }

        .criterion-card:hover {
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .criterion-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
            gap: 20px;
        }

        .criterion-title {
            flex: 1;
        }

        .criterion-number {
            font-size: 1.3em;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }

        .criterion-desc {
            font-size: 1.05em;
            color: #495057;
            margin-bottom: 10px;
        }

        .criterion-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }

        .badge {
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge.level-a { background: #28a745; color: white; }
        .badge.level-aa { background: #ffc107; color: #000; }
        .badge.level-aaa { background: #dc3545; color: white; }
        .badge.risk-critical { background: #dc3545; color: white; }
        .badge.risk-high { background: #fd7e14; color: white; }
        .badge.risk-medium { background: #ffc107; color: #000; }
        .badge.risk-low { background: #20c997; color: white; }
        .badge.test-method { background: #6c757d; color: white; }
        .badge.badge-method-auto { background: #17a2b8; color: white; }
        .badge.badge-method-hybrid { background: #ffc107; color: #000; }
        .badge.badge-method-ai { background: #6f42c1; color: white; }
        .badge.badge-method-manual { background: #6c757d; color: white; }

        .status-badge {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.9em;
            font-weight: 700;
            white-space: nowrap;
        }

        .status-passed { background: #d4edda; color: #155724; border: 2px solid #28a745; }
        .status-failed { background: #f8d7da; color: #721c24; border: 2px solid #dc3545; }
        .status-passed-review { background: #fff3cd; color: #856404; border: 2px solid #ffc107; }
        .status-failed-review { background: #fff3cd; color: #856404; border: 2px solid #fd7e14; }
        .status-manual { background: #d1ecf1; color: #0c5460; border: 2px solid #17a2b8; }
        .status-ai { background: #e2d9f3; color: #432874; border: 2px solid #6f42c1; }
        .status-not-tested { background: #e9ecef; color: #495057; border: 2px solid #adb5bd; }

        .criterion-details {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
        }

        .detail-section {
            margin-bottom: 15px;
        }

        .detail-label {
            font-weight: 700;
            color: #495057;
            margin-bottom: 5px;
            font-size: 0.95em;
        }

        .detail-content {
            color: #6c757d;
            font-size: 0.95em;
            line-height: 1.6;
        }

        .violations-list {
            background: #fff5f5;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin-top: 10px;
            border-radius: 4px;
        }

        .violation-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f8d7da;
        }

        .violation-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .violation-help {
            font-weight: 600;
            color: #721c24;
            margin-bottom: 8px;
        }

        .violation-nodes {
            font-size: 0.9em;
            color: #6c757d;
        }

        .llm-analysis {
            background: #f8f9fa;
            border-left: 4px solid #6f42c1;
            padding: 20px;
            margin-top: 15px;
            border-radius: 4px;
        }

        .llm-analysis-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-weight: 700;
            color: #6f42c1;
        }

        .llm-analysis-content {
            color: #495057;
            white-space: pre-wrap;
            line-height: 1.7;
        }

        .no-llm-notice {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            color: #856404;
        }

        .expand-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
            margin-top: 10px;
            transition: background 0.2s;
        }

        .expand-btn:hover {
            background: #5568d3;
        }

        .hidden {
            display: none;
        }

        footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 30px;
            font-size: 0.9em;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .filter-bar {
                display: none;
            }
            .expand-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 Rapport RGAA 4.1 Complet</h1>
            <p>Analyse détaillée des 106 critères d'accessibilité</p>
        </header>

        <div class="meta-info">
            <div class="meta-item">
                <span class="meta-label">URL Auditée</span>
                <span class="meta-value">${url}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Date</span>
                <span class="meta-value">${new Date(timestamp).toLocaleString('fr-FR')}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">LLM Status</span>
                <span class="meta-value">${llmAvailable ? '✅ Actif' : '❌ Non disponible'}</span>
            </div>
        </div>

        <div class="stats">
            <div class="stat-card total">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Critères</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-number">${stats.passed}</div>
                <div class="stat-label">✅ Conformes</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-number">${stats.failed}</div>
                <div class="stat-label">❌ Non-conformes</div>
            </div>
            <div class="stat-card review">
                <div class="stat-number">${stats.passedNeedsReview + stats.failedNeedsReview}</div>
                <div class="stat-label">⚠️ Révision Humaine</div>
            </div>
            <div class="stat-card manual">
                <div class="stat-number">${stats.requiresManual}</div>
                <div class="stat-label">📝 Test Manuel</div>
            </div>
            <div class="stat-card ai">
                <div class="stat-number">${stats.requiresAI}</div>
                <div class="stat-label">🤖 Analyse IA</div>
            </div>
        </div>

        <div class="meta-info" style="border-top: 1px solid #e9ecef;">
            <div class="meta-item">
                <span class="meta-label">Méthodes de Test Utilisées</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">🤖 Automatisés</span>
                <span class="meta-value">${stats.byAutomation} critères</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">🤖👤 Automatisés + Humain</span>
                <span class="meta-value">${stats.byHybrid} critères</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">🧠 Analyse IA</span>
                <span class="meta-value">${stats.byAI} critères</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">👤 Manuel seul</span>
                <span class="meta-value">${stats.byManual} critères</span>
            </div>
        </div>

        <div class="filter-bar">
            <span style="font-weight: 600; color: #6c757d; margin-right: 10px;">Filtrer par résultat:</span>
            <button class="filter-btn all active" data-filter="all">Tous</button>
            <button class="filter-btn passed" data-filter="passed">✅ Conformes</button>
            <button class="filter-btn failed" data-filter="failed">❌ Non-conformes</button>
            <button class="filter-btn review" data-filter="review">⚠️ À Réviser</button>
            <button class="filter-btn manual" data-filter="manual">📝 Test Manuel</button>
            <button class="filter-btn ai" data-filter="ai">🤖 Analyse IA</button>
        </div>

        <div class="criteria-list">
            ${criteriaArray.map(criterion => generateCriterionCard(criterion, llmAvailable)).join('')}
        </div>

        <footer>
            <p>Généré par Vivatech Audit POC • RGAA 4.1 • ${new Date().getFullYear()}</p>
            <p style="margin-top: 10px; opacity: 0.8;">Rapport automatisé avec analyse axe-core ${llmAvailable ? '+ LLM Intelligence' : ''}</p>
        </footer>
    </div>

    <script>
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing event listeners');
            
            // Filter buttons event delegation
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    console.log('Filtering by:', filter);
                    
                    const cards = document.querySelectorAll('.criterion-card');
                    
                    // Update active button
                    filterButtons.forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Filter cards
                    cards.forEach(function(card) {
                        const status = card.getAttribute('data-status');
                        if (filter === 'all') {
                            card.style.display = 'block';
                        } else if (filter === status) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
            
            // Expand/collapse buttons event delegation
            const expandButtons = document.querySelectorAll('.expand-btn');
            expandButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    const criterionId = this.getAttribute('data-criterion-id');
                    console.log('Toggling details for:', criterionId);
                    
                    const details = document.getElementById('details-' + criterionId);
                    
                    if (!details) {
                        console.error('Details element not found for:', criterionId);
                        return;
                    }
                    
                    if (details.classList.contains('hidden')) {
                        details.classList.remove('hidden');
                        this.textContent = '▼ Masquer les détails';
                    } else {
                        details.classList.add('hidden');
                        this.textContent = '▶ Voir les détails';
                    }
                });
            });
            
            console.log('✅ Event listeners initialized');
            console.log('Filter buttons:', filterButtons.length);
            console.log('Expand buttons:', expandButtons.length);
        });
    </script>
</body>
</html>`;
}

function generateCriterionCard(criterion, llmAvailable) {
    // Determine result status for display and filtering
    let resultStatus, resultClass, resultText, filterStatus;
    
    if (criterion.result === 'passed' && !criterion.needsReview) {
        resultStatus = 'passed';
        resultClass = 'status-passed';
        resultText = '✅ Conforme';
        filterStatus = 'passed';
    } else if (criterion.result === 'failed' && !criterion.needsReview) {
        resultStatus = 'failed';
        resultClass = 'status-failed';
        resultText = '❌ Non-conforme';
        filterStatus = 'failed';
    } else if (criterion.result === 'passed' && criterion.needsReview) {
        resultStatus = 'passed_review';
        resultClass = 'status-passed-review';
        resultText = '⚠️ Conforme (à réviser)';
        filterStatus = 'review';
    } else if (criterion.result === 'failed' && criterion.needsReview) {
        resultStatus = 'failed_review';
        resultClass = 'status-failed-review';
        resultText = '⚠️ Non-conforme (à réviser)';
        filterStatus = 'review';
    } else if (criterion.result === 'requires_manual_check') {
        resultStatus = 'manual';
        resultClass = 'status-manual';
        resultText = '📝 Nécessite test manuel';
        filterStatus = 'manual';
    } else if (criterion.result === 'requires_ai_check') {
        resultStatus = 'ai';
        resultClass = 'status-ai';
        resultText = '🤖 Nécessite analyse IA';
        filterStatus = 'ai';
    } else {
        resultStatus = 'not_tested';
        resultClass = 'status-not-tested';
        resultText = '⚪ Non testé';
        filterStatus = 'not_tested';
    }

    // Determine test method badge
    let methodBadge = '';
    if (criterion.testedBy === 'automated') {
        methodBadge = '<span class="badge badge-method-auto">🤖 Test automatisé</span>';
    } else if (criterion.testedBy === 'automated+manual') {
        methodBadge = '<span class="badge badge-method-hybrid">🤖👤 Auto + Révision</span>';
    } else if (criterion.testedBy === 'ai') {
        methodBadge = '<span class="badge badge-method-ai">🧠 Analysé par IA</span>';
    } else if (criterion.testedBy === 'manual') {
        methodBadge = '<span class="badge badge-method-manual">👤 Test manuel requis</span>';
    }
    
    const levelClass = criterion.level ? `level-${criterion.level.toLowerCase()}` : 'level-a';
    const riskClass = criterion.risk ? `risk-${criterion.risk.toLowerCase()}` : 'risk-medium';
    
    const hasViolations = criterion.violations && criterion.violations.length > 0;
    const hasLLMAnalysis = criterion.llmAnalysis && criterion.llmStatus === 'analyzed';
    // Show details for: violations, LLM analysis, OR manual/AI checks that need testing
    const needsManualOrAI = criterion.result === 'requires_manual_check' || criterion.result === 'requires_ai_check';
    const hasDetails = hasViolations || hasLLMAnalysis || needsManualOrAI;

    return `
        <div class="criterion-card" data-status="${filterStatus}">
            <div class="criterion-header">
                <div class="criterion-title">
                    <div class="criterion-number">RGAA ${criterion.article}</div>
                    <div class="criterion-desc">${criterion.desc || 'Description non disponible'}</div>
                    <div class="criterion-badges">
                        <span class="badge ${levelClass}">Niveau ${criterion.level || 'A'}</span>
                        <span class="badge ${riskClass}">${criterion.risk || 'Medium'} Risk</span>
                        ${methodBadge}
                    </div>
                </div>
                <div class="status-badge ${resultClass}">
                    ${resultText}
                </div>
            </div>

            ${hasDetails ? `
                <button class="expand-btn" id="btn-${criterion.article}" data-criterion-id="${criterion.article}">
                    ▶ Voir les détails
                </button>

                <div id="details-${criterion.article}" class="criterion-details hidden">
                    ${hasViolations ? `
                        <div class="violations-list">
                            <div class="detail-label">❌ Violations détectées (${criterion.violations.length})</div>
                            ${criterion.violations.map(violation => `
                                <div class="violation-item">
                                    <div class="violation-help">${violation.help || 'Violation'}</div>
                                    <div class="violation-nodes">
                                        ${violation.nodes ? `${violation.nodes.length} élément(s) affecté(s)` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="detail-section">
                        <div class="detail-label">🛠️ Solution recommandée</div>
                        <div class="detail-content">${criterion.fix || 'Non spécifié'}</div>
                    </div>

                    <div class="detail-section">
                        <div class="detail-label">💰 Impact financier</div>
                        <div class="detail-content">${criterion.financial || 'Non spécifié'}</div>
                    </div>

                    <div class="detail-section">
                        <div class="detail-label">✨ Impact marque</div>
                        <div class="detail-content">${criterion.brand || 'Non spécifié'}</div>
                    </div>

                    ${hasLLMAnalysis ? `
                        <div class="llm-analysis">
                            <div class="llm-analysis-header">
                                <span>🤖</span>
                                <span>Analyse IA (LLM)</span>
                            </div>
                            <div class="llm-analysis-content">${escapeHtml(criterion.llmAnalysis)}</div>
                        </div>
                    ` : (criterion.result === 'requires_ai_check' || criterion.result === 'requires_manual_check') ? `
                        <div class="no-llm-notice">
                            ⚠️ Analyse IA non disponible. Démarrez le serveur Ollama pour activer l'analyse automatique.
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    generateComprehensiveRGAAReport
};
