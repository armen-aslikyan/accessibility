/**
 * Regenerate the comprehensive RGAA report from the last audit data
 * This script simulates the report generation without re-running the full audit
 */

const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');
const { generateComprehensiveRGAAReport } = require('./comprehensiveRGAAReport.js');

// Create sample data structure (you can customize this with your actual audit results)
const automatedTests = [];
const automatedWithHumanCheck = [];
const manualChecks = [];
const aiChecks = [];

// Categorize all criteria
Object.entries(rgaaFlatMapping).forEach(([article, criterion]) => {
    const criterionData = {
        article,
        ...criterion,
        violations: []
    };

    if (criterion.testMethod === 'axe-core') {
        automatedTests.push(criterionData);
    } else if (criterion.testMethod === 'axe-core,ai' || criterion.testMethod === 'axe-core,manual') {
        automatedWithHumanCheck.push(criterionData);
    } else if (criterion.testMethod === 'manual') {
        manualChecks.push({
            ...criterionData,
            llmAnalysis: 'Sample LLM analysis (regenerate from actual audit for real data)',
            status: 'not_analyzed'
        });
    } else if (criterion.testMethod === 'ai') {
        aiChecks.push({
            ...criterionData,
            llmAnalysis: 'Sample LLM analysis (regenerate from actual audit for real data)',
            status: 'not_analyzed'
        });
    }
});

// Generate the report
generateComprehensiveRGAAReport({
    url: 'https://vivatechnology.com',
    automatedTests,
    automatedWithHumanCheck,
    manualChecks,
    aiChecks,
    llmAvailable: true,
    timestamp: new Date().toISOString()
});

console.log('\n✅ Report regenerated with fixed JavaScript!');
console.log('📁 Check the reports/ folder for the new file.');
console.log('\n💡 To get a report with real audit data and LLM analysis, run: node audit.js');
