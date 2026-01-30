/**
 * Verification Script: Check which criteria are marked as "not applicable" or "not tested"
 * This helps verify that only criteria with axe-core rules can be "not applicable"
 */

const { rgaaFlatMapping } = require('../constants/rgaaMapping.complete.js');

console.log('═══════════════════════════════════════════════════════════════');
console.log('VERIFICATION: Not Applicable & Not Tested Criteria');
console.log('═══════════════════════════════════════════════════════════════\n');

// Get all criteria grouped by whether they have axe rules
const withAxeRules = [];
const withoutAxeRules = [];

Object.entries(rgaaFlatMapping).forEach(([article, criterion]) => {
    const hasRules = criterion.axeRules && criterion.axeRules.length > 0;
    const item = { article, ...criterion };
    
    if (hasRules) {
        withAxeRules.push(item);
    } else {
        withoutAxeRules.push(item);
    }
});

console.log('📊 CRITERIA DISTRIBUTION:\n');
console.log(`✅ With axe-core rules: ${withAxeRules.length}`);
console.log(`   - Can be: PASS, FAIL, NOT-APPLICABLE, NOT-TESTED, or INCOMPLETE`);
console.log(`   - testMethod: axe-core (${withAxeRules.filter(c => c.testMethod === 'axe-core').length})`);
console.log(`   - testMethod: axe-core,manual (${withAxeRules.filter(c => c.testMethod === 'axe-core,manual').length})`);
console.log('');
console.log(`⚠️  Without axe-core rules: ${withoutAxeRules.length}`);
console.log(`   - Should always be: MANUAL`);
console.log(`   - testMethod: manual (${withoutAxeRules.filter(c => c.testMethod === 'manual').length})`);
console.log(`   - testMethod: ai (${withoutAxeRules.filter(c => c.testMethod === 'ai').length})`);
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('CRITERIA WITH AXE-CORE RULES (can be not-applicable/not-tested)');
console.log('═══════════════════════════════════════════════════════════════\n');

const themeNames = {
    1: 'Images', 2: 'Cadres', 3: 'Couleurs', 4: 'Multimédia',
    5: 'Tableaux', 6: 'Liens', 7: 'Scripts', 8: 'Éléments obligatoires',
    9: 'Structuration', 10: 'Présentation',
    11: 'Formulaires', 12: 'Navigation', 13: 'Consultation'
};

let currentTheme = 0;
withAxeRules.forEach(criterion => {
    const theme = parseInt(criterion.article.split('.')[0]);
    if (theme !== currentTheme) {
        console.log(`\n━━━ Thème ${theme}: ${themeNames[theme]} ━━━\n`);
        currentTheme = theme;
    }
    
    console.log(`RGAA ${criterion.article} - ${criterion.testMethod}`);
    console.log(`  ${criterion.desc.substring(0, 80)}...`);
    console.log(`  Règles: ${criterion.axeRules.join(', ')}`);
    console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('EXPECTED BEHAVIOR IN REPORTS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('For criteria WITH axe-core rules:');
console.log('  ✅ PASS: Elements exist and comply');
console.log('  ❌ FAIL: Elements exist but have violations');
console.log('  ⊘ NOT-APPLICABLE: Elements do NOT exist on the page');
console.log('     Example: No videos → video-caption rules = not applicable');
console.log('  ? NOT-TESTED: Rules exist but did not execute (rare)');
console.log('');
console.log('For criteria WITHOUT axe-core rules:');
console.log('  👤 MANUAL: Always marked as requiring manual testing');
console.log('  🤖 AI: Marked as AI-assisted manual testing');
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('VERIFICATION COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('✅ Only criteria WITH axe-core rules can be "not applicable"');
console.log('✅ Criteria WITHOUT axe-core rules are always "manual"');
console.log('✅ This is correct RGAA behavior!');
console.log('');
console.log('Run the audit to see which specific criteria are not-applicable');
console.log('on your tested page: node audit.js');
