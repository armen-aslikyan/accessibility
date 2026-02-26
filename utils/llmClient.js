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
const DEFAULT_MODEL = 'mistral:7b-instruct-v0.3-q4_K_M';

// Ollama generation options tuned for M1 GPU efficiency
const OLLAMA_OPTIONS = {
    num_ctx: 2048,        // Halved from 4096 — sufficient with cleaned HTML + compact prompts
    temperature: 0.1,     // Near-deterministic: compliance verdicts don't need creativity
    num_predict: 512,     // Batch responses are denser; 512 is sufficient per criterion
    top_k: 20,            // Smaller search space = faster token sampling
    top_p: 0.85,          // Tighter nucleus sampling
    repeat_penalty: 1.1,
    num_gpu: 999,         // Force all layers onto Metal GPU — avoid slow CPU fallback
    num_thread: 4,        // Cap CPU threads to reduce heat on M1 (4 performance cores)
};

/**
 * Sequential processing (concurrency=1) is optimal on M1: GPU memory is shared with system
 * RAM, so two concurrent Ollama contexts would double memory pressure and push into swap.
 * With batching, fewer total calls make concurrency=1 fast enough.
 */
const DEFAULT_CONCURRENCY = 1;

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
    
    // If criterion has axe rules and NO violations, mark as COMPLIANT — axe-core pass is
    // sufficient evidence unless the criterion explicitly requires AI evaluation.
    const requiresAi = criterion.testMethod && criterion.testMethod.includes('ai');
    if (hasAxeRules && !requiresAi) {
        return {
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.COMPLIANT,
            confidence: 85,
            reasoning: `Automated testing (axe-core) passed — no violations detected for rules: ${criterion.axeRules.join(', ')}`,
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
    const custom = criterion.prompt ? `\nINSTRUCTIONS: ${criterion.prompt}\n` : '';
    const count = elementCount >= 0 ? elementCount : '?';
    return `RGAA 4.1 Audit. Criterion ${criterion.article} (Level ${criterion.level}): ${criterion.desc}
URL: ${url} | Elements: ${count}
${custom}
HTML:
${html}

Reply EXACTLY:
ASSESSMENT: COMPLIANT|NON_COMPLIANT
CONFIDENCE: 0-100
REASONING: one paragraph
ISSUES: bullet list or None
RECOMMENDATIONS: bullet list or None`;
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
 * Maximum number of criteria to evaluate in a single batched LLM call.
 * Keeps the combined prompt within the 2048-token context window.
 */
const BATCH_SIZE_LLM = 4;

/**
 * Build a single prompt that evaluates multiple criteria sharing the same HTML.
 * Criteria must be from the same RGAA theme so the HTML is relevant to all.
 */
function buildBatchStatusPrompt(criteria, url, html) {
    const themeName = htmlExtractor.getThemeName(
        htmlExtractor.getThemeFromArticle(criteria[0].article)
    );
    const header = `RGAA 4.1 Audit — ${themeName}
URL: ${url}

HTML:
${html}

Evaluate each criterion below. Use the EXACT block format for each.
`;
    const blocks = criteria.map(c => {
        const custom = c.prompt ? `\nINSTRUCTIONS: ${c.prompt}` : '';
        return `---CRITERION ${c.article}---
${c.desc}${custom}
ASSESSMENT: COMPLIANT|NON_COMPLIANT
CONFIDENCE: 0-100
REASONING: one paragraph
ISSUES: bullet list or None
RECOMMENDATIONS: bullet list or None`;
    });

    return header + '\n' + blocks.join('\n\n');
}

/**
 * Parse the batched LLM response into a map of article -> parsed status result.
 * Falls back gracefully: missing criteria get NEEDS_REVIEW.
 */
function parseBatchResponse(response, criteria) {
    const results = new Map();

    for (const criterion of criteria) {
        // Find the block for this criterion in the response
        const escapedArticle = criterion.article.replace('.', '\\.');
        const blockRe = new RegExp(
            `---CRITERION\\s+${escapedArticle}---[\\s\\S]*?(?=---CRITERION|$)`,
            'i'
        );
        const match = response.match(blockRe);
        if (match) {
            results.set(criterion.article, parseStatusResponse(match[0], criterion));
        } else {
            results.set(criterion.article, {
                status: COMPLIANCE_STATUS.NEEDS_REVIEW,
                preliminaryStatus: null,
                confidence: 0,
                reasoning: 'Criterion block not found in batch response.',
                issues: [],
                recommendations: []
            });
        }
    }

    return results;
}

/**
 * Evaluate a group of criteria (same theme, all needing LLM) in a single LLM call.
 * Falls back to individual calls if the batch call fails.
 */
async function analyzeThemeBatch(criteria, pageContext, sharedHtml) {
    const { url, useCache = true, model } = pageContext;

    // Check cache for all criteria first
    const uncached = [];
    const cachedResults = [];
    if (useCache) {
        for (const criterion of criteria) {
            const cached = aiCache.getCachedAnalysis(criterion, sharedHtml);
            if (cached && cached.status) {
                cachedResults.push({
                    criterion: criterion.article,
                    level: criterion.level,
                    desc: criterion.desc,
                    status: cached.status,
                    confidence: cached.confidence || 80,
                    reasoning: cached.reasoning || cached.analysis,
                    issues: cached.issues || [],
                    recommendations: cached.recommendations || [],
                    elementCount: -1,
                    timestamp: cached.timestamp,
                    fromCache: true,
                    testedBy: cached.testedBy || 'ai'
                });
            } else {
                uncached.push(criterion);
            }
        }
    } else {
        uncached.push(...criteria);
    }

    if (uncached.length === 0) return cachedResults;

    // Split uncached into sub-batches respecting BATCH_SIZE_LLM
    const subBatches = [];
    for (let i = 0; i < uncached.length; i += BATCH_SIZE_LLM) {
        subBatches.push(uncached.slice(i, i + BATCH_SIZE_LLM));
    }

    const batchResults = [];
    for (const batch of subBatches) {
        const prompt = buildBatchStatusPrompt(batch, url, sharedHtml);
        let response;
        try {
            response = await query(prompt, { model });
        } catch (err) {
            // On failure, fall back to individual calls for this sub-batch
            for (const criterion of batch) {
                const singlePrompt = buildStatusPrompt(criterion, url, sharedHtml, -1);
                try {
                    const singleResp = await query(singlePrompt, { model });
                    const parsed = parseStatusResponse(singleResp, criterion);
                    batchResults.push(buildResultObject(criterion, parsed, sharedHtml, useCache, 'ai'));
                } catch {
                    batchResults.push(buildResultObject(criterion, {
                        status: COMPLIANCE_STATUS.NEEDS_REVIEW,
                        confidence: 0,
                        reasoning: `Error: ${err.message}`,
                        issues: [],
                        recommendations: []
                    }, sharedHtml, false, 'error'));
                }
            }
            continue;
        }

        const parsedMap = parseBatchResponse(response, batch);
        for (const criterion of batch) {
            const parsed = parsedMap.get(criterion.article);
            const resultObj = buildResultObject(criterion, parsed, sharedHtml, useCache, 'ai');
            batchResults.push(resultObj);
        }
    }

    return [...cachedResults, ...batchResults];
}

/**
 * Helper to assemble a result object and optionally cache it.
 */
function buildResultObject(criterion, parsed, html, useCache, testedBy) {
    const result = {
        criterion: criterion.article,
        level: criterion.level,
        desc: criterion.desc,
        status: parsed.status,
        preliminaryStatus: parsed.preliminaryStatus || null,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        issues: parsed.issues,
        recommendations: parsed.recommendations,
        elementCount: -1,
        timestamp: new Date().toISOString(),
        fromCache: false,
        testedBy
    };
    if (useCache && testedBy === 'ai') {
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
 * Analyze multiple criteria with status determination in parallel
 * 
 * @param {Array} criteria - Array of criterion objects
 * @param {Object} pageContext - Context about the page
 * @param {Object} violationsByRule - Map of axe rule ID to violations
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of structured analysis results
 */
async function analyzeAllWithStatus(criteria, pageContext, violationsByRule = {}, options = {}) {
    const { onProgress = null } = options;

    // Batch check applicability for all criteria in one HTML parse
    const applicabilityMap = htmlExtractor.batchCheckApplicability(pageContext.html, criteria);

    const notApplicable = [];
    const axeResolved = [];      // resolved without LLM (axe violations or axe pass)
    const needsLlm = new Map();  // theme -> [{ criterion, applicability }]

    for (const criterion of criteria) {
        const app = applicabilityMap.get(criterion.article) || { applicable: true, elementCount: -1, reason: null };

        if (!app.applicable) {
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
            continue;
        }

        const axeRules = criterion.axeRules || [];
        const violations = axeRules.map(ruleId => violationsByRule[ruleId]).filter(Boolean);

        if (violations.length > 0) {
            // Axe found violations — non-compliant, no LLM needed
            const issues = violations.map(v => ({
                type: 'violation',
                message: v.help || v.description,
                elements: v.nodes ? v.nodes.map(n => n.html?.substring(0, 200)) : [],
                impact: v.impact
            }));
            axeResolved.push({
                criterion: criterion.article,
                level: criterion.level,
                desc: criterion.desc,
                status: COMPLIANCE_STATUS.NON_COMPLIANT,
                confidence: 95,
                reasoning: `Automated testing detected ${violations.length} violation(s)`,
                issues,
                recommendations: [criterion.fix],
                elementCount: app.elementCount,
                timestamp: new Date().toISOString(),
                fromCache: false,
                testedBy: 'axe_core'
            });
            continue;
        }

        if (axeRules.length > 0) {
            // Axe has rules, no violations found — compliant by axe
            axeResolved.push({
                criterion: criterion.article,
                level: criterion.level,
                desc: criterion.desc,
                status: COMPLIANCE_STATUS.COMPLIANT,
                confidence: 85,
                reasoning: `Automated testing (axe-core) passed — no violations for: ${axeRules.join(', ')}`,
                issues: [],
                recommendations: [],
                elementCount: app.elementCount,
                timestamp: new Date().toISOString(),
                fromCache: false,
                testedBy: 'axe_core'
            });
            continue;
        }

        // Needs LLM — group by theme
        const theme = htmlExtractor.getThemeFromArticle(criterion.article) ?? 0;
        if (!needsLlm.has(theme)) needsLlm.set(theme, []);
        needsLlm.get(theme).push({ criterion, elementCount: app.elementCount });
    }

    // Fire progress for the fast-resolved items
    const total = criteria.length;
    let completed = 0;
    if (onProgress) {
        for (const result of [...notApplicable, ...axeResolved]) {
            completed++;
            onProgress(completed, total, { article: result.criterion }, result);
        }
    }

    // Pre-extract HTML per theme (one cheerio parse per theme)
    const themeHtmlMap = htmlExtractor.extractForBatch(
        pageContext.html,
        [...needsLlm.values()].flat().map(e => e.criterion),
        { maxChars: 4000, maxElements: 40, includeContext: true }
    );

    // Dispatch one batched LLM call per theme group (sequential — concurrency=1 is best on M1)
    const llmResults = [];
    for (const [theme, entries] of needsLlm) {
        const sharedHtml = themeHtmlMap.get(theme) || pageContext.html.substring(0, 4000);
        const themeCriteria = entries.map(e => e.criterion);

        let batchOut;
        try {
            batchOut = await analyzeThemeBatch(themeCriteria, pageContext, sharedHtml);
        } catch {
            // Graceful fallback: mark all as NEEDS_REVIEW
            batchOut = themeCriteria.map(c => ({
                criterion: c.article,
                level: c.level,
                desc: c.desc,
                status: COMPLIANCE_STATUS.NEEDS_REVIEW,
                confidence: 0,
                reasoning: 'Batch LLM call failed.',
                issues: [],
                recommendations: [],
                elementCount: -1,
                timestamp: new Date().toISOString(),
                fromCache: false,
                testedBy: 'error',
                error: true
            }));
        }

        for (const result of batchOut) {
            // Attach elementCount from applicability map if not set
            const entry = entries.find(e => e.criterion.article === result.criterion);
            if (entry && result.elementCount === -1) {
                result.elementCount = entry.elementCount;
            }
            llmResults.push(result);
            if (onProgress) {
                completed++;
                onProgress(completed, total, { article: result.criterion }, result);
            }
        }
    }

    const allResults = [...notApplicable, ...axeResolved, ...llmResults];
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
    analyzeThemeBatch,
    buildBatchStatusPrompt,
    parseBatchResponse,
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
