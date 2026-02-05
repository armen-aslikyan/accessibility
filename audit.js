const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const { co2 } = require("@tgwf/co2");
const path = require("path");
const { rgaaFlatMapping } = require("./constants/rgaaMapping.complete.js");
const { generateProReport } = require("./visualize.js");
const { generateWCAGReport } = require("./wcagReport.js");
const { generateRGAAReport, analyzeRGAACompliance } = require("./rgaaReport.js");
const { generateDeclarationAccessibilite } = require("./declarationAccessibilite.js");
const { generateDetailedRGAAReport } = require("./rgaaDetailedReport.js");
const { exportAuditData } = require("./exportAuditData.js");
const llmClient = require("./utils/llmClient.js");

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================
// Adjust these based on your hardware and needs

// TESTING MODE: Limit analyses (set to null for full audit)
const TEST_LIMIT = null;

// PARALLEL PROCESSING: Number of concurrent LLM requests
// Recommended: 2 for M1, 3 for M2/M3, 1 for slower machines
const CONCURRENCY = 2;

// MODEL SELECTION: Uncomment preferred model
// Run "ollama pull <model>" to download before using
const PREFERRED_MODEL = "mistral"; // Default, good quality
// const PREFERRED_MODEL = 'mistral:7b-instruct-q4_K_M';  // Faster, quantized
// const PREFERRED_MODEL = 'llama3.1:8b';         // Meta's model, fast
// const PREFERRED_MODEL = 'phi3:medium';         // Microsoft, very fast
// const PREFERRED_MODEL = 'gemma2:9b';           // Google, good balance
// ============================================================================

async function runAudit(url) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      timeout: 60000,
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000); // Set default timeout for all operations

    // 1. Track Network Data (for Carbon Calculation)
    let totalBytes = 0;
    page.on("response", async (response) => {
      const headers = response.headers();
      if (headers["content-length"]) {
        totalBytes += parseInt(headers["content-length"], 10);
      }
    });

    console.log(`--- Starting Audit for: ${url} ---`);

    // Navigate with increased timeout and more lenient wait condition
    // 'load' waits for the load event, 'networkidle' can be too strict for some sites
    try {
      await page.goto(url, {
        waitUntil: "load",
        timeout: 60000, // 60 seconds timeout
      });
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.log("⚠️  Page load timeout, but continuing with partial content...");
      } else {
        throw error;
      }
    }

    // Wait a bit more for dynamic content to load
    await page.waitForTimeout(2000);

    // Extract page HTML content for LLM analysis
    const pageHTML = await page.content();

    // 2. Run Accessibility Scan
    // Optimized configuration for maximum RGAA compliance detection
    // RGAA 4.1 is based on WCAG 2.1 Level AA, so we explicitly target those rules
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a", // WCAG 2.0 Level A (baseline)
        "wcag2aa", // WCAG 2.0 Level AA
        "wcag21a", // WCAG 2.1 Level A (RGAA requirement)
        "wcag21aa", // WCAG 2.1 Level AA (RGAA requirement)
        "wcag22aa", // WCAG 2.2 Level AA (forward compatibility)
      ])
      .analyze();

    // 3. Calculate Carbon Footprint
    const co2Emitter = new co2();
    const estimate = co2Emitter.perVisit(totalBytes);

    // 4. Process RGAA Criteria Based on Test Method
    // Create a map of violations by axe-core rule ID for quick lookup
    const violationsByRule = {};
    results.violations.forEach((violation) => {
      violationsByRule[violation.id] = violation;
    });

    console.log(`\n[ RGAA COMPREHENSIVE AUDIT REPORT ]`);
    console.log(`Total axe-core Violations Found: ${results.violations.length}`);

    // Categorize criteria by test method
    const automatedTests = [];
    const automatedWithHumanCheck = [];
    const manualChecks = [];
    const aiChecks = [];

    Object.entries(rgaaFlatMapping).forEach(([article, criterion]) => {
      const testMethod = criterion.testMethod;
      const axeRules = criterion.axeRules || [];

      // Check if any of the criterion's axe rules have violations
      const relatedViolations = axeRules.map((ruleId) => violationsByRule[ruleId]).filter(Boolean);

      const criterionData = {
        article,
        ...criterion,
        violations: relatedViolations,
      };

      if (testMethod === "axe-core") {
        automatedTests.push(criterionData);
      } else if (testMethod === "axe-core,ai" || testMethod === "axe-core,manual") {
        // Both need automated testing + human verification
        automatedWithHumanCheck.push(criterionData);
      } else if (testMethod === "manual") {
        manualChecks.push(criterionData);
      } else if (testMethod === "ai") {
        aiChecks.push(criterionData);
      }
    });

    // Report automated test results (axe-core only)
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖 AUTOMATED TESTS (axe-core) - ${automatedTests.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const automatedWithViolations = automatedTests.filter((c) => c.violations.length > 0);
    console.log(`✅ Passed: ${automatedTests.length - automatedWithViolations.length}`);
    console.log(`❌ Failed: ${automatedWithViolations.length}`);

    automatedWithViolations.forEach((criterion) => {
      console.log(`\n============================================================`);
      console.log(`🔴 RGAA ${criterion.article} - ${criterion.level}`);
      console.log(`${criterion.desc}`);
      console.log(`============================================================`);

      console.log(`\n[ BUSINESS IMPACT ]`);
      console.log(`⚠️  RISK: ${criterion.risk}`);
      console.log(`💰 FINES: ${criterion.financial}`);
      console.log(`✨ BRAND: ${criterion.brand}`);

      criterion.violations.forEach((violation) => {
        console.log(`\n📋 Issue: ${violation.help}`);
        console.log(`🛠️  Fix: ${criterion.fix}`);

        violation.nodes.forEach((node, index) => {
          console.log(`\n--- Occurrence #${index + 1} ---`);
          console.log(`📍 Location: ${node.target.join(", ")}`);
          console.log(`💻 Code: ${node.html.substring(0, 200)}${node.html.length > 200 ? "..." : ""}`);
        });
      });
    });

    // Report automated tests that need human verification
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖👤 AUTOMATED + HUMAN CHECK REQUIRED - ${automatedWithHumanCheck.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const automatedAiWithViolations = automatedWithHumanCheck.filter((c) => c.violations.length > 0);
    const automatedAiPassed = automatedWithHumanCheck.filter((c) => c.violations.length === 0);
    console.log(`✅ Passed automated: ${automatedAiPassed.length}`);
    console.log(`❌ Failed automated: ${automatedAiWithViolations.length}`);
    console.log(`⚠️  All ${automatedWithHumanCheck.length} require human verification for quality and relevance\n`);

    // Show FAILED automated tests that need human review
    if (automatedAiWithViolations.length > 0) {
      console.log(`\n❌ FAILED AUTOMATED TESTS (need human review):\n`);
      automatedAiWithViolations.forEach((criterion) => {
        console.log(`\n============================================================`);
        console.log(`🔴 RGAA ${criterion.article} - ${criterion.level} ⚠️ HUMAN REVIEW REQUIRED`);
        console.log(`${criterion.desc}`);
        console.log(`============================================================`);

        console.log(`\n[ BUSINESS IMPACT ]`);
        console.log(`⚠️  RISK: ${criterion.risk}`);
        console.log(`💰 FINES: ${criterion.financial}`);
        console.log(`✨ BRAND: ${criterion.brand}`);

        criterion.violations.forEach((violation) => {
          console.log(`\n📋 Automated Issue Detected: ${violation.help}`);
          console.log(
            `⚠️  Human must verify: ${
              criterion.testMethod === "axe-core,manual"
                ? "Partial automation - manual verification required for full compliance"
                : "Quality and relevance of implementation"
            }`
          );
          console.log(`🛠️  Fix: ${criterion.fix}`);

          violation.nodes.forEach((node, index) => {
            console.log(`\n--- Occurrence #${index + 1} ---`);
            console.log(`📍 Location: ${node.target.join(", ")}`);
            console.log(`💻 Code: ${node.html.substring(0, 200)}${node.html.length > 200 ? "..." : ""}`);
          });
        });
      });
    }

    // Show PASSED automated tests that still need human review
    if (automatedAiPassed.length > 0) {
      console.log(`\n\n✅ PASSED AUTOMATED TESTS (still need human review):\n`);
      automatedAiPassed.forEach((criterion) => {
        const reviewNote =
          criterion.testMethod === "axe-core,manual"
            ? "Passed automated checks but manual verification required for full compliance"
            : "Passed automated checks but quality and relevance need human verification";

        console.log(`✅ RGAA ${criterion.article} (${criterion.level}) ⚠️ ${reviewNote}`);
        console.log(`   ${criterion.desc}`);
      });
    }

    // List criteria requiring manual checks
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤 MANUAL CHECKS REQUIRED - ${manualChecks.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`These criteria require human judgment and cannot be automated:\n`);

    manualChecks.forEach((criterion) => {
      console.log(`📝 RGAA ${criterion.article} (${criterion.level}) - ${criterion.risk} risk`);
      console.log(`   ${criterion.desc}`);
      console.log(`   🛠️  ${criterion.fix}\n`);
    });

    // List criteria that could benefit from AI analysis
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖 AI-ASSISTED CHECKS RECOMMENDED - ${aiChecks.length} criteria`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`These criteria could benefit from AI vision/language analysis:\n`);

    // Check if LLM is available
    const llmAvailable = await llmClient.checkHealth();

    // Show cache statistics
    const cacheStats = llmClient.aiCache.getCacheStats();
    console.log(`\n📦 AI Analysis Cache: ${cacheStats.totalEntries} entries (${(cacheStats.size / 1024).toFixed(2)} KB)`);

    // Store all LLM analysis results for the HTML report and raw export
    const llmAnalysisResults = {
      aiChecks: [],
      manualChecks: [],
      hybridChecks: [], // automatedWithHumanCheck that also get AI analysis
    };

    if (llmAvailable) {
      const allToAnalyze = [...aiChecks, ...manualChecks, ...automatedWithHumanCheck];
      const limitedList = TEST_LIMIT ? allToAnalyze.slice(0, TEST_LIMIT) : allToAnalyze;
      const analysisLimit = TEST_LIMIT || allToAnalyze.length;

      console.log(`\n✨ Local LLM available (model: ${PREFERRED_MODEL})`);
      console.log(`   Mode: ${TEST_LIMIT ? "TEST" : "FULL"} (${limitedList.length} criteria)`);
      console.log(`   Concurrency: ${CONCURRENCY} parallel requests`);
      console.log(`   Optimizations: Smart HTML extraction, in-memory cache\n`);

      if (TEST_LIMIT && allToAnalyze.length > TEST_LIMIT) {
        console.log(`   (Full audit would analyze ${allToAnalyze.length} criteria)\n`);
      }

      let fromCache = 0;
      const startTime = Date.now();

      // Progress callback for parallel processing
      const onProgress = (completed, total, criterion, result) => {
        const icon = criterion.testMethod === "ai" ? "🤖" : criterion.testMethod === "manual" ? "📝" : "🤖👤";
        const cacheStatus = result.fromCache ? "(cached)" : "(new)";
        const errorStatus = result.error ? "⚠️" : "✅";
        console.log(`[${completed}/${total}] ${icon} RGAA ${criterion.article} ${errorStatus} ${cacheStatus}`);
        if (result.fromCache) fromCache++;
      };

      // OPTIMIZED: Use parallel processing with theme-based HTML extraction
      console.log(`\n📊 Analyzing ${limitedList.length} criteria in parallel...\n`);

      const parallelResults = await llmClient.analyzeByThemeBatch(
        limitedList,
        {
          url,
          html: pageHTML,
          useCache: true,
          model: PREFERRED_MODEL,
        },
        {
          concurrency: CONCURRENCY,
          onProgress,
        }
      );

      // Sort results back into categories
      for (const result of parallelResults) {
        const criterionData = limitedList.find((c) => c.article === result.criterion);
        if (!criterionData) continue;

        const enrichedResult = {
          ...criterionData,
          llmAnalysis: result.analysis,
          status: result.error ? "error" : "analyzed",
          timestamp: result.timestamp,
          fromCache: result.fromCache,
        };

        if (criterionData.testMethod === "ai") {
          llmAnalysisResults.aiChecks.push(enrichedResult);
        } else if (criterionData.testMethod === "manual") {
          llmAnalysisResults.manualChecks.push(enrichedResult);
        } else {
          llmAnalysisResults.hybridChecks.push(enrichedResult);
        }
      }

      // Add remaining criteria without AI analysis (for complete report)
      if (TEST_LIMIT) {
        const analyzedArticles = new Set(limitedList.map((c) => c.article));

        aiChecks
          .filter((c) => !analyzedArticles.has(c.article))
          .forEach((criterion) => {
            llmAnalysisResults.aiChecks.push({
              ...criterion,
              llmAnalysis: `Not analyzed in test mode (limited to ${TEST_LIMIT} total)`,
              status: "not_analyzed",
            });
          });

        manualChecks
          .filter((c) => !analyzedArticles.has(c.article))
          .forEach((criterion) => {
            llmAnalysisResults.manualChecks.push({
              ...criterion,
              llmAnalysis: `Not analyzed in test mode (limited to ${TEST_LIMIT} total)`,
              status: "not_analyzed",
            });
          });

        automatedWithHumanCheck
          .filter((c) => !analyzedArticles.has(c.article))
          .forEach((criterion) => {
            llmAnalysisResults.hybridChecks.push({
              ...criterion,
              llmAnalysis: `Not analyzed in test mode (limited to ${TEST_LIMIT} total)`,
              status: "not_analyzed",
            });
          });
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const analyzed = parallelResults.length;
      const avgTime = (elapsed / Math.max(analyzed - fromCache, 1)).toFixed(1);

      console.log(`\n✨ LLM Analysis Complete!`);
      console.log(`   Total time: ${elapsed}s`);
      console.log(`   Analyzed: ${analyzed} criteria`);
      console.log(`   From Cache: ${fromCache}/${analyzed} (${analyzed > 0 ? ((fromCache / analyzed) * 100).toFixed(1) : 0}%)`);
      console.log(`   New Analyses: ${analyzed - fromCache}`);
      console.log(`   Avg time per new analysis: ~${avgTime}s`);

      // Flush cache to disk
      llmClient.aiCache.flushCache();
    } else {
      console.log(`⚠️  Local LLM not available. Start Ollama server to enable AI analysis.`);
      console.log(`   Run: ollama serve (in a separate terminal)\n`);

      // Store criteria without analysis
      aiChecks.forEach((criterion) => {
        llmAnalysisResults.aiChecks.push({
          ...criterion,
          llmAnalysis: "LLM not available",
          status: "not_analyzed",
        });
        console.log(`🤖 RGAA ${criterion.article} (${criterion.level}) - ${criterion.risk} risk`);
        console.log(`   ${criterion.desc}`);
        console.log(`   🛠️  ${criterion.fix}\n`);
      });

      manualChecks.forEach((criterion) => {
        llmAnalysisResults.manualChecks.push({
          ...criterion,
          llmAnalysis: "LLM not available",
          status: "not_analyzed",
        });
      });

      automatedWithHumanCheck.forEach((criterion) => {
        llmAnalysisResults.hybridChecks.push({
          ...criterion,
          llmAnalysis: "LLM not available",
          status: "not_analyzed",
        });
      });
    }

    // Save raw AI findings to JSON file
    const fs = require("fs");
    const rawDataPath = path.join(__dirname, "reports", `ai-analysis-raw_${Date.now()}.json`);
    const rawData = {
      auditDate: new Date().toISOString(),
      url,
      llmAvailable,
      summary: {
        totalCriteria: Object.keys(rgaaFlatMapping).length,
        aiChecks: llmAnalysisResults.aiChecks.length,
        manualChecks: llmAnalysisResults.manualChecks.length,
        hybridChecks: llmAnalysisResults.hybridChecks.length,
        totalAnalyzed: llmAnalysisResults.aiChecks.length + llmAnalysisResults.manualChecks.length + llmAnalysisResults.hybridChecks.length,
      },
      analyses: llmAnalysisResults,
    };
    fs.writeFileSync(rawDataPath, JSON.stringify(rawData, null, 2));
    console.log(`\n💾 Raw AI analysis data saved to: ${path.basename(rawDataPath)}`);

    // Export cache for future use
    const cacheExportPath = path.join(__dirname, "reports", `ai-cache-export_${Date.now()}.json`);
    llmClient.aiCache.exportCacheToFile(cacheExportPath);

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 AUDIT SUMMARY`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total RGAA Criteria: ${Object.keys(rgaaFlatMapping).length}`);
    console.log(`Automated (axe-core): ${automatedTests.length} (${automatedWithViolations.length} failed)`);
    console.log(`Automated + Human: ${automatedWithHumanCheck.length} (${automatedAiWithViolations.length} failed)`);
    console.log(`Manual Checks: ${manualChecks.length}`);
    console.log(`AI-Assisted: ${aiChecks.length}`);

    console.log(`\n[ GREEN IMPACT REPORT ]`);
    console.log(`Page Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Carbon per Visit: ${estimate.toFixed(3)}g CO2`);

    // Analyze RGAA compliance for detailed report
    const rgaaStatus = analyzeRGAACompliance(results);

    // Generate all reports
    generateProReport(results, estimate, url);
    generateWCAGReport(results, url);
    generateRGAAReport(results, url);
    generateDetailedRGAAReport(rgaaStatus, url);

    // Generate comprehensive 106-criteria report with LLM analysis
    const { generateComprehensiveRGAAReport } = require("./comprehensiveRGAAReport.js");

    // Merge hybrid checks with automatedWithHumanCheck, adding AI analysis
    const hybridWithAI = automatedWithHumanCheck.map((criterion) => {
      const aiAnalysis = llmAnalysisResults.hybridChecks.find((h) => h.article === criterion.article);
      return {
        ...criterion,
        llmAnalysis: aiAnalysis?.llmAnalysis || null,
        llmStatus: aiAnalysis?.status || "not_analyzed",
      };
    });

    generateComprehensiveRGAAReport({
      url,
      automatedTests,
      automatedWithHumanCheck: hybridWithAI,
      manualChecks: llmAnalysisResults.manualChecks,
      aiChecks: llmAnalysisResults.aiChecks,
      llmAvailable,
      timestamp: new Date().toISOString(),
    });

    // Generate official French accessibility declaration
    generateDeclarationAccessibilite(results, url, {
      entityName: "Vivatech",
      siteName: "Vivatech",
      email: "contact@vivatechnology.com",
      contactForm: "https://vivatechnology.com/contact",
      schemaUrl: "[Lien vers le document]",
      actionPlanUrl: "[Lien vers le document]",
      testedPages: [
        { name: "Accueil", url: "https://vivatechnology.com" },
        // { name: 'À propos', url: 'https://vivatechnology.com/about' },
        // { name: 'Actualités', url: 'https://vivatechnology.com/news' }
      ],
    });

    // Export comprehensive JSON data for React frontend
    exportAuditData({
      url,
      results,
      co2Data: estimate,
      totalBytes,
      automatedTests,
      automatedWithHumanCheck: hybridWithAI,
      manualChecks: llmAnalysisResults.manualChecks,
      aiChecks: llmAnalysisResults.aiChecks,
      llmAvailable,
      llmAnalysisResults,
      rgaaStatus,
      timestamp: new Date().toISOString(),
    });
  } finally {
    // Ensure browser is always closed, even if an error occurs
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

const pagesToAudit = [
  "https://vivatechnology.com",
  // 'https://vivatechnology.com/about',
  // 'https://vivatechnology.com/news'
];

async function runFullAudit() {
  console.log(`\n🚀 Starting Full Audit for ${pagesToAudit.length} page(s)...\n`);

  for (const url of pagesToAudit) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`--- AUDITING PAGE: ${url} ---`);
    console.log(`${"=".repeat(80)}\n`);

    try {
      await runAudit(url);
      console.log(`\n✅ Audit completed successfully for: ${url}`);
    } catch (error) {
      console.error(`\n❌ Audit failed for: ${url}`);
      console.error(`Error: ${error.message}`);
      console.error(`Continuing with next page...\n`);
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`✨ Full audit process completed!`);
  console.log(`${"=".repeat(80)}\n`);
}

// Test it on your example
runFullAudit().catch((error) => {
  console.error("\n❌ Fatal error in audit process:", error);
  process.exit(1);
});
