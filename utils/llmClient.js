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
 * - Per-occurrence AI assessment with worst-of rollup
 */

const htmlExtractor = require("./htmlExtractor");

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

/**
 * Model configuration — must match the model used in run-audit.js / audit-core.js.
 * Override via OLLAMA_MODEL env var without code changes.
 *
 * RECOMMENDED FAST MODELS (local, free, good quality):
 * - 'mistral:7b-instruct-v0.3-q4_K_M' - Quantized Mistral, good quality (default)
 * - 'llama3.1:8b' - Meta's latest, fast and capable
 * - 'phi3:medium' - Microsoft's model, very fast for small context
 * - 'gemma3:4b' - Google's small model, fastest but simpler
 *
 * To switch models: ollama pull <model-name>
 */
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

// Ollama generation options — balance quality vs. M1 GPU memory.
// Increase OLLAMA_NUM_CTX env var on machines with more RAM for larger HTML context.
const OLLAMA_OPTIONS = {
  num_ctx: parseInt(process.env.OLLAMA_NUM_CTX ?? "4096", 10), // 4096 fits Mistral 7B comfortably on M1 16 GB
  temperature: 0.1,    // Near-deterministic: compliance verdicts don't need creativity
  num_predict: 1024,   // Per-call output budget; batch calls override this proportionally
  top_k: 20,
  top_p: 0.85,
  repeat_penalty: 1.1,
  num_gpu: 999,        // Force all layers onto Metal GPU — avoid slow CPU fallback
  num_thread: 4,
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
  const { stream = false, model = DEFAULT_MODEL, ollamaOptions = {} } = options;

  const mergedOptions = { ...OLLAMA_OPTIONS, ...ollamaOptions };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: stream,
        options: mergedOptions,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

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
      const data = await response.json();
      return data.response || "";
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("Ollama server is not running. Please start it with: ollama serve");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Compliance status constants
 */
const COMPLIANCE_STATUS = {
  COMPLIANT: "compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_APPLICABLE: "not_applicable",
  NEEDS_REVIEW: "needs_review",
};

/**
 * Minimum confidence assigned by policy when the model omits the CONFIDENCE field
 * or when evidence supports the assessment regardless of stated confidence.
 * Override via DEFAULT_CONFIDENCE_WHEN_OMITTED env var.
 */
const DEFAULT_CONFIDENCE_WHEN_OMITTED = parseInt(process.env.DEFAULT_CONFIDENCE_WHEN_OMITTED ?? "75", 10);

/**
 * Hard evidence floors: never let confidence drop below these even if the model
 * emits a low number. Keeps decisive assessments appropriately weighted.
 */
const CONFIDENCE_FLOORS = {
  [COMPLIANCE_STATUS.NOT_APPLICABLE]: 90,
  [COMPLIANCE_STATUS.NON_COMPLIANT]: 72,
  [COMPLIANCE_STATUS.COMPLIANT]: 72,
  [COMPLIANCE_STATUS.NEEDS_REVIEW]: 0,
};

/**
 * Apply confidence policy given what the model returned.
 *
 * Rules (priority order):
 * 1. NOT_APPLICABLE always gets floor 90.
 * 2. If confidence was omitted, use DEFAULT_CONFIDENCE_WHEN_OMITTED.
 * 3. Apply issue-count-based boosts for non_compliant and compliant.
 * 4. Enforce the per-status floor (confidence can never go below floor).
 *
 * @param {string|null} preliminaryStatus - What the model assessed
 * @param {number} parsedConfidence - Raw confidence parsed from response (0–100)
 * @param {boolean} hadExplicitConfidence - Whether the model supplied a number
 * @param {number} issueCount - Number of parsed issues
 * @returns {number} Final calibrated confidence value
 */
function applyConfidencePolicy(preliminaryStatus, parsedConfidence, hadExplicitConfidence, issueCount) {
  if (!preliminaryStatus) return 0;

  let confidence = hadExplicitConfidence ? parsedConfidence : DEFAULT_CONFIDENCE_WHEN_OMITTED;

  if (preliminaryStatus === COMPLIANCE_STATUS.NOT_APPLICABLE) {
    confidence = Math.max(confidence, CONFIDENCE_FLOORS[COMPLIANCE_STATUS.NOT_APPLICABLE]);
  } else if (preliminaryStatus === COMPLIANCE_STATUS.NON_COMPLIANT) {
    if (issueCount >= 3) {
      confidence = Math.max(confidence, 85);
    } else if (issueCount >= 1) {
      confidence = Math.max(confidence, 75);
    } else {
      // NC with zero parsed issues still gets the floor — don't drop below it
      confidence = Math.max(confidence, CONFIDENCE_FLOORS[COMPLIANCE_STATUS.NON_COMPLIANT]);
    }
  } else if (preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT && issueCount === 0) {
    confidence = Math.max(confidence, 80);
  }

  // Enforce per-status hard floor
  const floor = CONFIDENCE_FLOORS[preliminaryStatus] ?? 0;
  return Math.max(confidence, floor);
}

/**
 * Build a prompt that asks LLM to determine compliance status
 */
function buildStatusPrompt(criterion, url, html, elementCount) {
  const custom = criterion.prompt ? `\nINSTRUCTIONS: ${criterion.prompt}\n` : "";
  const count = elementCount >= 0 ? elementCount : "?";
  return `RGAA 4.1 Audit. Criterion ${criterion.article} (Level ${criterion.level}): ${criterion.desc}
URL: ${url} | Elements: ${count}
${custom}
HTML:
${html}

Reply EXACTLY in this format (no extra text before or after):
ASSESSMENT: COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE
CONFIDENCE: 0-100
REASONING: one paragraph
ISSUES: bullet list or None
RECOMMENDATIONS: bullet list or None`;
}

/**
 * Parse LLM response to extract structured status data.
 *
 * Policy: if the model produced a parseable ASSESSMENT we always resolve to that
 * status — needs_review is reserved for truly unparseable responses only.
 * Confidence is filled by applyConfidencePolicy when omitted or below the floor.
 */
function parseStatusResponse(response, criterion) {
  const result = {
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
    preliminaryStatus: null,
    confidence: 0,
    reasoning: "",
    issues: [],
    recommendations: [],
  };

  try {
    // Extract ASSESSMENT (preferred) or legacy STATUS keyword
    const assessmentMatch = response.match(/ASSESSMENT:\s*(COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE)/i);
    const statusMatch = response.match(/STATUS:\s*(COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE)/i);
    const matchedAssessment = assessmentMatch || statusMatch;

    if (matchedAssessment) {
      const assessmentStr = matchedAssessment[1].toUpperCase();
      if (assessmentStr === "COMPLIANT") {
        result.preliminaryStatus = COMPLIANCE_STATUS.COMPLIANT;
      } else if (assessmentStr === "NON_COMPLIANT") {
        result.preliminaryStatus = COMPLIANCE_STATUS.NON_COMPLIANT;
      } else if (assessmentStr === "NOT_APPLICABLE") {
        result.preliminaryStatus = COMPLIANCE_STATUS.NOT_APPLICABLE;
      }
    }

    // Extract CONFIDENCE — accept optional trailing % or space
    const confMatch = response.match(/CONFIDENCE:\s*(\d+)\s*%?/i);
    const hadExplicitConfidence = !!confMatch;
    const parsedConfidence = hadExplicitConfidence ? Math.min(100, Math.max(0, parseInt(confMatch[1], 10))) : DEFAULT_CONFIDENCE_WHEN_OMITTED;

    // Extract REASONING
    const reasonMatch = response.match(/REASONING:\s*([^\n]+(?:\n(?!ISSUES:|RECOMMENDATIONS:|ASSESSMENT:|CONFIDENCE:)[^\n]+)*)/i);
    if (reasonMatch) {
      result.reasoning = reasonMatch[1].trim();
    }

    // Extract ISSUES
    const issuesMatch = response.match(/ISSUES:\s*([\s\S]*?)(?=RECOMMENDATIONS:|ASSESSMENT:|$)/i);
    if (issuesMatch) {
      const issuesText = issuesMatch[1].trim();
      if (issuesText.toLowerCase() !== "none") {
        const issues = issuesText
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter((line) => line.length > 0);
        result.issues = issues.map((text) => ({ type: "issue", message: text }));
      }
    }

    // Extract RECOMMENDATIONS
    const recsMatch = response.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/i);
    if (recsMatch) {
      const recsText = recsMatch[1].trim();
      if (recsText.toLowerCase() !== "none") {
        result.recommendations = recsText
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter((line) => line.length > 0);
      }
    }

    if (!result.reasoning) {
      result.reasoning = response.substring(0, 500);
    }

    // N/A pattern detection: if the LLM said COMPLIANT but reasoning clearly signals
    // non-applicability, reclassify to NOT_APPLICABLE.
    if (result.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT && result.issues.length === 0) {
      const naPatterns = [
        /\bno\b.{1,60}\bfound\b/i,
        /\bnot\s+applicable\b/i,
        /\bdoes\s+not\s+apply\b/i,
        /\bno\s+relevant\b/i,
        /\bno\b.{1,60}\bpresent\b/i,
        /\bno\b.{1,60}\bdetected\b/i,
        /\bnone\s+found\b/i,
        /\babsence\s+of\b/i,
        /\bno\s+such\s+element/i,
        /\bcriterion\s+does\s+not\s+apply\b/i,
      ];
      if (naPatterns.some((re) => re.test(result.reasoning))) {
        result.preliminaryStatus = COMPLIANCE_STATUS.NOT_APPLICABLE;
      }
    }

    if (result.preliminaryStatus) {
      // Always resolve to the AI's assessment — no confidence threshold gate.
      // applyConfidencePolicy sets floors so the number is always meaningful.
      result.confidence = applyConfidencePolicy(result.preliminaryStatus, parsedConfidence, hadExplicitConfidence, result.issues.length);
      result.status = result.preliminaryStatus;
    }
    // If no assessment was found: status stays needs_review, confidence stays 0 (signals "could not parse").
  } catch (error) {
    result.reasoning = response.substring(0, 500);
  }

  return result;
}

/**
 * Maximum number of criteria to evaluate in a single batched LLM call.
 * 2 keeps output within the default num_predict budget while still saving LLM calls.
 * Override via BATCH_SIZE_LLM env var.
 */
const BATCH_SIZE_LLM = parseInt(process.env.BATCH_SIZE_LLM ?? "2", 10);

/**
 * Estimated output tokens per criterion — used to scale num_predict for batch calls.
 * Each criterion response (ASSESSMENT + CONFIDENCE + REASONING + ISSUES + RECOMMENDATIONS)
 * is roughly 200 tokens for a concise response.
 */
const TOKENS_PER_CRITERION = 220;

/**
 * Build a single prompt that evaluates multiple criteria sharing the same HTML.
 * Criteria must be from the same RGAA theme so the HTML is relevant to all.
 *
 * The prompt explicitly instructs the model to echo each ---CRITERION X.Y--- header
 * so the response parser can identify which block belongs to which criterion.
 */
function buildBatchStatusPrompt(criteria, url, html) {
  const themeName = htmlExtractor.getThemeName(htmlExtractor.getThemeFromArticle(criteria[0].article));
  const header = `RGAA 4.1 Audit — ${themeName}
URL: ${url}

HTML:
${html}

IMPORTANT: For each criterion below, you MUST output its ---CRITERION X.Y--- header line exactly as shown, then fill in the fields. Do not skip any criterion.
`;
  const blocks = criteria.map((c) => {
    const custom = c.prompt ? `\nINSTRUCTIONS: ${c.prompt}` : "";
    return `---CRITERION ${c.article}---
Criterion: ${c.desc}${custom}
ASSESSMENT: COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE
CONFIDENCE: 0-100
REASONING: one paragraph
ISSUES: bullet list or None
RECOMMENDATIONS: bullet list or None`;
  });

  return header + "\n" + blocks.join("\n\n");
}

/**
 * Parse the batched LLM response into a map of article -> parsed status result.
 * Tolerates minor formatting drift (extra whitespace, markdown bold, missing trailing ---).
 * Falls back gracefully: missing criteria get needs_review with confidence 0.
 */
function parseBatchResponse(response, criteria) {
  const results = new Map();

  for (const criterion of criteria) {
    const escapedArticle = criterion.article.replace(".", "\\.");
    // Tolerate optional markdown bold markers (**/__ around delimiters) and whitespace variants
    const blockRe = new RegExp(
      `(?:\\*{0,2})?---\\s*CRITERION\\s+${escapedArticle}\\s*---(?:\\*{0,2})?[\\s\\S]*?(?=(?:\\*{0,2})?---\\s*CRITERION|$)`,
      "i",
    );
    const match = response.match(blockRe);
    if (match) {
      results.set(criterion.article, parseStatusResponse(match[0], criterion));
    } else {
      // Secondary attempt: look for the article number followed by an ASSESSMENT line anywhere
      const looseRe = new RegExp(`${escapedArticle}[^\\n]*\\n[\\s\\S]*?ASSESSMENT:\\s*(COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE)`, "i");
      const looseMatch = response.match(looseRe);
      if (looseMatch) {
        results.set(criterion.article, parseStatusResponse(looseMatch[0], criterion));
      } else {
        results.set(criterion.article, {
          status: COMPLIANCE_STATUS.NEEDS_REVIEW,
          preliminaryStatus: null,
          confidence: 0,
          reasoning: "Criterion block not found in batch response.",
          issues: [],
          recommendations: [],
        });
      }
    }
  }

  return results;
}

/**
 * Evaluate a group of criteria (same theme, all needing LLM) in a single LLM call.
 * Falls back to individual calls if the batch call fails.
 */
async function analyzeThemeBatch(criteria, pageContext, sharedHtml) {
  const { url, model } = pageContext;

  const uncached = [];
  const cachedResults = [];
  uncached.push(...criteria);

  if (uncached.length === 0) return cachedResults;

  const subBatches = [];
  for (let i = 0; i < uncached.length; i += BATCH_SIZE_LLM) {
    subBatches.push(uncached.slice(i, i + BATCH_SIZE_LLM));
  }

  const batchResults = [];
  for (const batch of subBatches) {
    const prompt = buildBatchStatusPrompt(batch, url, sharedHtml);
    // Scale output budget: each criterion needs ~TOKENS_PER_CRITERION tokens
    const numPredict = Math.max(512, TOKENS_PER_CRITERION * batch.length);
    let response;
    try {
      response = await query(prompt, { model, ollamaOptions: { num_predict: numPredict } });
    } catch (err) {
      // Whole batch call failed — fall back to individual calls
      for (const criterion of batch) {
        const singlePrompt = buildStatusPrompt(criterion, url, sharedHtml, -1);
        try {
          const singleResp = await query(singlePrompt, { model });
          const parsed = parseStatusResponse(singleResp, criterion);
          batchResults.push(buildResultObject(criterion, parsed, sharedHtml, "ai"));
        } catch {
          batchResults.push(
            buildResultObject(
              criterion,
              {
                status: COMPLIANCE_STATUS.NEEDS_REVIEW,
                confidence: 0,
                reasoning: `Error: ${err.message}`,
                issues: [],
                recommendations: [],
              },
              sharedHtml,
              "error",
            ),
          );
        }
      }
      continue;
    }

    const parsedMap = parseBatchResponse(response, batch);

    // For any criterion whose block was not found in the batch response, retry individually.
    // This covers truncated responses and format-drift cases.
    const retryNeeded = batch.filter(
      (c) => parsedMap.get(c.article)?.reasoning === "Criterion block not found in batch response.",
    );
    for (const criterion of retryNeeded) {
      const singlePrompt = buildStatusPrompt(criterion, url, sharedHtml, -1);
      try {
        const singleResp = await query(singlePrompt, { model });
        parsedMap.set(criterion.article, parseStatusResponse(singleResp, criterion));
      } catch {
        // Keep the "block not found" fallback; no worse than before
      }
    }

    for (const criterion of batch) {
      const parsed = parsedMap.get(criterion.article);
      const resultObj = buildResultObject(criterion, parsed, sharedHtml, "ai");
      batchResults.push(resultObj);
    }
  }

  return [...cachedResults, ...batchResults];
}

/**
 * Helper to assemble a result object.
 */
function buildResultObject(criterion, parsed, html, testedBy) {
  return {
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
    testedBy,
  };
}

/**
 * Analyze multiple criteria with status determination.
 *
 * @param {Array} criteria - Array of criterion objects
 * @param {Object} pageContext - Context about the page
 * @param {Object} violationsByRule - Map of axe rule ID to violations
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of structured analysis results
 */
async function analyzeAllWithStatus(criteria, pageContext, violationsByRule = {}, options = {}) {
  const { onProgress = null } = options;

  const applicabilityMap = htmlExtractor.batchCheckApplicability(pageContext.html, criteria);

  const notApplicable = [];
  const axeResolved = [];
  const needsLlm = new Map(); // theme -> [{ criterion, applicability }]

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
        testedBy: "element_detection",
      });
      continue;
    }

    const axeRules = criterion.axeRules || [];
    const violations = axeRules.map((ruleId) => violationsByRule[ruleId]).filter(Boolean);

    if (violations.length > 0) {
      const issues = violations.map((v) => ({
        type: "violation",
        message: v.help || v.description,
        elements: v.nodes ? v.nodes.map((n) => n.html?.substring(0, 200)) : [],
        impact: v.impact,
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
        testedBy: "axe_core",
      });
      continue;
    }

    if (axeRules.length > 0) {
      axeResolved.push({
        criterion: criterion.article,
        level: criterion.level,
        desc: criterion.desc,
        status: COMPLIANCE_STATUS.COMPLIANT,
        confidence: 85,
        reasoning: `Automated testing (axe-core) passed — no violations for: ${axeRules.join(", ")}`,
        issues: [],
        recommendations: [],
        elementCount: app.elementCount,
        timestamp: new Date().toISOString(),
        fromCache: false,
        testedBy: "axe_core",
      });
      continue;
    }

    const theme = htmlExtractor.getThemeFromArticle(criterion.article) ?? 0;
    if (!needsLlm.has(theme)) needsLlm.set(theme, []);
    needsLlm.get(theme).push({ criterion, elementCount: app.elementCount });
  }

  const total = criteria.length;
  let completed = 0;
  if (onProgress) {
    for (const result of [...notApplicable, ...axeResolved]) {
      completed++;
      onProgress(completed, total, { article: result.criterion }, result);
    }
  }

  const themeHtmlMap = htmlExtractor.extractForBatch(
    pageContext.html,
    [...needsLlm.values()].flat().map((e) => e.criterion),
    { maxChars: 8000, maxElements: 80, includeContext: true },
  );

  const llmResults = [];
  for (const [theme, entries] of needsLlm) {
    const sharedHtml = themeHtmlMap.get(theme) || pageContext.html.substring(0, 8000);
    const themeCriteria = entries.map((e) => e.criterion);

    let batchOut;
    try {
      batchOut = await analyzeThemeBatch(themeCriteria, pageContext, sharedHtml);
    } catch {
      batchOut = themeCriteria.map((c) => ({
        criterion: c.article,
        level: c.level,
        desc: c.desc,
        status: COMPLIANCE_STATUS.NEEDS_REVIEW,
        confidence: 0,
        reasoning: "Batch LLM call failed.",
        issues: [],
        recommendations: [],
        elementCount: -1,
        timestamp: new Date().toISOString(),
        fromCache: false,
        testedBy: "error",
        error: true,
      }));
    }

    for (const result of batchOut) {
      const entry = entries.find((e) => e.criterion.article === result.criterion);
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
    const [aMajor, aMinor] = a.criterion.split(".").map(Number);
    const [bMajor, bMinor] = b.criterion.split(".").map(Number);
    return aMajor - bMajor || aMinor - bMinor;
  });

  return allResults;
}

// ---------------------------------------------------------------------------
// Per-occurrence AI assessment
// ---------------------------------------------------------------------------

/**
 * Build a prompt that evaluates multiple HTML elements for a single criterion in
 * one LLM call. The model replies with one ---OCCURRENCE N--- block per element.
 *
 * @param {Object} criterion
 * @param {string} url
 * @param {Array<{occurrenceIndex: number, elementHtml: string}>} occurrences
 * @returns {string}
 */
function buildOccurrencesBatchPrompt(criterion, url, occurrences) {
  const custom = criterion.prompt ? `\nINSTRUCTIONS: ${criterion.prompt}` : "";
  const elementBlocks = occurrences
    .map((occ, i) => `---ELEMENT ${i + 1}---\n${(occ.elementHtml || "").slice(0, 600)}`)
    .join("\n\n");

  return `RGAA 4.1 Per-element audit. Criterion ${criterion.article} (Level ${criterion.level}): ${criterion.desc}${custom}
URL: ${url}

Assess each element occurrence below against this criterion.
For every element, reply with EXACTLY this block (no extra text between blocks):

---OCCURRENCE 1---
ASSESSMENT: COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE
CONFIDENCE: 0-100
REASONING: one sentence

${elementBlocks}`;
}

/**
 * Parse per-occurrence batch response. Returns the same occurrences array with
 * occurrenceAiStatus / occurrenceAiConfidence / occurrenceAiReasoning filled in.
 *
 * @param {string} response - Raw LLM response
 * @param {Array} occurrences - Original occurrence objects
 * @returns {Array} occurrences with AI fields populated
 */
function parseOccurrencesBatchResponse(response, occurrences) {
  return occurrences.map((occ, i) => {
    const idx = i + 1;
    const blockRe = new RegExp(
      `---\\s*OCCURRENCE\\s+${idx}\\s*---[\\s\\S]*?(?=---\\s*OCCURRENCE\\s+\\d|$)`,
      "i",
    );
    const match = response.match(blockRe);
    if (!match) return { ...occ };

    const block = match[0];
    const assessmentMatch = block.match(/ASSESSMENT:\s*(COMPLIANT|NON_COMPLIANT|NOT_APPLICABLE)/i);
    if (!assessmentMatch) return { ...occ };

    const statusMap = {
      COMPLIANT: COMPLIANCE_STATUS.COMPLIANT,
      NON_COMPLIANT: COMPLIANCE_STATUS.NON_COMPLIANT,
      NOT_APPLICABLE: COMPLIANCE_STATUS.NOT_APPLICABLE,
    };
    const aiStatus = statusMap[assessmentMatch[1].toUpperCase()] || COMPLIANCE_STATUS.NEEDS_REVIEW;

    const confMatch = block.match(/CONFIDENCE:\s*(\d+)\s*%?/i);
    const hadConf = !!confMatch;
    const rawConf = hadConf ? Math.min(100, Math.max(0, parseInt(confMatch[1], 10))) : DEFAULT_CONFIDENCE_WHEN_OMITTED;
    const aiConfidence = applyConfidencePolicy(aiStatus, rawConf, hadConf, 0);

    const reasonMatch = block.match(/REASONING:\s*([^\n]+)/i);
    const aiReasoning = reasonMatch ? reasonMatch[1].trim() : null;

    return {
      ...occ,
      occurrenceStatus: aiStatus,
      occurrenceReason: aiReasoning || occ.occurrenceReason,
      occurrenceAiStatus: aiStatus,
      occurrenceAiConfidence: aiConfidence,
      occurrenceAiReasoning: aiReasoning,
    };
  });
}

/**
 * Evaluate each occurrence of a criterion with a single batched LLM call.
 * Returns the same occurrences array with per-element AI fields populated.
 * On any LLM failure returns the occurrences unchanged.
 *
 * @param {Object} criterion
 * @param {Array} occurrences - Evidence items (each has .elementHtml)
 * @param {Object} pageContext - { url, model }
 * @returns {Promise<Array>}
 */
async function evaluateOccurrences(criterion, occurrences, pageContext) {
  if (occurrences.length === 0) return [];

  const { url, model } = pageContext;
  const prompt = buildOccurrencesBatchPrompt(criterion, url, occurrences);

  // Budget: ~90 tokens per occurrence (ASSESSMENT + CONFIDENCE + one-sentence REASONING)
  const numPredict = Math.max(256, 90 * occurrences.length);

  let response;
  try {
    response = await query(prompt, { model, ollamaOptions: { num_predict: numPredict } });
  } catch {
    return occurrences;
  }

  return parseOccurrencesBatchResponse(response, occurrences);
}

/**
 * Rollup per-occurrence AI results into a single criterion-level verdict.
 * Logic (worst-of):
 *   - Any non_compliant occurrence              → criterion is non_compliant
 *   - All not_applicable                        → criterion is not_applicable
 *   - Any needs_review occurrence               → criterion is needs_review
 *   - Otherwise (compliant + optional N/A mix)  → criterion is compliant
 *
 * Confidence:
 *   - non_compliant: min of failing occurrence confidences
 *   - compliant: min of all applicable occurrence confidences
 *   - needs_review: average of all available confidence values
 *
 * @param {Array} occurrences - Evaluated occurrence objects
 * @returns {{ status: string, confidence: number } | null} null when no occurrences have AI results
 */
function rollupOccurrenceStatus(occurrences) {
  const evaluated = occurrences.filter((ev) => ev.occurrenceAiStatus);
  if (evaluated.length === 0) return null;

  const statuses = evaluated.map((ev) => ev.occurrenceAiStatus);
  const hasNonCompliant = statuses.some((s) => s === COMPLIANCE_STATUS.NON_COMPLIANT);
  const allDone = statuses.every(
    (s) => s === COMPLIANCE_STATUS.COMPLIANT || s === COMPLIANCE_STATUS.NOT_APPLICABLE,
  );
  const allNotApplicable = statuses.every((s) => s === COMPLIANCE_STATUS.NOT_APPLICABLE);

  if (allNotApplicable) {
    const confs = evaluated.map((ev) => ev.occurrenceAiConfidence ?? CONFIDENCE_FLOORS[COMPLIANCE_STATUS.NOT_APPLICABLE]);
    return { status: COMPLIANCE_STATUS.NOT_APPLICABLE, confidence: Math.min(...confs) };
  }

  if (hasNonCompliant) {
    const failConfs = evaluated
      .filter((ev) => ev.occurrenceAiStatus === COMPLIANCE_STATUS.NON_COMPLIANT)
      .map((ev) => ev.occurrenceAiConfidence ?? CONFIDENCE_FLOORS[COMPLIANCE_STATUS.NON_COMPLIANT]);
    return { status: COMPLIANCE_STATUS.NON_COMPLIANT, confidence: Math.min(...failConfs) };
  }

  if (allDone) {
    const applicableConfs = evaluated
      .filter((ev) => ev.occurrenceAiStatus !== COMPLIANCE_STATUS.NOT_APPLICABLE)
      .map((ev) => ev.occurrenceAiConfidence ?? CONFIDENCE_FLOORS[COMPLIANCE_STATUS.COMPLIANT]);
    const confidence = applicableConfs.length > 0 ? Math.min(...applicableConfs) : CONFIDENCE_FLOORS[COMPLIANCE_STATUS.COMPLIANT];
    return { status: COMPLIANCE_STATUS.COMPLIANT, confidence };
  }

  // Mixed — includes needs_review occurrences
  const allConfs = evaluated.map((ev) => ev.occurrenceAiConfidence ?? 0).filter((c) => c > 0);
  const confidence = allConfs.length > 0 ? Math.round(allConfs.reduce((a, b) => a + b, 0) / allConfs.length) : 0;
  return { status: COMPLIANCE_STATUS.NEEDS_REVIEW, confidence };
}

/**
 * Check if Ollama server is running and accessible
 * @returns {Promise<boolean>} - True if server is accessible
 */
async function checkHealth() {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
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
    this.concurrency = Math.max(1, Math.min(n, 5));
  },

  setOllamaOptions(options) {
    this.ollamaOptions = { ...OLLAMA_OPTIONS, ...options };
  },
};

module.exports = {
  query,
  analyzeAllWithStatus,
  analyzeThemeBatch,
  buildBatchStatusPrompt,
  parseBatchResponse,
  evaluateOccurrences,
  rollupOccurrenceStatus,
  checkHealth,
  htmlExtractor,
  config,
  COMPLIANCE_STATUS,
  CONFIDENCE_FLOORS,
  DEFAULT_MODEL,
  DEFAULT_CONCURRENCY,
  OLLAMA_OPTIONS,
};
