/**
 * AI Cache Manager Utility
 * Manage, inspect, and clear AI analysis cache
 */

const aiCache = require('./utils/aiCache');
const fs = require('fs');
const path = require('path');

function showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           AI Analysis Cache Manager                            ║
╚════════════════════════════════════════════════════════════════╝

Usage: node cache-manager.js [command]

Commands:
  stats     Show cache statistics
  list      List all cached analyses
  export    Export cache to JSON file
  clear     Clear all cached data
  help      Show this help message

Examples:
  node cache-manager.js stats
  node cache-manager.js export
  node cache-manager.js clear
`);
}

function showStats() {
    const stats = aiCache.getCacheStats();
    const cache = aiCache.loadCache();
    
    console.log('\n📊 Cache Statistics\n' + '═'.repeat(60));
    console.log(`Total Entries: ${stats.totalEntries}`);
    console.log(`Cache Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`Cache Location: ${stats.cacheFile}`);
    
    if (stats.totalEntries > 0) {
        console.log(`Oldest Entry: ${new Date(stats.oldestEntry).toLocaleString()}`);
        console.log(`Newest Entry: ${new Date(stats.newestEntry).toLocaleString()}`);
        
        // Count by test method
        const byMethod = {};
        Object.values(cache).forEach(entry => {
            byMethod[entry.testMethod] = (byMethod[entry.testMethod] || 0) + 1;
        });
        
        console.log('\nBy Test Method:');
        Object.entries(byMethod).forEach(([method, count]) => {
            console.log(`  ${method}: ${count}`);
        });
    } else {
        console.log('\n⚠️  Cache is empty');
    }
    console.log('═'.repeat(60) + '\n');
}

function listCached() {
    const cache = aiCache.loadCache();
    const entries = Object.entries(cache);
    
    if (entries.length === 0) {
        console.log('\n⚠️  No cached analyses found\n');
        return;
    }
    
    console.log('\n📋 Cached Analyses\n' + '═'.repeat(60));
    entries.forEach(([key, data], index) => {
        console.log(`\n${index + 1}. RGAA ${data.criterion} (${data.testMethod})`);
        console.log(`   Key: ${key}`);
        console.log(`   Description: ${data.criterionDesc}`);
        console.log(`   Cached: ${new Date(data.timestamp).toLocaleString()}`);
        console.log(`   Analysis Length: ${data.analysis.length} characters`);
    });
    console.log('\n' + '═'.repeat(60) + '\n');
}

function exportCache() {
    const outputPath = path.join(__dirname, 'reports', `cache-export_${Date.now()}.json`);
    aiCache.exportCacheToFile(outputPath);
    console.log(`\n✅ Cache exported successfully!`);
    console.log(`📂 File: ${outputPath}\n`);
}

function clearCacheWithConfirmation() {
    const stats = aiCache.getCacheStats();
    
    if (stats.totalEntries === 0) {
        console.log('\n⚠️  Cache is already empty\n');
        return;
    }
    
    console.log(`\n⚠️  WARNING: This will delete ${stats.totalEntries} cached analyses`);
    console.log('   You will need to re-run AI analysis for all criteria');
    console.log('\n   Type "yes" to confirm, or anything else to cancel:');
    
    // In a real interactive script, you'd use readline
    // For now, just show the warning
    console.log('\n   To clear cache, run: rm cache/ai-analysis-cache.json\n');
}

// Parse command
const command = process.argv[2] || 'help';

switch (command.toLowerCase()) {
    case 'stats':
        showStats();
        break;
    case 'list':
        listCached();
        break;
    case 'export':
        exportCache();
        break;
    case 'clear':
        clearCacheWithConfirmation();
        break;
    case 'help':
    default:
        showHelp();
        break;
}
