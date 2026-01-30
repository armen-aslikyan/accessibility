/**
 * Fetch all axe-core 4.11 rules with complete metadata
 * This script extracts rule information directly from axe-core
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

async function fetchAllAxeRules() {
    console.log('Fetching all axe-core 4.11 rules...\n');
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Create a minimal test page
    await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>Test Page</title></head>
        <body>
            <h1>Test</h1>
            <img src="test.jpg" alt="test">
            <a href="#">Link</a>
            <input type="text" id="test">
            <label for="test">Label</label>
        </body>
        </html>
    `);
    
    // Run axe and get all rules metadata
    const results = await new AxeBuilder({ page })
        .analyze();
    
    // Get axe source to access all rules
    const axeRules = await page.evaluate(() => {
        if (window.axe && window.axe._audit && window.axe._audit.rules) {
            return window.axe._audit.rules.map(rule => ({
                ruleId: rule.id,
                description: rule.help || rule.description,
                helpUrl: rule.helpUrl,
                tags: rule.tags,
                metadata: rule.metadata || {}
            }));
        }
        return [];
    });
    
    await browser.close();
    
    // If we couldn't get rules from the page, extract from results
    const allRuleIds = new Set();
    const ruleDetails = {};
    
    // Add all rules from different result categories
    [...results.violations, ...results.passes, ...results.incomplete, ...results.inapplicable]
        .forEach(result => {
            if (!allRuleIds.has(result.id)) {
                allRuleIds.add(result.id);
                ruleDetails[result.id] = {
                    ruleId: result.id,
                    description: result.description,
                    help: result.help,
                    helpUrl: result.helpUrl,
                    impact: result.impact,
                    tags: result.tags,
                    nodes: result.nodes?.length || 0
                };
            }
        });
    
    // Combine with axe rules from page evaluation
    axeRules.forEach(rule => {
        if (!allRuleIds.has(rule.ruleId)) {
            allRuleIds.add(rule.ruleId);
            ruleDetails[rule.ruleId] = rule;
        } else {
            // Merge additional data
            ruleDetails[rule.ruleId] = {
                ...ruleDetails[rule.ruleId],
                ...rule
            };
        }
    });
    
    // Categorize rules by WCAG level and tags
    const categorized = {
        metadata: {
            totalRules: Object.keys(ruleDetails).length,
            fetchedAt: new Date().toISOString(),
            axeCoreVersion: '4.11.0'
        },
        wcag2a: [],
        wcag2aa: [],
        wcag21a: [],
        wcag21aa: [],
        wcag22aa: [],
        bestPractices: [],
        experimental: [],
        other: [],
        allRules: ruleDetails
    };
    
    Object.values(ruleDetails).forEach(rule => {
        const tags = rule.tags || [];
        
        if (tags.includes('wcag2a')) categorized.wcag2a.push(rule.ruleId);
        if (tags.includes('wcag2aa')) categorized.wcag2aa.push(rule.ruleId);
        if (tags.includes('wcag21a')) categorized.wcag21a.push(rule.ruleId);
        if (tags.includes('wcag21aa')) categorized.wcag21aa.push(rule.ruleId);
        if (tags.includes('wcag22aa')) categorized.wcag22aa.push(rule.ruleId);
        if (tags.includes('best-practice')) categorized.bestPractices.push(rule.ruleId);
        if (tags.includes('experimental')) categorized.experimental.push(rule.ruleId);
        
        if (!tags.some(t => t.startsWith('wcag'))) {
            categorized.other.push(rule.ruleId);
        }
    });
    
    console.log(`✓ Found ${categorized.metadata.totalRules} total axe-core rules`);
    console.log(`  - WCAG 2.0 Level A: ${categorized.wcag2a.length}`);
    console.log(`  - WCAG 2.0 Level AA: ${categorized.wcag2aa.length}`);
    console.log(`  - WCAG 2.1 Level A: ${categorized.wcag21a.length}`);
    console.log(`  - WCAG 2.1 Level AA: ${categorized.wcag21aa.length}`);
    console.log(`  - WCAG 2.2 Level AA: ${categorized.wcag22aa.length}`);
    console.log(`  - Best Practices: ${categorized.bestPractices.length}`);
    console.log(`  - Experimental: ${categorized.experimental.length}`);
    console.log(`  - Other: ${categorized.other.length}`);
    
    // Save to file
    fs.writeFileSync(
        '.cursor/research/axe-core-4.11-rules.json',
        JSON.stringify(categorized, null, 2)
    );
    
    console.log('\n✓ Saved to .cursor/research/axe-core-4.11-rules.json');
    
    return categorized;
}

// Run the script
fetchAllAxeRules()
    .then(() => {
        console.log('\n✓ Rule extraction complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error fetching axe rules:', error);
        process.exit(1);
    });
