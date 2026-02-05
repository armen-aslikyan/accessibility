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

    // =========================================================================
    // PERFORMANCE CONFIGURATION
    // =========================================================================
    performance: {
        // Test mode limit (set to null for full audit of all 106 criteria)
        // Recommended: Start with 5-10 for testing, then null for production
        testLimit: 5,

        // Parallel processing concurrency (simultaneous LLM requests)
        // Recommended by hardware:
        //   - Apple M1: 2
        //   - Apple M2/M3: 3
        //   - Older/slower machines: 1
        //   - High-end GPU: 4-5
        concurrency: 2,

        // LLM Model to use (must be pulled first: ollama pull <model>)
        // =========================================================================
        // RECOMMENDED MODELS (local, free):
        // =========================================================================
        // 
        // BALANCED (Recommended for most users):
        //   'mistral'                    - Default, good quality, ~15-20s per analysis
        //   'llama3.1:8b'               - Meta's latest, similar quality, ~12-18s
        //
        // FASTER (Slightly lower quality, good for quick audits):
        //   'mistral:7b-instruct-q4_K_M' - Quantized Mistral, ~40% faster
        //   'phi3:medium'               - Microsoft's model, ~8-12s per analysis
        //   'gemma2:9b'                 - Google's model, fast and capable
        //
        // FASTEST (Lower quality, good for initial screening):
        //   'phi3:mini'                 - Very fast, ~5-8s, simpler analysis
        //   'gemma2:2b'                 - Fastest, ~3-5s, basic analysis
        //
        // To install a model: ollama pull <model-name>
        // =========================================================================
        model: 'mistral',

        // Ollama generation options (advanced tuning)
        ollamaOptions: {
            num_ctx: 4096,       // Context window (smaller = faster)
            temperature: 0.3,    // Lower = more deterministic, faster
            num_predict: 800,    // Max response tokens
            top_k: 40,
            top_p: 0.9,
        },

        // Smart HTML extraction options
        htmlExtraction: {
            maxChars: 4000,      // Max chars to send per criterion
            maxElements: 40,     // Max DOM elements to extract
            includeContext: true // Include parent elements for context
        }
    },

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
