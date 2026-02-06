const fs = require('fs');
const path = require('path');
const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');

/**
 * Compliance status constants (must match llmClient.js)
 */
const COMPLIANCE_STATUS = {
    COMPLIANT: 'compliant',
    NON_COMPLIANT: 'non_compliant',
    NOT_APPLICABLE: 'not_applicable',
    NEEDS_REVIEW: 'needs_review'
};

/**
 * Export comprehensive audit data as JSON
 * This data will be consumed by the React frontend
 * 
 * NEW FORMAT (v2): Outcome-based categorization
 * - Compliant: Criterion is met
 * - Non-Compliant: Criterion has violations
 * - Not Applicable: No relevant elements exist
 * - Needs Review: AI couldn't determine with confidence
 */
function exportAuditData(auditResults) {
    const {
        url,
        results,
        co2Data,
        totalBytes,
        // New outcome-based format
        auditResults: outcomeResults,
        complianceRate,
        llmAvailable,
        model,
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
            // New status-based fields
            status: COMPLIANCE_STATUS.NEEDS_REVIEW,
            preliminaryStatus: null, // AI's preliminary assessment for needs_review items
            confidence: 0,
            reasoning: null,
            issues: [],
            recommendations: [],
            testedBy: null,
            elementCount: -1
        };
    });

    // If we have new outcome-based results, use them
    if (outcomeResults && outcomeResults.all) {
        outcomeResults.all.forEach(result => {
            if (allCriteria[result.criterion]) {
                allCriteria[result.criterion].status = result.status;
                allCriteria[result.criterion].preliminaryStatus = result.preliminaryStatus || null;
                allCriteria[result.criterion].confidence = result.confidence;
                allCriteria[result.criterion].reasoning = result.reasoning;
                allCriteria[result.criterion].issues = result.issues || [];
                allCriteria[result.criterion].recommendations = result.recommendations || [];
                allCriteria[result.criterion].testedBy = result.testedBy;
                allCriteria[result.criterion].elementCount = result.elementCount;
                allCriteria[result.criterion].timestamp = result.timestamp;
                allCriteria[result.criterion].fromCache = result.fromCache;
            }
        });
    }

    // Calculate statistics from outcome-based results
    const stats = {
        total: Object.keys(allCriteria).length,
        compliant: outcomeResults?.compliant?.length || 0,
        nonCompliant: outcomeResults?.nonCompliant?.length || 0,
        notApplicable: outcomeResults?.notApplicable?.length || 0,
        needsReview: outcomeResults?.needsReview?.length || 0,
        analyzed: outcomeResults?.all?.length || 0
    };

    // Calculate compliance rate
    const applicableCount = stats.analyzed - stats.notApplicable;
    const calculatedComplianceRate = applicableCount > 0 
        ? ((stats.compliant / applicableCount) * 100).toFixed(1)
        : 0;

    // Calculate scores
    const totalViolations = results.violations.length;
    const accessibilityScore = Math.max(0, 100 - (stats.nonCompliant * 3));
    
    // Legal risk calculations (2026 enforcement)
    const technicalRisk = stats.nonCompliant > 0 ? 50000 : 0;
    const adminRisk = 25000;
    const totalExposure = technicalRisk + adminRisk;

    // Build comprehensive data export (v2 format)
    const exportData = {
        meta: {
            version: '2.0.0',
            generatedAt: timestamp,
            url,
            llmAvailable,
            model: model || 'unknown'
        },
        summary: {
            accessibilityScore,
            complianceRate: complianceRate || parseFloat(calculatedComplianceRate),
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
        // New outcome-based statistics
        statistics: stats,
        // All criteria with their status
        criteria: allCriteria,
        // Grouped by outcome for easy frontend access
        byStatus: {
            compliant: outcomeResults?.compliant || [],
            nonCompliant: outcomeResults?.nonCompliant || [],
            notApplicable: outcomeResults?.notApplicable || [],
            needsReview: outcomeResults?.needsReview || []
        },
        // Raw axe-core results
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
