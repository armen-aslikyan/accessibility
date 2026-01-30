const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { co2 } = require("@tgwf/co2");
const { rgaaFlatMapping } = require('./constants/rgaaMapping.complete.js');
const { generateProReport } = require('./visualize.js');
const { generateWCAGReport } = require('./wcagReport.js');
const { generateRGAAReport, analyzeRGAACompliance } = require('./rgaaReport.js');
const { generateDeclarationAccessibilite } = require('./declarationAccessibilite.js');
const { generateDetailedRGAAReport } = require('./rgaaDetailedReport.js');

async function runAudit(url) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Track Network Data (for Carbon Calculation)
    let totalBytes = 0;
    page.on('response', async (response) => {
        const headers = response.headers();
        if (headers['content-length']) {
            totalBytes += parseInt(headers['content-length'], 10);
        }
    });

    console.log(`--- Starting Audit for: ${url} ---`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // 2. Run Accessibility Scan
    // Optimized configuration for maximum RGAA compliance detection
    // RGAA 4.1 is based on WCAG 2.1 Level AA, so we explicitly target those rules
    const results = await new AxeBuilder({ page })
        .withTags([
            'wcag2a',     // WCAG 2.0 Level A (baseline)
            'wcag2aa',    // WCAG 2.0 Level AA
            'wcag21a',    // WCAG 2.1 Level A (RGAA requirement)
            'wcag21aa',   // WCAG 2.1 Level AA (RGAA requirement)
            'wcag22aa'    // WCAG 2.2 Level AA (forward compatibility)
        ])
        .analyze();
    
    // 3. Calculate Carbon Footprint
    const co2Emitter = new co2();
    const estimate = co2Emitter.perVisit(totalBytes);

    // 4. Process RGAA Criteria Based on Test Method
    // Create a map of violations by axe-core rule ID for quick lookup
    const violationsByRule = {};
    results.violations.forEach(violation => {
        violationsByRule[violation.id] = violation;
    });

    console.log(`\n[ RGAA COMPREHENSIVE AUDIT REPORT ]`);
    console.log(`Total axe-core Violations Found: ${results.violations.length}`);
    
    // Categorize criteria by test method
    const automatedTests = [];
    const automatedWithHumanCheck = [];
    const manualChecks = [];
    const aiChecks = [];

    Object.entries(rgaaFlatMapping).forEach(([article, criterion]) => {
        const testMethod = criterion.testMethod;
        const axeRules = criterion.axeRules || [];
        
        // Check if any of the criterion's axe rules have violations
        const relatedViolations = axeRules
            .map(ruleId => violationsByRule[ruleId])
            .filter(Boolean);

        const criterionData = {
            article,
            ...criterion,
            violations: relatedViolations
        };

        if (testMethod === 'axe-core') {
            automatedTests.push(criterionData);
        } else if (testMethod === 'axe-core,ai' || testMethod === 'axe-core,manual') {
            // Both need automated testing + human verification
            automatedWithHumanCheck.push(criterionData);
        } else if (testMethod === 'manual') {
            manualChecks.push(criterionData);
        } else if (testMethod === 'ai') {
            aiChecks.push(criterionData);
        }
    });

    // Report automated test results (axe-core only)
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖 AUTOMATED TESTS (axe-core) - ${automatedTests.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const automatedWithViolations = automatedTests.filter(c => c.violations.length > 0);
    console.log(`✅ Passed: ${automatedTests.length - automatedWithViolations.length}`);
    console.log(`❌ Failed: ${automatedWithViolations.length}`);

    automatedWithViolations.forEach(criterion => {
        console.log(`\n============================================================`);
        console.log(`🔴 RGAA ${criterion.article} - ${criterion.level}`);
        console.log(`${criterion.desc}`);
        console.log(`============================================================`);
        
        console.log(`\n[ BUSINESS IMPACT ]`);
        console.log(`⚠️  RISK: ${criterion.risk}`);
        console.log(`💰 FINES: ${criterion.financial}`);
        console.log(`✨ BRAND: ${criterion.brand}`);

        criterion.violations.forEach(violation => {
            console.log(`\n📋 Issue: ${violation.help}`);
            console.log(`🛠️  Fix: ${criterion.fix}`);
            
            violation.nodes.forEach((node, index) => {
                console.log(`\n--- Occurrence #${index + 1} ---`);
                console.log(`📍 Location: ${node.target.join(', ')}`);
                console.log(`💻 Code: ${node.html.substring(0, 200)}${node.html.length > 200 ? '...' : ''}`);
            });
        });
    });

    // Report automated tests that need human verification
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖👤 AUTOMATED + HUMAN CHECK REQUIRED - ${automatedWithHumanCheck.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const automatedAiWithViolations = automatedWithHumanCheck.filter(c => c.violations.length > 0);
    const automatedAiPassed = automatedWithHumanCheck.filter(c => c.violations.length === 0);
    console.log(`✅ Passed automated: ${automatedAiPassed.length}`);
    console.log(`❌ Failed automated: ${automatedAiWithViolations.length}`);
    console.log(`⚠️  All ${automatedWithHumanCheck.length} require human verification for quality and relevance\n`);

    // Show FAILED automated tests that need human review
    if (automatedAiWithViolations.length > 0) {
        console.log(`\n❌ FAILED AUTOMATED TESTS (need human review):\n`);
        automatedAiWithViolations.forEach(criterion => {
            console.log(`\n============================================================`);
            console.log(`🔴 RGAA ${criterion.article} - ${criterion.level} ⚠️ HUMAN REVIEW REQUIRED`);
            console.log(`${criterion.desc}`);
            console.log(`============================================================`);
            
            console.log(`\n[ BUSINESS IMPACT ]`);
            console.log(`⚠️  RISK: ${criterion.risk}`);
            console.log(`💰 FINES: ${criterion.financial}`);
            console.log(`✨ BRAND: ${criterion.brand}`);

            criterion.violations.forEach(violation => {
                console.log(`\n📋 Automated Issue Detected: ${violation.help}`);
                console.log(`⚠️  Human must verify: ${criterion.testMethod === 'axe-core,manual' ? 'Partial automation - manual verification required for full compliance' : 'Quality and relevance of implementation'}`);
                console.log(`🛠️  Fix: ${criterion.fix}`);
                
                violation.nodes.forEach((node, index) => {
                    console.log(`\n--- Occurrence #${index + 1} ---`);
                    console.log(`📍 Location: ${node.target.join(', ')}`);
                    console.log(`💻 Code: ${node.html.substring(0, 200)}${node.html.length > 200 ? '...' : ''}`);
                });
            });
        });
    }

    // Show PASSED automated tests that still need human review
    if (automatedAiPassed.length > 0) {
        console.log(`\n\n✅ PASSED AUTOMATED TESTS (still need human review):\n`);
        automatedAiPassed.forEach(criterion => {
            const reviewNote = criterion.testMethod === 'axe-core,manual' 
                ? 'Passed automated checks but manual verification required for full compliance'
                : 'Passed automated checks but quality and relevance need human verification';
            
            console.log(`✅ RGAA ${criterion.article} (${criterion.level}) ⚠️ ${reviewNote}`);
            console.log(`   ${criterion.desc}`);
        });
    }

    // List criteria requiring manual checks
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤 MANUAL CHECKS REQUIRED - ${manualChecks.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`These criteria require human judgment and cannot be automated:\n`);
    
    manualChecks.forEach(criterion => {
        console.log(`📝 RGAA ${criterion.article} (${criterion.level}) - ${criterion.risk} risk`);
        console.log(`   ${criterion.desc}`);
        console.log(`   🛠️  ${criterion.fix}\n`);
    });

    // List criteria that could benefit from AI analysis
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖 AI-ASSISTED CHECKS RECOMMENDED - ${aiChecks.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`These criteria could benefit from AI vision/language analysis:\n`);
    
    aiChecks.forEach(criterion => {
        console.log(`🤖 RGAA ${criterion.article} (${criterion.level}) - ${criterion.risk} risk`);
        console.log(`   ${criterion.desc}`);
        console.log(`   🛠️  ${criterion.fix}\n`);
    });

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 AUDIT SUMMARY`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total RGAA Criteria: ${Object.keys(rgaaFlatMapping).length}`);
    console.log(`Automated (axe-core): ${automatedTests.length} (${automatedWithViolations.length} failed)`);
    console.log(`Automated + Human: ${automatedWithHumanCheck.length} (${automatedAiWithViolations.length} failed)`);
    console.log(`Manual Checks: ${manualChecks.length}`);
    console.log(`AI-Assisted: ${aiChecks.length}`);

    console.log(`\n[ GREEN IMPACT REPORT ]`);
    console.log(`Page Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Carbon per Visit: ${estimate.toFixed(3)}g CO2`);
    
    // Analyze RGAA compliance for detailed report
    const rgaaStatus = analyzeRGAACompliance(results);
    
    // Generate all reports
    generateProReport(results, estimate, url);
    generateWCAGReport(results, url);
    generateRGAAReport(results, url);
    generateDetailedRGAAReport(rgaaStatus, url);
    
    // Generate official French accessibility declaration
    generateDeclarationAccessibilite(results, url, {
        entityName: 'Vivatech',
        siteName: 'Vivatech',
        email: 'contact@vivatechnology.com',
        contactForm: 'https://vivatechnology.com/contact',
        schemaUrl: '[Lien vers le document]',
        actionPlanUrl: '[Lien vers le document]',
        testedPages: [
            { name: 'Accueil', url: 'https://vivatechnology.com' },
            // { name: 'À propos', url: 'https://vivatechnology.com/about' },
            // { name: 'Actualités', url: 'https://vivatechnology.com/news' }
        ]
    });

    await browser.close();
}

const pagesToAudit = [
    'https://vivatechnology.com',
    // 'https://vivatechnology.com/about',
    // 'https://vivatechnology.com/news'
];

async function runFullAudit() {
    for (const url of pagesToAudit) {
        console.log(`\n--- AUDITING PAGE: ${url} ---`);
        await runAudit(url); // Your existing function
    }
}

// Test it on your example
runFullAudit();