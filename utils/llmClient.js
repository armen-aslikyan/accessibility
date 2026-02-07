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
 * Compliance status constants
 */
const COMPLIANCE_STATUS = {
    COMPLIANT: 'compliant',
    NON_COMPLIANT: 'non_compliant', 
    NOT_APPLICABLE: 'not_applicable',
    NEEDS_REVIEW: 'needs_review'
};

/**
 * Analyze criterion and determine compliance status
 * Returns structured result with status determination
 * 
 * @param {Object} criterion - The RGAA criterion to analyze
 * @param {Object} pageContext - Context about the page
 * @param {Object} axeViolations - Any violations from axe-core for this criterion
 * @returns {Promise<Object>} - Structured analysis result with status
 */
async function analyzeWithStatus(criterion, pageContext, axeViolations = []) {
    const { 
        url, 
        html = '', 
        useCache = true,
        model 
    } = pageContext;
    
    // First, check if criterion is applicable based on element presence
    const applicability = htmlExtractor.checkCriterionApplicability(html, criterion.article);
    
    // If no relevant elements exist, mark as Not Applicable immediately
    if (!applicability.applicable) {
        return {
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            confidence: 100,
            reasoning: applicability.reason,
            issues: [],
            recommendations: [],
            elementCount: 0,
            timestamp: new Date().toISOString(),
            fromCache: false,
            testedBy: 'element_detection'
        };
    }
    
    // Check if this criterion has axe-core rules defined
    const hasAxeRules = criterion.axeRules && criterion.axeRules.length > 0;
    
    // If axe-core found violations, mark as Non-Compliant
    if (axeViolations && axeViolations.length > 0) {
        const issues = axeViolations.map(v => ({
            type: 'violation',
            message: v.help || v.description,
            elements: v.nodes ? v.nodes.map(n => n.html?.substring(0, 200)) : [],
            impact: v.impact
        }));
        
        return {
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NON_COMPLIANT,
            confidence: 95,
            reasoning: `Automated testing detected ${axeViolations.length} violation(s)`,
            issues,
            recommendations: [criterion.fix],
            elementCount: applicability.elementCount,
            timestamp: new Date().toISOString(),
            fromCache: false,
            testedBy: 'axe_core'
        };
    }
    
    // If criterion has axe rules and NO violations were found, mark as COMPLIANT by axe-core
    // (unless there's a custom AI prompt that requires additional evaluation)
    if (hasAxeRules && !criterion.prompt) {
        return {
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.COMPLIANT,
            confidence: 90,
            reasoning: `Automated testing (axe-core) passed - no violations detected for rules: ${criterion.axeRules.join(', ')}`,
            issues: [],
            recommendations: [],
            elementCount: applicability.elementCount,
            timestamp: new Date().toISOString(),
            fromCache: false,
            testedBy: 'axe_core'
        };
    }
    
    // Check cache for LLM analysis
    if (useCache) {
        const cached = aiCache.getCachedAnalysis(criterion, html);
        if (cached && cached.status) {
            return {
                criterion: criterion.article,
                level: criterion.level,
                desc: criterion.desc,
                status: cached.status,
                confidence: cached.confidence || 80,
                reasoning: cached.reasoning || cached.analysis,
                issues: cached.issues || [],
                recommendations: cached.recommendations || [],
                elementCount: applicability.elementCount,
                timestamp: cached.timestamp,
                fromCache: true,
                testedBy: cached.testedBy || 'ai'
            };
        }
    }
    
    // Extract relevant HTML for this criterion
    const relevantHtml = htmlExtractor.extractForCriterion(html, criterion.article, {
        maxChars: 4000,
        maxElements: 40,
        includeContext: true
    });
    
    // Build structured prompt for status determination
    const prompt = buildStatusPrompt(criterion, url, relevantHtml, applicability.elementCount);
    
    const response = await query(prompt, { model });
    
    // Parse the LLM response to extract structured data
    const parsed = parseStatusResponse(response, criterion);
    
    const result = {
        criterion: criterion.article,
        level: criterion.level,
        desc: criterion.desc,
        status: parsed.status,
        preliminaryStatus: parsed.preliminaryStatus,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        issues: parsed.issues,
        recommendations: parsed.recommendations,
        elementCount: applicability.elementCount,
        timestamp: new Date().toISOString(),
        fromCache: false,
        testedBy: 'ai',
        rawAnalysis: response
    };
    
    // Cache the structured result
    if (useCache) {
        aiCache.cacheAnalysis(criterion, html, JSON.stringify({
            status: result.status,
            preliminaryStatus: result.preliminaryStatus,
            confidence: result.confidence,
            reasoning: result.reasoning,
            issues: result.issues,
            recommendations: result.recommendations,
            testedBy: 'ai'
        }));
    }
    
    return result;
}

/**
 * Confidence threshold for automatic status determination
 * Below this threshold, status becomes "needs_review" with preliminary assessment
 */
const CONFIDENCE_THRESHOLD = 70;

/**
 * Build a prompt that asks LLM to determine compliance status
 */
function buildStatusPrompt(criterion, url, html, elementCount) {
    const customPrompt = criterion.prompt || '';
    
    return `You are an RGAA 4.1 accessibility auditor. Analyze and determine the compliance status.

CRITERION: ${criterion.article} (Level ${criterion.level})
DESCRIPTION: ${criterion.desc}
URL: ${url}
ELEMENTS FOUND: ${elementCount >= 0 ? elementCount : 'Unknown'}

HTML TO ANALYZE:
${html}

${customPrompt ? `SPECIFIC INSTRUCTIONS:\n${customPrompt}\n` : ''}
TASK: Determine the compliance status for this criterion.

You MUST respond in this EXACT format (use these exact labels):

ASSESSMENT: [Choose ONE: COMPLIANT | NON_COMPLIANT]
CONFIDENCE: [Number 0-100]
REASONING: [One paragraph explaining your determination]
ISSUES: [List each issue on a new line starting with "- ", or "None" if compliant]
RECOMMENDATIONS: [List each recommendation on a new line starting with "- ", or "None" if fully compliant]

CONFIDENCE CALIBRATION (follow strictly):
- 90-100%: Found CONCRETE EVIDENCE (specific violations with examples, or verified all elements meet requirements)
- 80-89%: Strong indicators found (clear patterns of issues or compliance, minor ambiguity)
- 70-79%: Moderate evidence but some aspects unclear
- 50-69%: Limited evidence, significant uncertainty, HTML may be incomplete

IMPORTANT: If you find specific issues (like "iframe missing title", "image without alt"), that IS concrete evidence. 
Finding 3+ specific issues = at least 85% confidence in NON_COMPLIANT.
Finding all elements properly implemented = at least 85% confidence in COMPLIANT.
Do NOT be overly conservative - concrete findings ARE certainty.`;
}

/**
 * Parse LLM response to extract structured status data
 * Now uses confidence threshold to determine if human review is needed
 */
function parseStatusResponse(response, criterion) {
    const result = {
        status: COMPLIANCE_STATUS.NEEDS_REVIEW,
        preliminaryStatus: null, // What AI thinks it is (before confidence threshold)
        confidence: 50,
        reasoning: '',
        issues: [],
        recommendations: []
    };
    
    try {
        // Extract ASSESSMENT (the AI's best guess)
        const assessmentMatch = response.match(/ASSESSMENT:\s*(COMPLIANT|NON_COMPLIANT)/i);
        // Also try STATUS for backward compatibility with cached responses
        const statusMatch = response.match(/STATUS:\s*(COMPLIANT|NON_COMPLIANT|NEEDS_REVIEW)/i);
        
        const matchedAssessment = assessmentMatch || statusMatch;
        if (matchedAssessment) {
            const assessmentStr = matchedAssessment[1].toUpperCase();
            if (assessmentStr === 'COMPLIANT') {
                result.preliminaryStatus = COMPLIANCE_STATUS.COMPLIANT;
            } else if (assessmentStr === 'NON_COMPLIANT') {
                result.preliminaryStatus = COMPLIANCE_STATUS.NON_COMPLIANT;
            }
        }
        
        // Extract CONFIDENCE
        const confMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
        if (confMatch) {
            result.confidence = Math.min(100, Math.max(0, parseInt(confMatch[1], 10)));
        }
        
        // Extract REASONING
        const reasonMatch = response.match(/REASONING:\s*([^\n]+(?:\n(?!ISSUES:|RECOMMENDATIONS:)[^\n]+)*)/i);
        if (reasonMatch) {
            result.reasoning = reasonMatch[1].trim();
        }
        
        // Extract ISSUES
        const issuesMatch = response.match(/ISSUES:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
        if (issuesMatch) {
            const issuesText = issuesMatch[1].trim();
            if (issuesText.toLowerCase() !== 'none') {
                const issues = issuesText.split('\n')
                    .map(line => line.replace(/^[-•*]\s*/, '').trim())
                    .filter(line => line.length > 0);
                result.issues = issues.map(text => ({ type: 'issue', message: text }));
            }
        }
        
        // Extract RECOMMENDATIONS
        const recsMatch = response.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/i);
        if (recsMatch) {
            const recsText = recsMatch[1].trim();
            if (recsText.toLowerCase() !== 'none') {
                result.recommendations = recsText.split('\n')
                    .map(line => line.replace(/^[-•*]\s*/, '').trim())
                    .filter(line => line.length > 0);
            }
        }
        
        // If no reasoning extracted, use full response
        if (!result.reasoning) {
            result.reasoning = response.substring(0, 500);
        }
        
        // Confidence calibration: adjust based on evidence found
        // If AI found multiple concrete issues but reported low confidence, boost it
        if (result.preliminaryStatus === COMPLIANCE_STATUS.NON_COMPLIANT && result.issues.length >= 3) {
            // 3+ specific issues = strong evidence, minimum 85% confidence
            result.confidence = Math.max(result.confidence, 85);
        } else if (result.preliminaryStatus === COMPLIANCE_STATUS.NON_COMPLIANT && result.issues.length >= 1) {
            // 1-2 specific issues = moderate evidence, minimum 75% confidence
            result.confidence = Math.max(result.confidence, 75);
        }
        
        // Determine final status based on confidence threshold
        if (result.preliminaryStatus) {
            if (result.confidence >= CONFIDENCE_THRESHOLD) {
                // High confidence - use the assessment as final status
                result.status = result.preliminaryStatus;
            } else {
                // Low confidence - needs human review, but show what AI thinks
                result.status = COMPLIANCE_STATUS.NEEDS_REVIEW;
                // Add confidence context to reasoning
                const likelyStatus = result.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT 
                    ? 'likely compliant' 
                    : 'likely non-compliant';
                result.reasoning = `[AI Assessment: ${likelyStatus}] ${result.reasoning}`;
            }
        }
        
    } catch (error) {
        result.reasoning = response.substring(0, 500);
    }
    
    return result;
}

/**
 * Analyze multiple criteria with status determination in parallel
 * 
 * @param {Array} criteria - Array of criterion objects
 * @param {Object} pageContext - Context about the page
 * @param {Object} violationsByRule - Map of axe rule ID to violations
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of structured analysis results
 */
async function analyzeAllWithStatus(criteria, pageContext, violationsByRule = {}, options = {}) {
    const { concurrency = DEFAULT_CONCURRENCY, onProgress = null } = options;
    
    // First, batch check applicability for all criteria
    const applicabilityMap = htmlExtractor.batchCheckApplicability(pageContext.html, criteria);
    
    // Separate into applicable and not applicable
    const notApplicable = [];
    const toAnalyze = [];
    
    for (const criterion of criteria) {
        const app = applicabilityMap.get(criterion.article);
        if (app && !app.applicable) {
            notApplicable.push({
                criterion: criterion.article,
                level: criterion.level,
                desc: criterion.desc,
                status: COMPLIANCE_STATUS.NOT_APPLICABLE,
                confidence: 100,
                reasoning: app.reason,
                issues: [],
                recommendations: [],
                elementCount: 0,
                timestamp: new Date().toISOString(),
                fromCache: false,
                testedBy: 'element_detection'
            });
        } else {
            // Check for axe-core violations
            const axeRules = criterion.axeRules || [];
            const violations = axeRules
                .map(ruleId => violationsByRule[ruleId])
                .filter(Boolean);
            
            toAnalyze.push({ criterion, violations });
        }
    }
    
    // Report not applicable criteria immediately
    if (onProgress) {
        for (const result of notApplicable) {
            onProgress(notApplicable.indexOf(result) + 1, criteria.length, { article: result.criterion }, result);
        }
    }
    
    // Process remaining criteria in parallel
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(concurrency);
    
    let completed = notApplicable.length;
    const total = criteria.length;
    
    const promises = toAnalyze.map(({ criterion, violations }) =>
        limit(async () => {
            try {
                const result = await analyzeWithStatus(criterion, pageContext, violations);
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
                    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
                    confidence: 0,
                    reasoning: `Error during analysis: ${error.message}`,
                    issues: [],
                    recommendations: [],
                    elementCount: -1,
                    timestamp: new Date().toISOString(),
                    fromCache: false,
                    testedBy: 'error',
                    error: true
                };
                if (onProgress) {
                    onProgress(completed, total, criterion, errorResult);
                }
                return errorResult;
            }
        })
    );
    
    const analyzed = await Promise.all(promises);
    
    // Combine and sort results by criterion number
    const allResults = [...notApplicable, ...analyzed];
    allResults.sort((a, b) => {
        const [aMajor, aMinor] = a.criterion.split('.').map(Number);
        const [bMajor, bMinor] = b.criterion.split('.').map(Number);
        return aMajor - bMajor || aMinor - bMinor;
    });
    
    return allResults;
}

/**
 * Analyze accessibility criterion using the LLM (backward compatibility)
 * @deprecated Use analyzeWithStatus instead
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
    analyzeWithStatus,
    analyzeAllWithStatus,
    checkHealth,
    getAvailableModels,
    aiCache,
    htmlExtractor,
    config,
    COMPLIANCE_STATUS,
    DEFAULT_MODEL,
    DEFAULT_CONCURRENCY,
    OLLAMA_OPTIONS
};
