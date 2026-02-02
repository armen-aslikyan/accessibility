/**
 * Local LLM Client using Ollama
 * Provides a simple interface to communicate with Mistral running locally
 * Includes caching to avoid repeated expensive API calls
 */

const aiCache = require('./aiCache');

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL = 'mistral';

/**
 * Send a prompt to the local Mistral LLM and receive a response
 * @param {string} prompt - The prompt to send to the LLM
 * @param {Object} options - Optional configuration
 * @param {boolean} options.stream - Whether to stream the response (default: false)
 * @returns {Promise<string>} - The LLM response
 */
async function query(prompt, options = {}) {
    const { stream = false } = options;

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                stream: stream,
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
 * @param {Object} criterion - The RGAA criterion to analyze
 * @param {Object} pageContext - Context about the page being audited
 * @param {string} pageContext.url - The page URL
 * @param {string} pageContext.html - The page HTML content
 * @param {boolean} pageContext.useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} - Analysis result with suggestions
 */
async function analyzeAccessibilityCriterion(criterion, pageContext) {
    const { url, html = '', useCache = true } = pageContext;
    
    // Check cache first
    if (useCache) {
        const cached = aiCache.getCachedAnalysis(criterion, html);
        if (cached) {
            console.log(`   📦 Using cached analysis for ${criterion.article}`);
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
    
    // Use custom prompt if available, otherwise use generic prompt
    const customPrompt = criterion.prompt || '';
    
    // Build the comprehensive prompt
    const generalContext = `You are an expert accessibility auditor analyzing RGAA 4.1 compliance for a webpage.

RGAA Criterion: ${criterion.article}
Level: ${criterion.level}
Description: ${criterion.desc}
Page URL: ${url}

`;
    
    const htmlContext = html ? `\nHTML Content to analyze:\n${html.substring(0, 8000)}\n\n` : '';
    
    const specificInstructions = customPrompt || `Based on this RGAA criterion, provide:
1. Analysis of potential compliance issues
2. Specific elements or patterns that need manual verification
3. Recommendations for ensuring compliance

Keep your response clear, structured, and actionable.`;
    
    const fullPrompt = generalContext + htmlContext + specificInstructions;

    const response = await query(fullPrompt);
    
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

module.exports = {
    query,
    analyzeAccessibilityCriterion,
    analyzeAccessibilityCriterionSimple,
    checkHealth,
    aiCache // Export cache utilities
};
