# TonAuditAI - Automated Accessibility Audit Tool

Complete accessibility auditing solution for RGAA 4.1 and WCAG 2.1 compliance, with automatic generation of French accessibility declarations.

## Features

- 🔍 **Automated Testing**: Uses axe-core with Playwright for comprehensive accessibility scanning
- 📊 **Multiple Reports**: Generates 4 different reports:
  - Executive summary with legal risks and carbon footprint
  - Complete WCAG 2.1 compliance report (50 criteria)
  - Complete RGAA 4.1 compliance report (106 criteria)
  - Official French accessibility declaration
- 🇫🇷 **Legal Compliance**: Automatic generation of French accessibility declarations (Article 47, Loi n° 2005-102)
- 💰 **Financial Risk Assessment**: Estimates potential fines based on French law (Ordonnance 2023-859)
- 🌱 **Carbon Footprint**: Calculates CO2 emissions per page visit

## Installation

```bash
npm install
```

## Usage

### Basic Usage

Run the default audit:

```bash
node audit.js
```

This will generate 4 HTML reports in the `reports/` folder:
- `reports/Rapport_Audit.html` - Executive summary
- `reports/wcag_reqs_full.html` - WCAG compliance report
- `reports/rgaa_reqs_full.html` - RGAA compliance report
- `reports/declaration_accessibilite.html` - Official French declaration

### Customization

1. Copy the configuration example:
```bash
cp config.example.js config.js
```

2. Edit `config.js` with your site information:
```javascript
module.exports = {
    pagesToAudit: [
        'https://yoursite.com',
        'https://yoursite.com/about',
    ],
    
    declaration: {
        entityName: 'Your Company Name',
        siteName: 'Your Site Name',
        email: 'accessibility@yourcompany.com',
        contactForm: 'https://yoursite.com/contact',
        schemaUrl: 'https://yoursite.com/accessibility-schema.pdf',
        actionPlanUrl: 'https://yoursite.com/accessibility-plan-2026.pdf',
        testedPages: [
            { name: 'Accueil', url: 'https://yoursite.com' },
            { name: 'À propos', url: 'https://yoursite.com/about' },
            { name: 'Contact', url: 'https://yoursite.com/contact' },
            { name: 'Mentions légales', url: 'https://yoursite.com/legal' }
        ]
    }
};
```

3. Update `audit.js` to use your config:
```javascript
const config = require('./config.js');

const pagesToAudit = config.pagesToAudit;

// In generateDeclarationAccessibilite call:
generateDeclarationAccessibilite(results, url, config.declaration);
```

## Project Structure

```
vivatech-audit-poc/
├── constants/           # Mapping files
│   ├── rgaaMapping.js
│   ├── wcagMapping.js
│   └── rgaaMapping.backup.js
├── reports/            # Generated HTML reports (ignored by git)
│   ├── Rapport_Audit.html
│   ├── wcag_reqs_full.html
│   ├── rgaa_reqs_full.html
│   └── declaration_accessibilite.html
├── audit.js            # Main audit script
├── visualize.js        # Executive report generator
├── wcagReport.js       # WCAG report generator
├── rgaaReport.js       # RGAA report generator
├── declarationAccessibilite.js  # French declaration generator
├── rgaaStructure.js    # RGAA structure definition
└── config.example.js   # Configuration template
```

## Generated Reports

### 1. reports/Rapport_Audit.html
Executive summary with:
- Legal risk assessment (€75,000+ potential fines)
- RGAA compliance score
- Carbon footprint calculation
- Detailed violations with business impact

### 2. reports/wcag_reqs_full.html
Complete WCAG 2.1 report with:
- All 50 success criteria (Level A, AA, AAA)
- Status for each criterion (Pass/Fail/Manual/N/A)
- Organized by 4 principles (Perceivable, Operable, Understandable, Robust)
- Detailed failure information with remediation steps

### 3. reports/rgaa_reqs_full.html
Complete RGAA 4.1 report with:
- All 106 criteria across 13 themes
- Status for each criterion (Conforme/Non-conforme/Manuel/N/A)
- Financial and brand impact for failures
- Technical solutions for each violation

### 4. reports/declaration_accessibilite.html
Official French accessibility declaration compliant with:
- Article 47, Loi n° 2005-102 du 11 février 2005
- RGAA 4.1.2 requirements
- Includes:
  - Conformity status
  - Test results and statistics
  - Non-compliant content details
  - Contact information
  - Legal recourse information

## Understanding Report Status

### Status Types

- **✓ Pass/Conforme**: Automated tests passed successfully
- **✗ Fail/Non-conforme**: Violations detected that need to be fixed
- **◐ Manual**: No automated rules exist - requires human testing
- **⚠ Review/À vérifier**: Incomplete test results - needs manual verification
- **- N/A**: Rules exist but elements they check don't exist on this page
  - Example: `frame-title` rules won't run if page has no iframes
  - Example: `video-caption` rules won't run if page has no videos

## Legal Context

### French Accessibility Law

- **Loi n° 2005-102** (February 11, 2005): Requires digital accessibility
- **Ordonnance n° 2023-859** (September 6, 2023): Defines penalties
- **EAA 2025** (European Accessibility Act): EU-wide requirements

### Potential Fines

- **€50,000**: Maximum technical fine (renewable every 6 months)
- **€25,000**: Missing accessibility declaration fine
- **Total exposure**: Up to €75,000+

### Required Documents

All French public sector websites must provide:
1. **Accessibility Declaration** (this tool generates it)
2. **Multi-year Accessibility Schema** (2024-2026)
3. **Annual Action Plan**

## Technologies Used

- **Playwright**: Browser automation
- **axe-core**: Accessibility testing engine
- **@tgwf/co2**: Carbon footprint calculation
- **Tailwind CSS**: Report styling

## Standards Coverage

### RGAA 4.1 - 13 Themes
1. Images
2. Cadres (Frames)
3. Couleurs (Colors)
4. Multimédia
5. Tableaux (Tables)
6. Liens (Links)
7. Scripts
8. Éléments obligatoires (Mandatory elements)
9. Structuration de l'information
10. Présentation de l'information
11. Formulaires (Forms)
12. Navigation
13. Consultation

### WCAG 2.1 - 4 Principles
1. Perceivable
2. Operable
3. Understandable
4. Robust

## License

© 2026 TonAuditAI - All rights reserved

## Disclaimer

Automated audits identify many accessibility issues but do not replace manual testing by certified experts. For full legal compliance, conduct a comprehensive audit with human experts.
