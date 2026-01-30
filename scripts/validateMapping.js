/**
 * Validate current RGAA mapping against axe-core 4.11 rules
 */

const fs = require('fs');
const rgaaMasterMapping = require('../constants/rgaaMapping.js');
const rgaaStructure = require('../rgaaStructure.js');

// Load extracted axe rules
const axeRulesData = JSON.parse(
    fs.readFileSync('.cursor/research/axe-core-4.11-rules.json', 'utf8')
);

console.log('=== RGAA Mapping Validation Report ===\n');

// Get all current mapped rule IDs
const currentMappedRules = Object.keys(rgaaMasterMapping);
console.log(`Current mappings: ${currentMappedRules.length} axe-core rules\n`);

// Validation 1: Check if all mapped rules exist in axe-core
console.log('1. Validating rule IDs exist in axe-core 4.11...');
const invalidRules = [];
const validRules = [];

currentMappedRules.forEach(ruleId => {
    if (!axeRulesData.allRules[ruleId]) {
        invalidRules.push(ruleId);
        console.log(`  ✗ INVALID: "${ruleId}" not found in axe-core 4.11`);
    } else {
        validRules.push(ruleId);
    }
});

if (invalidRules.length === 0) {
    console.log(`  ✓ All ${currentMappedRules.length} rule IDs are valid\n`);
} else {
    console.log(`  ⚠ ${invalidRules.length} invalid rule IDs found\n`);
}

// Validation 2: Check RGAA article numbers
console.log('2. Validating RGAA article numbers...');
const allRGAACriteria = [];
Object.values(rgaaStructure.themes).forEach(theme => {
    theme.criteria.forEach(criterion => {
        allRGAACriteria.push(criterion.number);
    });
});

const invalidArticles = [];
Object.entries(rgaaMasterMapping).forEach(([ruleId, mapping]) => {
    if (!allRGAACriteria.includes(mapping.article)) {
        invalidArticles.push({ ruleId, article: mapping.article });
        console.log(`  ✗ Rule "${ruleId}" maps to invalid article "${mapping.article}"`);
    }
});

if (invalidArticles.length === 0) {
    console.log('  ✓ All article numbers are valid\n');
} else {
    console.log(`  ⚠ ${invalidArticles.length} invalid article numbers\n`);
}

// Validation 3: Check for RGAA-tagged rules in axe-core that we're missing
console.log('3. Checking for RGAA-tagged rules in axe-core...');
console.log(`  Total RGAA-tagged rules in axe-core: ${axeRulesData.rgaaTagged.length}`);
console.log(`  Currently mapped: ${currentMappedRules.length}`);

const missingRGAATaggedRules = axeRulesData.rgaaTagged.filter(
    ruleId => !currentMappedRules.includes(ruleId)
);

console.log(`  ⚠ Missing ${missingRGAATaggedRules.length} RGAA-tagged rules:\n`);
missingRGAATaggedRules.forEach(ruleId => {
    const rule = axeRulesData.allRules[ruleId];
    const rgaaTag = rule.tags.find(t => t.startsWith('RGAA'));
    console.log(`    - ${ruleId} (${rgaaTag}) - ${rule.help}`);
});

// Validation 4: Coverage by theme
console.log('\n4. Coverage by RGAA theme:');
const coverageByTheme = {};
Object.values(rgaaStructure.themes).forEach(theme => {
    coverageByTheme[theme.number] = {
        name: theme.name,
        total: theme.criteria.length,
        mapped: 0,
        criteria: []
    };
});

Object.entries(rgaaMasterMapping).forEach(([ruleId, mapping]) => {
    const themeNum = parseInt(mapping.article.split('.')[0]);
    if (coverageByTheme[themeNum]) {
        if (!coverageByTheme[themeNum].criteria.includes(mapping.article)) {
            coverageByTheme[themeNum].criteria.push(mapping.article);
            coverageByTheme[themeNum].mapped++;
        }
    }
});

Object.entries(coverageByTheme).forEach(([themeNum, data]) => {
    const percentage = Math.round((data.mapped / data.total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`  Theme ${themeNum.padStart(2)}: ${data.name.padEnd(25)} [${bar}] ${data.mapped}/${data.total} (${percentage}%)`);
});

// Validation 5: WCAG 2.1 AA coverage
console.log('\n5. WCAG 2.1 AA rule coverage:');
const wcag21aaRules = new Set([...axeRulesData.wcag2aa, ...axeRulesData.wcag21aa]);
console.log(`  Total WCAG 2.1 AA rules: ${wcag21aaRules.size}`);
console.log(`  Currently mapped: ${currentMappedRules.filter(r => wcag21aaRules.has(r)).length}`);

const missingWCAG21AA = [...wcag21aaRules].filter(r => !currentMappedRules.includes(r));
console.log(`  ⚠ Missing ${missingWCAG21AA.length} WCAG 2.1 AA rules`);

// Summary
console.log('\n=== Summary ===');
console.log(`✓ Valid mappings: ${validRules.length}/${currentMappedRules.length}`);
console.log(`⚠ Invalid rule IDs: ${invalidRules.length}`);
console.log(`⚠ Invalid article numbers: ${invalidArticles.length}`);
console.log(`⚠ Missing RGAA-tagged rules: ${missingRGAATaggedRules.length}`);
console.log(`⚠ Missing WCAG 2.1 AA rules: ${missingWCAG21AA.length}`);

// Save validation results
const validationReport = {
    timestamp: new Date().toISOString(),
    summary: {
        totalMapped: currentMappedRules.length,
        validRules: validRules.length,
        invalidRules: invalidRules.length,
        invalidArticles: invalidArticles.length,
        missingRGAATagged: missingRGAATaggedRules.length,
        missingWCAG21AA: missingWCAG21AA.length
    },
    invalidRules,
    invalidArticles,
    missingRGAATaggedRules: missingRGAATaggedRules.map(ruleId => ({
        ruleId,
        ...axeRulesData.allRules[ruleId]
    })),
    missingWCAG21AARules: missingWCAG21AA.map(ruleId => ({
        ruleId,
        ...axeRulesData.allRules[ruleId]
    })),
    coverageByTheme
};

fs.writeFileSync(
    '.cursor/research/validation-report.json',
    JSON.stringify(validationReport, null, 2)
);

console.log('\n✓ Detailed report saved to .cursor/research/validation-report.json');
