const fs = require('fs');
const path = require('path');
const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');

/**
 * Export comprehensive audit data as JSON
 * This data will be consumed by the React frontend
 */
function exportAuditData(auditResults) {
    const {
        url,
        results,
        co2Data,
        totalBytes,
        automatedTests,
        automatedWithHumanCheck,
        manualChecks,
        aiChecks,
        llmAvailable,
        llmAnalysisResults,
        rgaaStatus,
        timestamp = new Date().toISOString()
    } = auditResults;

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

    // Update with automated test results
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
            allCriteria[test.article].llmAnalysis = test.llmAnalysis || null;
            allCriteria[test.article].llmStatus = test.llmStatus || 'not_analyzed';
        }
    });

    // Update with manual check results
    manualChecks.forEach(check => {
        if (allCriteria[check.article]) {
            allCriteria[check.article].result = 'requires_manual_check';
            allCriteria[check.article].llmAnalysis = check.llmAnalysis || null;
            allCriteria[check.article].llmStatus = check.status || 'not_analyzed';
            allCriteria[check.article].testedBy = 'manual';
        }
    });

    // Update with AI check results
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
        passed: 0,
        failed: 0,
        passedNeedsReview: 0,
        failedNeedsReview: 0,
        requiresManual: 0,
        requiresAI: 0,
        notTested: 0,
        byAutomation: automatedTests.length,
        byAI: aiChecks.length,
        byManual: manualChecks.length,
        byHybrid: automatedWithHumanCheck.length
    };

    Object.values(allCriteria).forEach(criterion => {
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
        } else if (criterion.result === 'not_tested') {
            stats.notTested++;
        }
    });

    // Calculate scores
    const totalViolations = results.violations.length;
    const accessibilityScore = Math.max(0, 100 - (totalViolations * 3));
    
    // Legal risk calculations (2026 enforcement)
    const technicalRisk = totalViolations > 0 ? 50000 : 0;
    const adminRisk = 25000;
    const totalExposure = technicalRisk + adminRisk;

    // Build comprehensive data export
    const exportData = {
        meta: {
            version: '1.0.0',
            generatedAt: timestamp,
            url,
            llmAvailable
        },
        summary: {
            accessibilityScore,
            totalViolations,
            legalRisk: {
                technical: technicalRisk,
                administrative: adminRisk,
                total: totalExposure
            },
            carbon: {
                perVisit: co2Data,
                totalBytes,
                pageSizeMB: (totalBytes / 1024 / 1024).toFixed(2)
            }
        },
        statistics: stats,
        criteria: allCriteria,
        violations: results.violations.map(violation => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            tags: violation.tags,
            nodes: violation.nodes.map(node => ({
                html: node.html,
                impact: node.impact,
                target: node.target,
                failureSummary: node.failureSummary
            }))
        })),
        passes: results.passes.map(pass => ({
            id: pass.id,
            description: pass.description,
            help: pass.help,
            tags: pass.tags,
            nodes: pass.nodes.length
        })),
        incomplete: results.incomplete.map(inc => ({
            id: inc.id,
            description: inc.description,
            help: inc.help,
            helpUrl: inc.helpUrl,
            tags: inc.tags,
            nodes: inc.nodes.length
        })),
        rgaaCompliance: rgaaStatus
    };

    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data', 'audits');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save with timestamp
    const filename = `audit_${new Date().getTime()}.json`;
    const filepath = path.join(dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    // Also save as "latest" for easy React access
    const latestPath = path.join(dataDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(exportData, null, 2));

    console.log(`\n💾 Audit data exported to: ${filename}`);
    console.log(`💾 Latest audit available at: data/audits/latest.json`);

    return {
        filename,
        filepath,
        data: exportData
    };
}

module.exports = { exportAuditData };
