const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { co2 } = require("@tgwf/co2");
const rgaaMasterMapping = require('./constants/rgaaMapping.js');
const { generateProReport } = require('./visualize.js');
const { generateWCAGReport } = require('./wcagReport.js');
const { generateRGAAReport } = require('./rgaaReport.js');
const { generateDeclarationAccessibilite } = require('./declarationAccessibilite.js');

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
    const results = await new AxeBuilder({ page }).analyze();
    
    // 3. Calculate Carbon Footprint
    const co2Emitter = new co2();
    const estimate = co2Emitter.perVisit(totalBytes);

    // 4. Output the "Executive Summary"
    console.log(`\n[ LEGAL RISK REPORT ]`);
    console.log(`Total Violations Found: ${results.violations.length}`);
    
    // Highlight a specific "AI-blind" error for your pitch
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log(`Critical Legal Risks: ${critical.length}`);
    
    // results.violations.forEach(v => {
    //     console.log(` - Error: ${v.help} (Target: ${v.nodes[0].target})`);
    // });

    results.violations.forEach(violation => {
        // Search through all our theme objects
        const mapping = rgaaMasterMapping[violation.id];
    
        console.log(`\n============================================================`);
        console.log(`🔴 LEGAL RISK: RGAA ARTICLE ${mapping.article}`);
        console.log(`ISSUE: ${violation.help}`);
        console.log(`============================================================`);
        
        console.log(`\n[ BUSINESS IMPACT ]`);
        console.log(`💰 FINES: ${mapping.financial}`);
        console.log(`✨ BRAND: ${mapping.brand}`);
    
        violation.nodes.forEach((node, index) => {
            console.log(`\n--- Occurrence #${index + 1} ---`);
            console.log(`📍 LOCATION: ${node.target}`);
            
            console.log(`\n💻 CODE PERSPECTIVE (The Bug):`);
            console.log(`   ${node.html}`);
            
            console.log(`\n🛠️ THE FIX:`);
            console.log(`   ${mapping.fix}`);
        });
    });

    console.log(`\n[ GREEN IMPACT REPORT ]`);
    console.log(`Page Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Carbon per Visit: ${estimate.toFixed(3)}g CO2`);
    
    // Generate all reports
    generateProReport(results, estimate, url);
    generateWCAGReport(results, url);
    generateRGAAReport(results, url);
    
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