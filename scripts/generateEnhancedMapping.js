/**
 * Generate enhanced RGAA mapping with all identified axe-core rules
 * This maximizes automated coverage while maintaining accuracy
 */

const fs = require('fs');

// Load research data
const rgaaToAxeData = JSON.parse(
    fs.readFileSync('.cursor/research/rgaa-to-axe-mapping.json', 'utf8')
);
const axeRulesData = JSON.parse(
    fs.readFileSync('.cursor/research/axe-core-4.11-rules.json', 'utf8')
);

console.log('=== Generating Enhanced RGAA Mapping ===\n');

// Build reverse mapping: axe rule -> primary RGAA article
const axeToRGAA = {};

Object.entries(rgaaToAxeData.mapping).forEach(([criterionNum, criterion]) => {
    criterion.axeRules.forEach(ruleId => {
        if (!axeToRGAA[ruleId]) {
            // Store first (primary) occurrence
            axeToRGAA[ruleId] = {
                article: criterionNum,
                theme: criterion.theme,
                themeName: criterion.themeName,
                title: criterion.title,
                allArticles: [criterionNum]
            };
        } else {
            // Add to list of covered articles
            axeToRGAA[ruleId].allArticles.push(criterionNum);
        }
    });
});

// Define risk levels based on rule characteristics
function determineRisk(ruleId, ruleData) {
    const tags = ruleData.tags || [];
    
    if (tags.includes('wcag2a') || tags.includes('wcag21a')) {
        return 'Critical';
    } else if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) {
        return 'High';
    } else if (tags.some(t => t.startsWith('RGAA'))) {
        return 'High';
    }
    return 'Medium';
}

// Generate financial impact text
function getFinancialImpact(risk, theme) {
    if (risk === 'Critical') {
        return '€50,000 renewable fine. Direct violation of EAA 2026 and French law.';
    } else if (risk === 'High') {
        return '€25,000 - €50,000 fine. Significant compliance risk.';
    }
    return 'Compliance deduction. Contributes to non-compliant status.';
}

// Generate brand impact text based on theme
function getBrandImpact(themeName, criteriaCount) {
    const themeImpacts = {
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
    
    return themeImpacts[themeName] || `Impacts ${criteriaCount} RGAA criteria in ${themeName}.`;
}

// Build enhanced mapping
const enhancedMapping = {};
const rulesByTheme = {};

Object.entries(axeToRGAA).forEach(([ruleId, mapping]) => {
    const ruleData = axeRulesData.allRules[ruleId];
    if (!ruleData) {
        console.warn(`Warning: No data found for rule ${ruleId}`);
        return;
    }
    
    const risk = determineRisk(ruleId, ruleData);
    const financial = getFinancialImpact(risk, mapping.theme);
    const brand = getBrandImpact(mapping.themeName, mapping.allArticles.length);
    
    enhancedMapping[ruleId] = {
        article: mapping.article,
        desc: mapping.title,
        risk: risk,
        financial: financial,
        brand: brand,
        fix: ruleData.help
    };
    
    // Track by theme for statistics
    if (!rulesByTheme[mapping.theme]) {
        rulesByTheme[mapping.theme] = {
            name: mapping.themeName,
            rules: []
        };
    }
    rulesByTheme[mapping.theme].rules.push(ruleId);
});

// Generate the JavaScript file content
const fileContent = `/**
 * RGAA 4.1 Enhanced Mapping to axe-core rules
 * Maximizes automated coverage of RGAA criteria
 * Generated: ${new Date().toISOString()}
 * 
 * Coverage: ${Object.keys(enhancedMapping).length} axe-core rules
 * Automatable RGAA criteria: ${rgaaToAxeData.metadata.automatable}/106 (${Math.round(rgaaToAxeData.metadata.automatable/106*100)}%)
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

// Save enhanced mapping
fs.writeFileSync('constants/rgaaMapping.enhanced.js', fileContent);

// Display statistics
console.log(`✓ Enhanced mapping generated with ${Object.keys(enhancedMapping).length} rules\n`);
console.log('Coverage by theme:');
Object.entries(rulesByTheme).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([themeNum, data]) => {
    console.log(`  Theme ${themeNum.padStart(2)}: ${data.name.padEnd(30)} ${data.rules.length} rules`);
});

console.log(`\n✓ Saved to constants/rgaaMapping.enhanced.js`);
console.log(`\nOriginal mapping: 28 rules`);
console.log(`Enhanced mapping: ${Object.keys(enhancedMapping).length} rules`);
console.log(`Improvement: +${Object.keys(enhancedMapping).length - 28} rules (${Math.round((Object.keys(enhancedMapping).length - 28) / 28 * 100)}% increase)`);
console.log(`\nAutomatable RGAA criteria: ${rgaaToAxeData.metadata.automatable}/106 (${Math.round(rgaaToAxeData.metadata.automatable/106*100)}%)`);
console.log(`Manual testing still required: ${rgaaToAxeData.metadata.manual}/106 (${Math.round(rgaaToAxeData.metadata.manual/106*100)}%)`);
