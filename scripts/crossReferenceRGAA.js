/**
 * Cross-reference all 106 RGAA criteria with axe-core rules
 * Maps RGAA criteria to potential axe-core rules based on:
 * 1. RGAA tags in axe-core rules
 * 2. WCAG 2.1 correspondence
 * 3. Manual knowledge of accessibility testing
 */

const fs = require('fs');
const rgaaStructure = require('../rgaaStructure.js');
const wcagMapping = require('../constants/wcagMapping.js');

// Load extracted axe rules
const axeRulesData = JSON.parse(
    fs.readFileSync('.cursor/research/axe-core-4.11-rules.json', 'utf8')
);

console.log('=== Cross-Referencing RGAA 4.1 with Axe-Core Rules ===\n');

// Build WCAG to axe-core rule mapping
const wcagToAxe = {};
Object.entries(wcagMapping).forEach(([wcagCriterion, data]) => {
    if (data.axeRules && data.axeRules.length > 0) {
        wcagToAxe[wcagCriterion] = data.axeRules;
    }
});

// RGAA to WCAG mapping (based on official documentation)
// RGAA 4.1 is based on WCAG 2.1 AA
const rgaaToWCAG = {
    // Theme 1: Images
    '1.1': ['1.1.1'], // Text alternatives
    '1.2': ['1.1.1'], // Decorative images
    '1.3': ['1.1.1'], // Alternative text quality
    '1.4': ['1.1.1'], // CAPTCHA
    '1.5': ['1.1.1'], // CAPTCHA alternatives
    '1.6': ['1.1.1'], // Detailed description
    '1.7': ['1.1.1'], // Description quality
    '1.8': ['1.4.5'], // Images of text
    '1.9': ['1.1.1'], // Image captions
    
    // Theme 2: Frames
    '2.1': ['4.1.2'], // Frame title
    '2.2': ['4.1.2'], // Frame title pertinence
    
    // Theme 3: Colors
    '3.1': ['1.4.1'], // Color not sole means
    '3.2': ['1.4.3'], // Contrast minimum
    '3.3': ['1.4.11'], // Non-text contrast
    
    // Theme 4: Multimedia
    '4.1': ['1.2.1'], // Audio/video alternatives
    '4.2': ['1.2.1'], // Alternative quality
    '4.3': ['1.2.2'], // Captions prerecorded
    '4.4': ['1.2.2'], // Caption quality
    '4.5': ['1.2.4'], // Captions live
    '4.6': ['1.2.4'], // Live caption quality
    '4.7': ['1.2.5'], // Audio description
    '4.8': ['1.2.5'], // Audio description quality
    '4.9': ['1.2.7'], // Extended audio description
    '4.10': ['1.4.2'], // Audio control
    '4.11': ['1.2.6'], // Sign language
    '4.12': ['1.2.6'], // Sign language quality
    '4.13': ['1.2.8'], // Transcript
    
    // Theme 5: Tables
    '5.1': ['1.3.1'], // Complex table summary
    '5.2': ['1.3.1'], // Summary quality
    '5.3': ['1.3.1'], // Layout tables
    '5.4': ['1.3.1'], // Table title
    '5.5': ['1.3.1'], // Title quality
    '5.6': ['1.3.1'], // Headers properly declared
    '5.7': ['1.3.1'], // Cell/header association
    '5.8': ['1.3.1'], // Layout table restrictions
    
    // Theme 6: Links
    '6.1': ['2.4.4'], // Link purpose
    '6.2': ['4.1.2'], // Link name
    
    // Theme 7: Scripts
    '7.1': ['4.1.2'], // AT compatibility
    '7.2': ['4.1.2'], // Alternative pertinence
    '7.3': ['2.1.1'], // Keyboard control
    '7.4': ['3.2.1'], // Context change control
    '7.5': ['4.1.3'], // Status messages
    
    // Theme 8: Mandatory elements
    '8.1': ['4.1.1'], // Doctype
    '8.2': ['4.1.1'], // Valid code
    '8.3': ['3.1.1'], // Language present
    '8.4': ['3.1.1'], // Language valid
    '8.5': ['2.4.2'], // Page title present
    '8.6': ['2.4.2'], // Page title pertinent
    '8.7': ['3.1.2'], // Language changes
    '8.8': ['3.1.2'], // Language change valid
    '8.9': ['1.3.1'], // Tags not for presentation
    '8.10': ['1.3.2'], // Reading direction
    
    // Theme 9: Structure
    '9.1': ['1.3.1', '2.4.6'], // Heading structure
    '9.2': ['1.3.1', '2.4.1'], // Document structure
    '9.3': ['1.3.1'], // List structure
    '9.4': ['1.3.1'], // Citations
    
    // Theme 10: Presentation
    '10.1': ['1.3.1'], // CSS for presentation
    '10.2': ['1.3.1'], // Content visible without CSS
    '10.3': ['1.3.1'], // Content understandable without CSS
    '10.4': ['1.4.4'], // Resize text
    '10.5': ['1.4.3'], // CSS colors properly used
    '10.6': ['1.4.1'], // Link visibility
    '10.7': ['2.4.7'], // Focus visible
    '10.8': ['4.1.2'], // Hidden content
    '10.9': ['1.3.3'], // Sensory characteristics
    '10.10': ['1.3.1'], // Content understandable
    '10.11': ['1.4.10'], // Reflow
    '10.12': ['1.4.12'], // Text spacing
    '10.13': ['1.4.13'], // Content on hover/focus
    '10.14': ['1.4.13'], // CSS content accessible
    
    // Theme 11: Forms
    '11.1': ['3.3.2'], // Field has label
    '11.2': ['3.3.2'], // Label pertinent
    '11.3': ['3.2.4'], // Label consistency
    '11.4': ['3.3.2'], // Label proximity
    '11.5': ['1.3.1'], // Field grouping
    '11.6': ['1.3.1'], // Grouping legend
    '11.7': ['1.3.1'], // Legend pertinent
    '11.8': ['1.3.1'], // Choice list grouping
    '11.9': ['4.1.2'], // Button label
    '11.10': ['3.3.1'], // Input validation
    '11.11': ['3.3.3'], // Error suggestions
    '11.12': ['3.3.4'], // Reversible submission
    '11.13': ['1.3.5'], // Input purpose
    
    // Theme 12: Navigation
    '12.1': ['2.4.5'], // Multiple navigation systems
    '12.2': ['3.2.3'], // Consistent navigation
    '12.3': ['2.4.5'], // Sitemap pertinent
    '12.4': ['3.2.3'], // Sitemap consistent access
    '12.5': ['3.2.3'], // Search consistent access
    '12.6': ['2.4.1'], // Bypass blocks
    '12.7': ['2.4.1'], // Skip link
    '12.8': ['2.4.3'], // Tab order
    '12.9': ['2.1.2'], // No keyboard trap
    '12.10': ['2.1.4'], // Character shortcuts
    '12.11': ['1.4.13'], // Additional content accessible
    
    // Theme 13: Consultation
    '13.1': ['2.2.1'], // Time limit control
    '13.2': ['3.2.1'], // New window control
    '13.3': ['4.1.2'], // Document accessibility
    '13.4': ['4.1.2'], // Accessible version equivalent
    '13.5': ['3.1.3'], // Unusual words
    '13.6': ['3.1.3'], // Abbreviations
    '13.7': ['2.3.1'], // Flashing
    '13.8': ['2.2.2'], // Moving content control
    '13.9': ['1.3.4'], // Orientation
    '13.10': ['2.5.1'], // Pointer gestures
    '13.11': ['2.5.2'], // Pointer cancellation
    '13.12': ['2.5.4'] // Motion actuation
};

// Build complete RGAA to axe-core mapping
const rgaaToAxeMapping = {};
let totalAutomatable = 0;
let totalManual = 0;

Object.values(rgaaStructure.themes).forEach(theme => {
    theme.criteria.forEach(criterion => {
        const criterionNum = criterion.number;
        const wcagCriteria = rgaaToWCAG[criterionNum] || [];
        
        // Get axe rules from WCAG mapping
        let axeRules = new Set();
        wcagCriteria.forEach(wcagNum => {
            const rules = wcagToAxe[wcagNum] || [];
            rules.forEach(rule => axeRules.add(rule));
        });
        
        // Add any RGAA-specific tagged rules
        Object.values(axeRulesData.allRules).forEach(rule => {
            const rgaaTag = rule.tags.find(t => t.startsWith('RGAA-'));
            if (rgaaTag) {
                const rgaaNum = rgaaTag.replace('RGAA-', '').replace('RGAAv4-', '');
                if (rgaaNum === criterionNum) {
                    axeRules.add(rule.ruleId);
                }
            }
        });
        
        const axeRulesArray = Array.from(axeRules);
        const isAutomatable = axeRulesArray.length > 0;
        
        if (isAutomatable) totalAutomatable++;
        else totalManual++;
        
        rgaaToAxeMapping[criterionNum] = {
            theme: theme.number,
            themeName: theme.name,
            title: criterion.title,
            wcagCriteria,
            axeRules: axeRulesArray,
            automatable: isAutomatable,
            ruleDetails: axeRulesArray.map(ruleId => ({
                ruleId,
                description: axeRulesData.allRules[ruleId]?.description || 'Unknown',
                help: axeRulesData.allRules[ruleId]?.help || 'Unknown'
            }))
        };
    });
});

console.log(`Total RGAA criteria: 106`);
console.log(`Automatable (with axe-core): ${totalAutomatable} (${Math.round(totalAutomatable/106*100)}%)`);
console.log(`Manual testing required: ${totalManual} (${Math.round(totalManual/106*100)}%)`);

// Generate summary by theme
console.log('\nAutomation coverage by theme:');
Object.values(rgaaStructure.themes).forEach(theme => {
    const themeCriteria = Object.values(rgaaToAxeMapping).filter(
        c => c.theme === theme.number
    );
    const automatable = themeCriteria.filter(c => c.automatable).length;
    const percentage = Math.round((automatable / themeCriteria.length) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    
    console.log(`  Theme ${String(theme.number).padStart(2)}: ${theme.name.padEnd(25)} [${bar}] ${automatable}/${themeCriteria.length} (${percentage}%)`);
});

// Save complete mapping
fs.writeFileSync(
    '.cursor/research/rgaa-to-axe-mapping.json',
    JSON.stringify({
        metadata: {
            timestamp: new Date().toISOString(),
            totalCriteria: 106,
            automatable: totalAutomatable,
            manual: totalManual
        },
        mapping: rgaaToAxeMapping
    }, null, 2)
);

console.log('\n✓ Complete mapping saved to .cursor/research/rgaa-to-axe-mapping.json');
