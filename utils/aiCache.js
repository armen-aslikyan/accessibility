/**
 * AI Analysis Cache Manager
 * Caches LLM analysis results to avoid repeated expensive API calls
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'ai-analysis-cache.json');

// Ensure cache directory exists
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

// Generate a cache key from criterion and HTML content
function generateCacheKey(criterion, html) {
    // Use article number and a hash of the HTML to create unique key
    const htmlHash = crypto.createHash('md5').update(html.substring(0, 5000)).digest('hex').substring(0, 8);
    return `${criterion.article}-${htmlHash}`;
}

// Load cache from file
function loadCache() {
    ensureCacheDir();
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('⚠️  Failed to load cache, starting fresh:', error.message);
            return {};
        }
    }
    return {};
}

// Save cache to file
function saveCache(cache) {
    ensureCacheDir();
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (error) {
        console.error('❌ Failed to save cache:', error.message);
    }
}

// Get cached analysis
function getCachedAnalysis(criterion, html) {
    const cache = loadCache();
    const key = generateCacheKey(criterion, html);
    
    if (cache[key]) {
        const cached = cache[key];
        // Check if cache is not too old (e.g., 7 days)
        const ageInDays = (Date.now() - new Date(cached.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays < 7) {
            return cached;
        }
    }
    
    return null;
}

// Store analysis in cache
function cacheAnalysis(criterion, html, analysis) {
    const cache = loadCache();
    const key = generateCacheKey(criterion, html);
    
    cache[key] = {
        criterion: criterion.article,
        analysis,
        timestamp: new Date().toISOString(),
        criterionDesc: criterion.desc,
        testMethod: criterion.testMethod
    };
    
    saveCache(cache);
}

// Export all cached analyses to a raw data file
function exportCacheToFile(outputPath) {
    const cache = loadCache();
    const exportData = {
        exportDate: new Date().toISOString(),
        totalAnalyses: Object.keys(cache).length,
        analyses: cache
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`📦 Exported ${Object.keys(cache).length} cached analyses to: ${outputPath}`);
}

// Clear cache (useful for testing or forcing refresh)
function clearCache() {
    if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
        console.log('🗑️  Cache cleared');
    }
}

// Get cache statistics
function getCacheStats() {
    const cache = loadCache();
    const keys = Object.keys(cache);
    
    return {
        totalEntries: keys.length,
        cacheFile: CACHE_FILE,
        size: fs.existsSync(CACHE_FILE) ? fs.statSync(CACHE_FILE).size : 0,
        oldestEntry: keys.length > 0 ? 
            Math.min(...keys.map(k => new Date(cache[k].timestamp).getTime())) : null,
        newestEntry: keys.length > 0 ? 
            Math.max(...keys.map(k => new Date(cache[k].timestamp).getTime())) : null
    };
}

module.exports = {
    getCachedAnalysis,
    cacheAnalysis,
    exportCacheToFile,
    clearCache,
    getCacheStats,
    loadCache
};
