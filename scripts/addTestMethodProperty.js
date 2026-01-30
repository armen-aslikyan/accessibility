/**
 * Add testMethod property to RGAA mapping
 * Indicates which testing approach is suitable for each rule
 */

const fs = require('fs');

// Load research data
const rgaaToAxeData = JSON.parse(
    fs.readFileSync('.cursor/research/rgaa-to-axe-mapping.json', 'utf8')
);
const axeRulesData = JSON.parse(
    fs.readFileSync('.cursor/research/axe-core-4.11-rules.json', 'utf8')
);

console.log('=== Adding Test Method Properties ===\n');

// Build reverse mapping: axe rule -> RGAA info
const axeToRGAA = {};

Object.entries(rgaaToAxeData.mapping).forEach(([criterionNum, criterion]) => {
    criterion.axeRules.forEach(ruleId => {
        if (!axeToRGAA[ruleId]) {
            axeToRGAA[ruleId] = {
                article: criterionNum,
                theme: criterion.theme,
                themeName: criterion.themeName,
                title: criterion.title,
                allArticles: [criterionNum]
            };
        } else {
            axeToRGAA[ruleId].allArticles.push(criterionNum);
        }
    });
});

// Rules that can potentially be enhanced with AI
// These check for quality/relevance which axe-core can't fully validate
const aiEnhanceablePatterns = [
    'alt',           // Alternative text quality
    'label',         // Label relevance
    'name',          // Name quality
    'title',         // Title pertinence
    'heading',       // Heading structure quality
    'link',          // Link text clarity
    'button',        // Button text clarity
    'caption'        // Caption quality
];

function canBeAIEnhanced(ruleId, ruleData) {
    // Check if this rule validates content quality (which AI can help with)
    const help = (ruleData.help || '').toLowerCase();
    const description = (ruleData.description || '').toLowerCase();
    
    return aiEnhanceablePatterns.some(pattern => 
        ruleId.includes(pattern) || 
        help.includes('appropriate') ||
        help.includes('descriptive') ||
        help.includes('meaningful') ||
        help.includes('pertinent') ||
        description.includes('quality')
    );
}

function determineRisk(ruleId, ruleData) {
    const tags = ruleData.tags || [];
    if (tags.includes('wcag2a') || tags.includes('wcag21a')) return 'Critical';
    if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) return 'High';
    if (tags.some(t => t.startsWith('RGAA'))) return 'High';
    return 'Medium';
}

function getFinancialImpact(risk) {
    if (risk === 'Critical') return '€50,000 renewable fine. Direct violation of EAA 2026 and French law.';
    if (risk === 'High') return '€25,000 - €50,000 fine. Significant compliance risk.';
    return 'Compliance deduction. Contributes to non-compliant status.';
}

function getBrandImpact(themeName, criteriaCount) {
    const impacts = {
        'Images': 'Excludes visually impaired users. Direct SEO penalty.',
        'Cadres': 'Confusing UX: Screen readers cannot identify frame content.',
        'Couleurs': 'Excludes colorblind users (8% of men) and users in poor lighting.',
        'Multimédia': 'Total exclusion of deaf community and silent viewers.',
        'Tableaux': 'Data becomes unnavigable for screen reader users.',
        'Liens': 'Total failure: Users cannot understand link destination.',
        'Scripts': 'Functional block: Interactive elements invisible to assistive tech.',
        'Éléments obligatoires': 'Fundamental compliance failure. Automated bots flag immediately.',
        'Structuration de l\'information': 'Poor SEO. Screen readers cannot navigate efficiently.',
        'Présentation de l\'information': 'Cognitive overload. Poor readability for all users.',
        'Formulaires': 'Transaction failure: Users cannot complete forms or purchases.',
        'Navigation': 'Efficiency loss: Keyboard users must tab through entire page.',
        'Consultation': 'Frustrating UX: Users lose control of content.'
    };
    return impacts[themeName] || `Impacts ${criteriaCount} RGAA criteria in ${themeName}.`;
}

// Build enhanced mapping with test methods
const enhancedMapping = {};
const stats = {
    axeCore: 0,
    aiEnhanceable: 0,
    total: 0
};

Object.entries(axeToRGAA).forEach(([ruleId, mapping]) => {
    const ruleData = axeRulesData.allRules[ruleId];
    if (!ruleData) return;
    
    const risk = determineRisk(ruleId, ruleData);
    const aiEnhanceable = canBeAIEnhanced(ruleId, ruleData);
    
    // All rules in this mapping can be tested by axe-core
    // Some can additionally benefit from AI for quality checks
    const testMethod = aiEnhanceable ? 'axe-core,ai' : 'axe-core';
    
    enhancedMapping[ruleId] = {
        article: mapping.article,
        desc: mapping.title,
        risk: risk,
        financial: getFinancialImpact(risk),
        brand: getBrandImpact(mapping.themeName, mapping.allArticles.length),
        fix: ruleData.help,
        testMethod: testMethod
    };
    
    stats.total++;
    stats.axeCore++;
    if (aiEnhanceable) stats.aiEnhanceable++;
});

// Generate JavaScript file
const fileContent = `/**
 * RGAA 4.1 Enhanced Mapping to axe-core rules
 * Maximizes automated coverage of RGAA criteria
 * Generated: ${new Date().toISOString()}
 * 
 * Coverage: ${Object.keys(enhancedMapping).length} axe-core rules
 * Automatable RGAA criteria: ${rgaaToAxeData.metadata.automatable}/106 (${Math.round(rgaaToAxeData.metadata.automatable/106*100)}%)
 * 
 * Test Method Values:
 * - "axe-core": Fully automatable with axe-core (presence/structure validation)
 * - "axe-core,ai": Automatable with axe-core + AI can enhance quality checks
 * - "manual": Requires human judgment (not in this mapping, see RGAA structure)
 * - "ai": Potentially testable with AI vision/language models (not in this mapping)
 */

const rgaaTheme1Images = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 1)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme2Frames = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 2)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme3Colors = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 3)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme4Multimedia = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 4)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme5Tables = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 5)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme6Links = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 6)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme7Scripts = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 7)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme8Mandatory = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 8)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme9Structure = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 9)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme10Presentation = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 10)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme11Forms = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 11)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme12Navigation = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 12)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaTheme13Consultation = {
${Object.entries(enhancedMapping)
    .filter(([_, m]) => axeToRGAA[_]?.theme === 13)
    .map(([ruleId, mapping]) => `  "${ruleId}": ${JSON.stringify(mapping, null, 4).replace(/\n/g, '\n  ')}`)
    .join(',\n')}
};

const rgaaMasterMapping = {
    ...rgaaTheme1Images,
    ...rgaaTheme2Frames,
    ...rgaaTheme3Colors,
    ...rgaaTheme4Multimedia,
    ...rgaaTheme5Tables,
    ...rgaaTheme6Links,
    ...rgaaTheme7Scripts,
    ...rgaaTheme8Mandatory,
    ...rgaaTheme9Structure,
    ...rgaaTheme10Presentation,
    ...rgaaTheme11Forms,
    ...rgaaTheme12Navigation,
    ...rgaaTheme13Consultation,
};

module.exports = rgaaMasterMapping;
`;

fs.writeFileSync('constants/rgaaMapping.js', fileContent);

console.log('✓ Enhanced mapping with test methods generated\n');
console.log('Test Method Distribution:');
console.log(`  - Axe-core only: ${stats.axeCore - stats.aiEnhanceable} rules (pure automation)`);
console.log(`  - Axe-core + AI: ${stats.aiEnhanceable} rules (automation + quality enhancement)`);
console.log(`  - Total automated: ${stats.axeCore} rules`);

console.log(`\n✓ Saved to constants/rgaaMapping.js`);
