/**
 * Local LLM Client using Ollama
 * Provides a simple interface to communicate with local LLMs
 * 
 * OPTIMIZED VERSION:
 * - Parallel processing with configurable concurrency
 * - Smart HTML extraction (theme-specific)
 * - Ollama performance options (context size, temperature, predict limit)
 * - Batch processing support
 * - Configurable model selection
 */

const aiCache = require('./aiCache');
const htmlExtractor = require('./htmlExtractor');

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

/**
 * Model configuration
 * RECOMMENDED FAST MODELS (local, free, good quality):
 * - 'mistral:7b-instruct-q4_K_M' - Quantized Mistral, ~40% faster, good quality
 * - 'llama3.1:8b' - Meta's latest, fast and capable
 * - 'phi3:medium' - Microsoft's model, very fast for small context
 * - 'gemma2:2b' - Google's small model, fastest but simpler
 * 
 * To switch models: ollama pull <model-name>
 */
const DEFAULT_MODEL = 'mistral';

// Ollama generation options for performance
const OLLAMA_OPTIONS = {
    num_ctx: 4096,       // Context window (smaller = faster, 4096 is good balance)
    temperature: 0.3,    // Lower = more deterministic and faster
    num_predict: 800,    // Max tokens to generate (limit response length)
    top_k: 40,           // Limit token selection
    top_p: 0.9,          // Nucleus sampling
    repeat_penalty: 1.1, // Avoid repetition
};

/**
 * Concurrency configuration for parallel processing
 * Adjust based on your hardware (M1/M2/M3 Mac can handle 2-3 well)
 */
const DEFAULT_CONCURRENCY = 2;

/**
 * Send a prompt to the local LLM and receive a response
 * @param {string} prompt - The prompt to send to the LLM
 * @param {Object} options - Optional configuration
 * @param {boolean} options.stream - Whether to stream the response (default: false)
 * @param {string} options.model - Model to use (default: configured model)
 * @param {Object} options.ollamaOptions - Override Ollama options
 * @returns {Promise<string>} - The LLM response
 */
async function query(prompt, options = {}) {
    const { 
        stream = false, 
        model = DEFAULT_MODEL,
        ollamaOptions = {}
    } = options;

    const mergedOptions = { ...OLLAMA_OPTIONS, ...ollamaOptions };

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: stream,
                options: mergedOptions,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        if (stream) {
            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            fullResponse += parsed.response;
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                    }
                }
            }

            return fullResponse;
        } else {
            // Handle non-streaming response
            const data = await response.json();
            return data.response || '';
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Ollama server is not running. Please start it with: ollama serve');
        }
        throw error;
    }
}

/**
 * Analyze accessibility criterion using the LLM with custom prompt and HTML content
 * Uses caching to avoid repeated expensive API calls
 * 
 * OPTIMIZED: Uses smart HTML extraction to send only relevant elements
 * 
 * @param {Object} criterion - The RGAA criterion to analyze
 * @param {Object} pageContext - Context about the page being audited
 * @param {string} pageContext.url - The page URL
 * @param {string} pageContext.html - The page HTML content
 * @param {boolean} pageContext.useCache - Whether to use cache (default: true)
 * @param {boolean} pageContext.useSmartExtraction - Use theme-specific HTML extraction (default: true)
 * @param {string} pageContext.model - Override model for this request
 * @returns {Promise<Object>} - Analysis result with suggestions
 */
async function analyzeAccessibilityCriterion(criterion, pageContext) {
    const { 
        url, 
        html = '', 
        useCache = true, 
        useSmartExtraction = true,
        model 
    } = pageContext;
    
    // Check cache first
    if (useCache) {
        const cached = aiCache.getCachedAnalysis(criterion, html);
        if (cached) {
            return {
                criterion: criterion.article,
                level: criterion.level,
                desc: criterion.desc,
                testMethod: criterion.testMethod,
                analysis: cached.analysis,
                timestamp: cached.timestamp,
                fromCache: true
            };
        }
    }
    
    // OPTIMIZATION: Extract only relevant HTML based on criterion theme
    let relevantHtml = html;
    if (useSmartExtraction && html) {
        relevantHtml = htmlExtractor.extractForCriterion(html, criterion.article, {
            maxChars: 4000,  // Reduced from 8000 - faster inference
            maxElements: 40,
            includeContext: true
        });
    } else if (html) {
        relevantHtml = html.substring(0, 4000);
    }
    
    // Use custom prompt if available, otherwise use generic prompt
    const customPrompt = criterion.prompt || '';
    
    // Build the comprehensive prompt (more concise for speed)
    const generalContext = `You are an RGAA 4.1 accessibility auditor.

Criterion: ${criterion.article} (Level ${criterion.level})
Description: ${criterion.desc}
URL: ${url}

`;
    
    const htmlContext = relevantHtml ? `Relevant HTML:\n${relevantHtml}\n\n` : '';
    
    const specificInstructions = customPrompt || `Analyze this criterion:
1. Compliance issues found
2. Elements needing manual verification
3. Recommendations

Be concise and actionable.`;
    
    const fullPrompt = generalContext + htmlContext + specificInstructions;

    const response = await query(fullPrompt, { model });
    
    const result = {
        criterion: criterion.article,
        level: criterion.level,
        desc: criterion.desc,
        testMethod: criterion.testMethod,
        analysis: response,
        timestamp: new Date().toISOString(),
        fromCache: false
    };
    
    // Cache the result
    if (useCache) {
        aiCache.cacheAnalysis(criterion, html, response);
    }

    return result;
}

/**
 * Analyze multiple criteria in parallel with controlled concurrency
 * 
 * @param {Array} criteria - Array of criterion objects to analyze
 * @param {Object} pageContext - Context about the page being audited
 * @param {Object} options - Processing options
 * @param {number} options.concurrency - Max parallel requests (default: 2 for M1)
 * @param {Function} options.onProgress - Progress callback (index, total, criterion)
 * @returns {Promise<Array>} - Array of analysis results
 */
async function analyzeInParallel(criteria, pageContext, options = {}) {
    const { 
        concurrency = DEFAULT_CONCURRENCY,
        onProgress = null 
    } = options;
    
    // Dynamic import of p-limit (ESM module)
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(concurrency);
    
    let completed = 0;
    const total = criteria.length;
    
    const promises = criteria.map((criterion, index) => 
        limit(async () => {
            try {
                const result = await analyzeAccessibilityCriterion(criterion, pageContext);
                completed++;
                if (onProgress) {
                    onProgress(completed, total, criterion, result);
                }
                return result;
            } catch (error) {
                completed++;
                const errorResult = {
                    criterion: criterion.article,
                    level: criterion.level,
                    desc: criterion.desc,
                    testMethod: criterion.testMethod,
                    analysis: `Error: ${error.message}`,
                    timestamp: new Date().toISOString(),
                    fromCache: false,
                    error: true
                };
                if (onProgress) {
                    onProgress(completed, total, criterion, errorResult);
                }
                return errorResult;
            }
        })
    );
    
    return Promise.all(promises);
}

/**
 * Analyze criteria grouped by theme in batches
 * Groups related criteria and processes each theme in parallel
 * 
 * @param {Array} criteria - Array of criterion objects
 * @param {Object} pageContext - Context about the page
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of analysis results
 */
async function analyzeByThemeBatch(criteria, pageContext, options = {}) {
    const { concurrency = DEFAULT_CONCURRENCY, onProgress = null } = options;
    
    // Group criteria by theme
    const byTheme = new Map();
    for (const criterion of criteria) {
        const theme = htmlExtractor.getThemeFromArticle(criterion.article);
        if (!byTheme.has(theme)) {
            byTheme.set(theme, []);
        }
        byTheme.get(theme).push(criterion);
    }
    
    // Pre-extract HTML for each theme (done once per theme)
    const themeHtml = htmlExtractor.extractForBatch(pageContext.html, criteria, {
        maxChars: 4000,
        maxElements: 40
    });
    
    // Process all criteria with theme-specific HTML
    const allCriteria = [];
    for (const [theme, themeCriteria] of byTheme) {
        const extractedHtml = themeHtml.get(theme) || pageContext.html.substring(0, 4000);
        for (const criterion of themeCriteria) {
            allCriteria.push({
                criterion,
                html: extractedHtml
            });
        }
    }
    
    // Process with parallel execution
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(concurrency);
    
    let completed = 0;
    const total = allCriteria.length;
    
    const promises = allCriteria.map(({ criterion, html }) =>
        limit(async () => {
            try {
                const result = await analyzeAccessibilityCriterion(criterion, {
                    ...pageContext,
                    html,
                    useSmartExtraction: false // Already extracted
                });
                completed++;
                if (onProgress) {
                    onProgress(completed, total, criterion, result);
                }
                return result;
            } catch (error) {
                completed++;
                const errorResult = {
                    criterion: criterion.article,
                    level: criterion.level,
                    desc: criterion.desc,
                    testMethod: criterion.testMethod,
                    analysis: `Error: ${error.message}`,
                    timestamp: new Date().toISOString(),
                    fromCache: false,
                    error: true
                };
                if (onProgress) {
                    onProgress(completed, total, criterion, errorResult);
                }
                return errorResult;
            }
        })
    );
    
    return Promise.all(promises);
}

/**
 * Analyze accessibility criterion using the LLM (backward compatibility)
 * @deprecated Use analyzeAccessibilityCriterion with html parameter instead
 */
async function analyzeAccessibilityCriterionSimple(criterion, pageContext) {
    const prompt = `You are an accessibility expert. Analyze the following RGAA accessibility criterion:

Criterion: ${criterion.article}
Level: ${criterion.level}
Description: ${criterion.desc}
Risk: ${criterion.risk}
Fix Suggestion: ${criterion.fix}

Page URL: ${pageContext.url}

Based on this criterion, provide:
1. A brief analysis of why this criterion is important
2. Specific things to look for when manually checking this criterion
3. Common mistakes developers make related to this criterion

Keep your response concise and actionable.`;

    const response = await query(prompt);

    return {
        criterion: criterion.article,
        analysis: response,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Check if Ollama server is running and accessible
 * @returns {Promise<boolean>} - True if server is accessible
 */
async function checkHealth() {
    try {
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get list of available models from Ollama
 * @returns {Promise<Array>} - List of available models
 */
async function getAvailableModels() {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) return [];
        const data = await response.json();
        return data.models || [];
    } catch {
        return [];
    }
}

/**
 * Configuration object for runtime adjustments
 */
const config = {
    model: DEFAULT_MODEL,
    concurrency: DEFAULT_CONCURRENCY,
    ollamaOptions: { ...OLLAMA_OPTIONS },
    
    setModel(model) {
        this.model = model;
    },
    
    setConcurrency(n) {
        this.concurrency = Math.max(1, Math.min(n, 5)); // Limit 1-5
    },
    
    setOllamaOptions(options) {
        this.ollamaOptions = { ...OLLAMA_OPTIONS, ...options };
    }
};

module.exports = {
    query,
    analyzeAccessibilityCriterion,
    analyzeAccessibilityCriterionSimple,
    analyzeInParallel,
    analyzeByThemeBatch,
    checkHealth,
    getAvailableModels,
    aiCache,
    htmlExtractor,
    config,
    DEFAULT_MODEL,
    DEFAULT_CONCURRENCY,
    OLLAMA_OPTIONS
};
