/**
 * Identify missing axe-core rules that should be added to rgaaMapping.js
 * Generates a prioritized list with implementation recommendations
 */

const fs = require('fs');
const rgaaMasterMapping = require('../constants/rgaaMapping.js');

// Load research data
const axeRulesData = JSON.parse(
    fs.readFileSync('.cursor/research/axe-core-4.11-rules.json', 'utf8')
);
const rgaaToAxeData = JSON.parse(
    fs.readFileSync('.cursor/research/rgaa-to-axe-mapping.json', 'utf8')
);
const validationReport = JSON.parse(
    fs.readFileSync('.cursor/research/validation-report.json', 'utf8')
);

console.log('=== Identifying Missing Axe-Core Rules ===\n');

// Get currently mapped rules
const currentlyMapped = new Set(Object.keys(rgaaMasterMapping));

// Collect all recommended rules from RGAA mapping
const recommendedRules = new Set();
Object.values(rgaaToAxeData.mapping).forEach(criterion => {
    criterion.axeRules.forEach(ruleId => recommendedRules.add(ruleId));
});

console.log(`Currently mapped: ${currentlyMapped.size} rules`);
console.log(`Recommended based on RGAA: ${recommendedRules.size} rules`);

// Calculate missing rules
const missingRules = [...recommendedRules].filter(r => !currentlyMapped.has(r));
console.log(`Missing rules: ${missingRules.length}\n`);

// Prioritize missing rules
const prioritizedGaps = [];

missingRules.forEach(ruleId => {
    const ruleData = axeRulesData.allRules[ruleId];
    if (!ruleData) return;
    
    // Count how many RGAA criteria this rule could help with
    let criteriaCount = 0;
    let affectedCriteria = [];
    Object.entries(rgaaToAxeData.mapping).forEach(([criterionNum, criterion]) => {
        if (criterion.axeRules.includes(ruleId)) {
            criteriaCount++;
            affectedCriteria.push({
                number: criterionNum,
                title: criterion.title,
                theme: criterion.themeName
            });
        }
    });
    
    // Determine priority based on:
    // 1. WCAG level (A/AA = higher priority)
    // 2. Number of RGAA criteria covered
    // 3. Whether it's RGAA-tagged in axe-core
    let priority = 'medium';
    const tags = ruleData.tags || [];
    
    if (tags.includes('wcag2a') || tags.includes('wcag21a')) {
        priority = 'critical';
    } else if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) {
        priority = 'high';
    } else if (tags.some(t => t.startsWith('RGAA'))) {
        priority = 'high';
    } else if (criteriaCount >= 3) {
        priority = 'high';
    }
    
    prioritizedGaps.push({
        ruleId,
        priority,
        description: ruleData.description,
        help: ruleData.help,
        helpUrl: ruleData.helpUrl,
        tags: ruleData.tags,
        criteriaCount,
        affectedCriteria,
        isRGAATagged: tags.some(t => t.startsWith('RGAA'))
    });
});

// Sort by priority then by criteria count
const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
prioritizedGaps.sort((a, b) => {
    if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.criteriaCount - a.criteriaCount;
});

// Display by priority
console.log('=== CRITICAL PRIORITY (WCAG 2.x Level A) ===\n');
const critical = prioritizedGaps.filter(g => g.priority === 'critical');
critical.forEach((gap, idx) => {
    console.log(`${idx + 1}. ${gap.ruleId}`);
    console.log(`   ${gap.help}`);
    console.log(`   Affects ${gap.criteriaCount} RGAA criteria`);
    console.log(`   Tags: ${gap.tags.join(', ')}`);
    console.log('');
});

console.log('\n=== HIGH PRIORITY (WCAG AA / RGAA-tagged) ===\n');
const high = prioritizedGaps.filter(g => g.priority === 'high');
high.forEach((gap, idx) => {
    console.log(`${idx + 1}. ${gap.ruleId}`);
    console.log(`   ${gap.help}`);
    console.log(`   Affects ${gap.criteriaCount} RGAA criteria`);
    if (gap.isRGAATagged) console.log(`   ⭐ RGAA-tagged in axe-core`);
    console.log('');
});

console.log('\n=== MEDIUM PRIORITY ===\n');
const medium = prioritizedGaps.filter(g => g.priority === 'medium');
console.log(`${medium.length} additional rules (see detailed JSON file)`);

// Generate implementation recommendations
const recommendations = {
    summary: {
        totalMissing: missingRules.length,
        critical: critical.length,
        high: high.length,
        medium: medium.length
    },
    quickWins: critical.slice(0, 10).map(g => ({
        ruleId: g.ruleId,
        reason: `WCAG Level A rule affecting ${g.criteriaCount} RGAA criteria`,
        suggestedRGAAArticles: g.affectedCriteria.map(c => c.number)
    })),
    allGaps: prioritizedGaps
};

fs.writeFileSync(
    '.cursor/research/missing-rules-analysis.json',
    JSON.stringify(recommendations, null, 2)
);

console.log('\n=== IMPLEMENTATION RECOMMENDATIONS ===\n');
console.log(`Phase 1: Add ${critical.length} CRITICAL priority rules`);
console.log(`  → These are WCAG Level A rules, essential for basic compliance`);
console.log(`  → Estimated impact: +${critical.reduce((sum, g) => sum + g.criteriaCount, 0)} criteria improved`);

console.log(`\nPhase 2: Add ${high.length} HIGH priority rules`);
console.log(`  → WCAG AA and RGAA-specific rules`);
console.log(`  → Many are already tagged for RGAA in axe-core`);

console.log(`\nPhase 3: Consider ${medium.length} MEDIUM priority rules`);
console.log(`  → Best practices and additional coverage`);

// Generate suggested mappings for top 20 critical/high rules
console.log('\n=== TOP 20 RULES TO ADD IMMEDIATELY ===\n');
const top20 = [...critical, ...high].slice(0, 20);

const suggestedMappings = {};
top20.forEach(gap => {
    // Find the most relevant RGAA criterion for this rule
    const primaryCriterion = gap.affectedCriteria[0];
    
    suggestedMappings[gap.ruleId] = {
        article: primaryCriterion.number,
        desc: primaryCriterion.title,
        risk: gap.priority === 'critical' ? 'Critical' : 'High',
        financial: 'To be determined based on specific violation',
        brand: 'To be determined based on specific violation',
        fix: gap.help
    };
    
    console.log(`"${gap.ruleId}": {`);
    console.log(`  "article": "${primaryCriterion.number}",`);
    console.log(`  "desc": "${primaryCriterion.title}",`);
    console.log(`  "risk": "${gap.priority === 'critical' ? 'Critical' : 'High'}",`);
    console.log(`  "financial": "€25,000 - €50,000 fine for non-compliance",`);
    console.log(`  "brand": "Impacts ${gap.criteriaCount} RGAA criteria - ${primaryCriterion.theme}",`);
    console.log(`  "fix": "${gap.help.replace(/"/g, '\\"')}"`);
    console.log(`},`);
});

fs.writeFileSync(
    '.cursor/research/suggested-new-mappings.json',
    JSON.stringify(suggestedMappings, null, 2)
);

console.log('\n✓ Analysis saved to .cursor/research/missing-rules-analysis.json');
console.log('✓ Suggested mappings saved to .cursor/research/suggested-new-mappings.json');
