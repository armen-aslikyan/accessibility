/**
 * Generate report using REAL audit data from the last run
 */

const fs = require('fs');
const path = require('path');
const { generateComprehensiveRGAAReport } = require('./comprehensiveRGAAReport.js');

// Find the most recent audit data file
const reportsDir = path.join(__dirname, 'reports');
const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('ai-analysis-raw_') && f.endsWith('.json'))
    .sort()
    .reverse();

if (files.length === 0) {
    console.log('❌ No audit data found. Run: node audit.js first');
    process.exit(1);
}

const latestFile = path.join(reportsDir, files[0]);
console.log(`📂 Using audit data from: ${files[0]}`);

// Load the real audit data
const auditData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

console.log(`\n📊 Audit Data Summary:`);
console.log(`   URL: ${auditData.url}`);
console.log(`   Date: ${auditData.auditDate}`);
console.log(`   AI Checks: ${auditData.analyses.aiChecks.length}`);
console.log(`   Manual Checks: ${auditData.analyses.manualChecks.length}`);
console.log(`   Hybrid Checks: ${auditData.analyses.hybridChecks.length}`);

// The audit data doesn't have automated test results, so we need to load from a full audit
// For now, use the data we have
generateComprehensiveRGAAReport({
    url: auditData.url,
    automatedTests: [], // Would need to re-run audit for this
    automatedWithHumanCheck: auditData.analyses.hybridChecks || [],
    manualChecks: auditData.analyses.manualChecks,
    aiChecks: auditData.analyses.aiChecks,
    llmAvailable: auditData.llmAvailable,
    timestamp: auditData.auditDate
});

console.log('\n✅ Report generated with REAL audit data!');
console.log('📁 Check reports/ folder for the latest file\n');
