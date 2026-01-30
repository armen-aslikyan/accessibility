/**
 * Configuration example for accessibility audits
 * Copy this file to config.js and customize with your values
 */

module.exports = {
    // Pages to audit
    pagesToAudit: [
        'https://vivatechnology.com',
        // 'https://vivatechnology.com/about',
        // 'https://vivatechnology.com/news'
    ],

    // Accessibility declaration configuration
    declaration: {
        entityName: 'Vivatech',
        siteName: 'Vivatech',
        email: 'contact@vivatechnology.com',
        contactForm: 'https://vivatechnology.com/contact',
        schemaUrl: '[Lien vers le document]', // URL to your multi-year accessibility schema
        actionPlanUrl: '[Lien vers le document]', // URL to your current year action plan
        testedPages: [
            { name: 'Accueil', url: 'https://vivatechnology.com' },
            { name: 'À propos', url: 'https://vivatechnology.com/about' },
            { name: 'Actualités', url: 'https://vivatechnology.com/news' },
            { name: 'Contact', url: 'https://vivatechnology.com/contact' },
            { name: 'Mentions légales', url: 'https://vivatechnology.com/mentions-legales' }
        ]
    }
};
