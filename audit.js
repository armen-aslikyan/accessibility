const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const path = require("path");
const fs = require("fs");
const { rgaaFlatMapping } = require("./constants/rgaaMapping.complete.js");
const { generateProReport } = require("./visualize.js");
const { generateWCAGReport } = require("./wcagReport.js");
const { generateRGAAReport, analyzeRGAACompliance } = require("./rgaaReport.js");
const { generateDeclarationAccessibilite } = require("./declarationAccessibilite.js");
const { generateDetailedRGAAReport } = require("./rgaaDetailedReport.js");
const { exportAuditData } = require("./exportAuditData.js");
const llmClient = require("./utils/llmClient.js");
const { COMPLIANCE_STATUS } = llmClient;

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

    // 3. Create a map of violations by axe-core rule ID for quick lookup
    const violationsByRule = {};
    results.violations.forEach((violation) => {
      violationsByRule[violation.id] = violation;
    });

    console.log(`\n[ RGAA 4.1 COMPREHENSIVE AUDIT ]`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total RGAA Criteria: ${Object.keys(rgaaFlatMapping).length}`);
    console.log(`Axe-core Violations Found: ${results.violations.length}`);

    // Build all criteria with their axe violations
    const allCriteria = Object.entries(rgaaFlatMapping).map(([article, criterion]) => ({
      article,
      ...criterion,
    }));

    // Check if LLM is available
    const llmAvailable = await llmClient.checkHealth();

    // Show cache statistics
    const cacheStats = llmClient.aiCache.getCacheStats();
    console.log(`AI Cache: ${cacheStats.totalEntries} entries (${(cacheStats.size / 1024).toFixed(2)} KB)`);

    // ========================================================================
    // OUTCOME-BASED ANALYSIS
    // ========================================================================
    // All criteria are analyzed together, categorized by RESULT not by METHOD
    // Results: Compliant, Non-Compliant, Not Applicable, Needs Review

    // Apply test limit if set
    const criteriaToAnalyze = TEST_LIMIT ? allCriteria.slice(0, TEST_LIMIT) : allCriteria;

    console.log(`\n✨ Analyzing ${criteriaToAnalyze.length} criteria...`);
    console.log(`   Model: ${PREFERRED_MODEL}`);
    console.log(`   Concurrency: ${CONCURRENCY}`);
    console.log(`   LLM Available: ${llmAvailable ? "Yes" : "No"}`);

    if (TEST_LIMIT) {
      console.log(`   Mode: TEST (limited to ${TEST_LIMIT} criteria)`);
    }

    let analysisResults = [];
    const startTime = Date.now();
    let fromCache = 0;

    if (llmAvailable) {
      // Progress callback
      const onProgress = (completed, total, criterion, result) => {
        const statusIcon =
          {
            [COMPLIANCE_STATUS.COMPLIANT]: "✅",
            [COMPLIANCE_STATUS.NON_COMPLIANT]: "❌",
            [COMPLIANCE_STATUS.NOT_APPLICABLE]: "⊘",
            [COMPLIANCE_STATUS.NEEDS_REVIEW]: "🔍",
          }[result.status] || "?";

        const cacheIcon = result.fromCache ? "📦" : "🆕";
        const testedBy = result.testedBy === "element_detection" ? "elem" : result.testedBy === "axe_core" ? "axe" : "AI";

        console.log(`[${completed}/${total}] ${statusIcon} RGAA ${criterion.article} (${testedBy}) ${cacheIcon}`);
        if (result.fromCache) fromCache++;
      };

      // Use the new outcome-based analysis
      console.log(`\n📊 Running analysis...\n`);

      analysisResults = await llmClient.analyzeAllWithStatus(
        criteriaToAnalyze,
        {
          url,
          html: pageHTML,
          useCache: true,
          model: PREFERRED_MODEL,
        },
        violationsByRule,
        {
          concurrency: CONCURRENCY,
          onProgress,
        }
      );
    } else {
      console.log(`\n⚠️  LLM not available. Running element detection only...`);

      // Without LLM, we can still detect Not Applicable and axe-core violations
      const applicabilityMap = llmClient.htmlExtractor.batchCheckApplicability(pageHTML, criteriaToAnalyze);

      for (const criterion of criteriaToAnalyze) {
        const app = applicabilityMap.get(criterion.article);
        const axeRules = criterion.axeRules || [];
        const violations = axeRules.map((ruleId) => violationsByRule[ruleId]).filter(Boolean);

        if (app && !app.applicable) {
          analysisResults.push({
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
            testedBy: "element_detection",
          });
        } else if (violations.length > 0) {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NON_COMPLIANT,
            confidence: 95,
            reasoning: `Automated testing detected ${violations.length} violation(s)`,
            issues: violations.map((v) => ({ type: "violation", message: v.help })),
            recommendations: [criterion.fix],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: "axe_core",
          });
        } else {
          analysisResults.push({
            criterion: criterion.article,
            level: criterion.level,
            desc: criterion.desc,
            status: COMPLIANCE_STATUS.NEEDS_REVIEW,
            confidence: 0,
            reasoning: "LLM not available - manual review required",
            issues: [],
            recommendations: [],
            elementCount: app?.elementCount || -1,
            timestamp: new Date().toISOString(),
            testedBy: "none",
          });
        }
      }
    }

    // Flush cache
    llmClient.aiCache.flushCache();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // ========================================================================
    // CATEGORIZE RESULTS BY OUTCOME
    // ========================================================================
    const compliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.COMPLIANT);
    const nonCompliant = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NON_COMPLIANT);
    const notApplicable = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NOT_APPLICABLE);
    const needsReview = analysisResults.filter((r) => r.status === COMPLIANCE_STATUS.NEEDS_REVIEW);

    // ========================================================================
    // DISPLAY RESULTS BY STATUS
    // ========================================================================
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 ANALYSIS COMPLETE - RESULTS BY STATUS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Total analyzed: ${analysisResults.length}`);
    console.log(`   Time: ${elapsed}s`);
    console.log(`   From cache: ${fromCache}\n`);

    // Summary counts
    console.log(`   ✅ Compliant:      ${compliant.length}`);
    console.log(`   ❌ Non-Compliant:  ${nonCompliant.length}`);
    console.log(`   ⊘  Not Applicable: ${notApplicable.length}`);
    console.log(`   🔍 Needs Review:   ${needsReview.length}`);

    // Show Non-Compliant criteria (violations)
    if (nonCompliant.length > 0) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`❌ NON-COMPLIANT CRITERIA (${nonCompliant.length})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      nonCompliant.forEach((result) => {
        const criterion = rgaaFlatMapping[result.criterion];
        console.log(`\n🔴 RGAA ${result.criterion} (Level ${result.level})`);
        console.log(`   ${result.desc}`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Tested by: ${result.testedBy}`);
        console.log(`   Reasoning: ${result.reasoning}`);

        if (result.issues && result.issues.length > 0) {
          console.log(`   Issues:`);
          result.issues.forEach((issue, i) => {
            console.log(`     ${i + 1}. ${issue.message}`);
          });
        }

        if (result.recommendations && result.recommendations.length > 0) {
          console.log(`   Fix: ${result.recommendations[0]}`);
        } else if (criterion?.fix) {
          console.log(`   Fix: ${criterion.fix}`);
        }
      });
    }

    // Show Needs Review criteria
    if (needsReview.length > 0) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔍 NEEDS HUMAN REVIEW (${needsReview.length})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`These criteria require human verification:\n`);

      needsReview.forEach((result) => {
        console.log(`   🔍 RGAA ${result.criterion} (${result.level}) - ${result.reasoning?.substring(0, 80)}...`);
      });
    }

    // Show Not Applicable criteria
    if (notApplicable.length > 0) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⊘ NOT APPLICABLE (${notApplicable.length})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`These criteria don't apply to this page:\n`);

      notApplicable.forEach((result) => {
        console.log(`   ⊘ RGAA ${result.criterion}: ${result.reasoning}`);
      });
    }

    // Show Compliant criteria (brief)
    if (compliant.length > 0) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✅ COMPLIANT (${compliant.length})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      compliant.forEach((result) => {
        console.log(`   ✅ RGAA ${result.criterion} (${result.level})`);
      });
    }

    // Calculate compliance rate (excluding N/A)
    const applicableCount = analysisResults.length - notApplicable.length;
    const complianceRate = applicableCount > 0 ? ((compliant.length / applicableCount) * 100).toFixed(1) : 0;

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 COMPLIANCE SUMMARY`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Applicable criteria: ${applicableCount}`);
    console.log(`   Compliant: ${compliant.length}`);
    console.log(`   Non-Compliant: ${nonCompliant.length}`);
    console.log(`   Needs Review: ${needsReview.length}`);
    console.log(`   Compliance Rate: ${complianceRate}% (excluding N/A and Needs Review)`);

    // Prepare data for export in the new format
    const auditResults = {
      compliant,
      nonCompliant,
      notApplicable,
      needsReview,
      all: analysisResults,
    };

    // Save results to JSON
    const rawDataPath = path.join(__dirname, "reports", `audit-results_${Date.now()}.json`);
    const rawData = {
      auditDate: new Date().toISOString(),
      url,
      llmAvailable,
      model: PREFERRED_MODEL,
      summary: {
        totalCriteria: Object.keys(rgaaFlatMapping).length,
        analyzed: analysisResults.length,
        compliant: compliant.length,
        nonCompliant: nonCompliant.length,
        notApplicable: notApplicable.length,
        needsReview: needsReview.length,
        complianceRate: parseFloat(complianceRate),
      },
      results: auditResults,
    };
    fs.writeFileSync(rawDataPath, JSON.stringify(rawData, null, 2));
    console.log(`\n💾 Results saved to: ${path.basename(rawDataPath)}`);

    // Export cache
    const cacheExportPath = path.join(__dirname, "reports", `ai-cache-export_${Date.now()}.json`);
    llmClient.aiCache.exportCacheToFile(cacheExportPath);

    // Analyze RGAA compliance for detailed report (legacy format)
    const rgaaStatus = analyzeRGAACompliance(results);

    // Generate basic reports
    generateProReport(results, url);
    generateWCAGReport(results, url);
    generateRGAAReport(results, url);
    generateDetailedRGAAReport(rgaaStatus, url);

    // Generate official French accessibility declaration
    generateDeclarationAccessibilite(results, url, {
      entityName: "Vivatech",
      siteName: "Vivatech",
      email: "contact@vivatechnology.com",
      contactForm: "https://vivatechnology.com/contact",
      schemaUrl: "[Lien vers le document]",
      actionPlanUrl: "[Lien vers le document]",
      testedPages: [{ name: "Accueil", url: "https://vivatechnology.com" }],
    });

    // Export comprehensive JSON data for React frontend (new format)
    exportAuditData({
      url,
      results,
      // New outcome-based format
      auditResults,
      complianceRate: parseFloat(complianceRate),
      llmAvailable,
      model: PREFERRED_MODEL,
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
