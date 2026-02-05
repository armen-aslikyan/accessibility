/**
 * Smart HTML Extractor
 * Extracts only relevant HTML elements based on RGAA criterion theme
 * This significantly reduces prompt size and improves LLM performance
 */

const cheerio = require('cheerio');

/**
 * CSS selectors for each RGAA theme
 * Maps theme number to relevant HTML elements
 */
const THEME_SELECTORS = {
  // Theme 1: Images
  1: 'img, svg, [role="img"], picture, source, area, input[type="image"], object[type^="image"], embed[type^="image"], canvas',
  
  // Theme 2: Frames
  2: 'iframe, frame, frameset, object[type="text/html"], embed[type="text/html"]',
  
  // Theme 3: Colors (need elements with color/contrast - get styled elements)
  3: '[style*="color"], [style*="background"], [class], body, p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, label',
  
  // Theme 4: Multimedia
  4: 'video, audio, track, source, object[type^="video"], object[type^="audio"], embed[type^="video"], embed[type^="audio"], [role="application"]',
  
  // Theme 5: Tables
  5: 'table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col, [role="table"], [role="grid"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]',
  
  // Theme 6: Links
  6: 'a[href], [role="link"], area[href]',
  
  // Theme 7: Scripts (interactive elements)
  7: 'button, [role="button"], [onclick], [onchange], [onfocus], [onblur], [onkeydown], [onkeyup], [onkeypress], [tabindex], [role="dialog"], [role="alertdialog"], [role="alert"], [aria-live], [aria-expanded], [aria-controls], [aria-haspopup], select, input, textarea',
  
  // Theme 8: Mandatory elements (document structure)
  8: 'html, head, title, meta[charset], meta[name="viewport"], meta[http-equiv], lang, [lang], [xml\\:lang], main, [role="main"]',
  
  // Theme 9: Structure (headings, landmarks, lists)
  9: 'h1, h2, h3, h4, h5, h6, [role="heading"], header, nav, main, footer, aside, section, article, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"], [role="region"], ul, ol, li, dl, dt, dd, [role="list"], [role="listitem"], blockquote, q, cite',
  
  // Theme 10: Presentation (CSS, layout, spacing)
  10: '[style], [class], [hidden], [aria-hidden], [role="presentation"], [role="none"], hr, br, pre, code, abbr, dfn, ins, del, sub, sup, strong, em, mark, small',
  
  // Theme 11: Forms
  11: 'form, input, select, textarea, button, fieldset, legend, label, optgroup, option, datalist, output, progress, meter, [role="form"], [role="textbox"], [role="checkbox"], [role="radio"], [role="combobox"], [role="listbox"], [role="slider"], [role="spinbutton"], [role="searchbox"], [for], [aria-labelledby], [aria-describedby], [aria-required], [aria-invalid], [required], [pattern], [autocomplete]',
  
  // Theme 12: Navigation
  12: 'nav, [role="navigation"], a[href], [role="link"], [tabindex], [accesskey], header, footer, main, [role="banner"], [role="contentinfo"], [role="main"], [role="search"], [id], [aria-label], [aria-labelledby], [skip-link], a[href^="#"]',
  
  // Theme 13: Consultation (time limits, refresh, downloads)
  13: 'meta[http-equiv="refresh"], [download], a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".zip"], a[href$=".rar"], object, embed, [autoplay], video[autoplay], audio[autoplay], [target="_blank"], [target="_new"]'
};

/**
 * Additional context selectors - parent/sibling elements that provide context
 */
const CONTEXT_SELECTORS = {
  1: 'figure, figcaption, picture',
  4: 'figure, figcaption',
  5: 'caption',
  6: 'nav, li',
  11: 'fieldset, legend, label',
};

/**
 * Get theme number from criterion article (e.g., "1.3" -> 1, "11.2" -> 11)
 * @param {string} article - The criterion article number
 * @returns {number} - The theme number
 */
function getThemeFromArticle(article) {
  if (!article) return null;
  const theme = parseInt(article.split('.')[0], 10);
  return isNaN(theme) ? null : theme;
}

/**
 * Extract relevant HTML elements for a specific theme
 * @param {string} html - Full page HTML
 * @param {number} theme - RGAA theme number (1-13)
 * @param {Object} options - Extraction options
 * @param {number} options.maxElements - Maximum elements to extract (default: 50)
 * @param {number} options.maxChars - Maximum characters to return (default: 4000)
 * @param {boolean} options.includeContext - Include parent context (default: true)
 * @returns {string} - Extracted HTML snippet
 */
function extractForTheme(html, theme, options = {}) {
  const {
    maxElements = 50,
    maxChars = 4000,
    includeContext = true
  } = options;

  const selector = THEME_SELECTORS[theme];
  if (!selector) {
    // Fallback: return truncated body content
    return html.substring(0, maxChars);
  }

  try {
    const $ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: true
    });

    const elements = [];
    let charCount = 0;

    // Select relevant elements
    $(selector).each((index, element) => {
      if (index >= maxElements) return false;
      
      const el = $(element);
      let elementHtml = $.html(element);
      
      // Include parent context if available
      if (includeContext && CONTEXT_SELECTORS[theme]) {
        const parent = el.closest(CONTEXT_SELECTORS[theme]);
        if (parent.length && parent[0] !== element) {
          elementHtml = $.html(parent);
        }
      }

      // Check character limit
      if (charCount + elementHtml.length > maxChars) {
        // Try to fit a truncated version
        const remaining = maxChars - charCount;
        if (remaining > 100) {
          elements.push(elementHtml.substring(0, remaining) + '...');
        }
        return false;
      }

      elements.push(elementHtml);
      charCount += elementHtml.length;
    });

    if (elements.length === 0) {
      // No matching elements found - return a note
      return `<!-- No ${getThemeName(theme)} elements found on this page -->`;
    }

    // Add metadata about extraction
    const header = `<!-- Extracted ${elements.length} ${getThemeName(theme)} elements (Theme ${theme}) -->\n`;
    return header + elements.join('\n\n');
    
  } catch (error) {
    console.error(`Error extracting theme ${theme}:`, error.message);
    // Fallback to truncated HTML
    return html.substring(0, maxChars);
  }
}

/**
 * Extract HTML relevant to a specific criterion
 * @param {string} html - Full page HTML
 * @param {string} article - Criterion article number (e.g., "1.3", "11.2")
 * @param {Object} options - Extraction options
 * @returns {string} - Extracted HTML snippet
 */
function extractForCriterion(html, article, options = {}) {
  const theme = getThemeFromArticle(article);
  if (!theme) {
    return html.substring(0, options.maxChars || 4000);
  }
  return extractForTheme(html, theme, options);
}

/**
 * Extract HTML for a batch of criteria (grouped by theme)
 * @param {string} html - Full page HTML
 * @param {Array} criteria - Array of criterion objects with 'article' property
 * @param {Object} options - Extraction options
 * @returns {Map} - Map of theme -> extracted HTML
 */
function extractForBatch(html, criteria, options = {}) {
  const byTheme = new Map();
  
  // Group criteria by theme
  for (const criterion of criteria) {
    const theme = getThemeFromArticle(criterion.article);
    if (theme && !byTheme.has(theme)) {
      byTheme.set(theme, extractForTheme(html, theme, options));
    }
  }
  
  return byTheme;
}

/**
 * Get human-readable theme name
 * @param {number} theme - Theme number
 * @returns {string} - Theme name
 */
function getThemeName(theme) {
  const names = {
    1: 'Images',
    2: 'Frames',
    3: 'Colors',
    4: 'Multimedia',
    5: 'Tables',
    6: 'Links',
    7: 'Scripts',
    8: 'Mandatory Elements',
    9: 'Structure',
    10: 'Presentation',
    11: 'Forms',
    12: 'Navigation',
    13: 'Consultation'
  };
  return names[theme] || `Theme ${theme}`;
}

/**
 * Get quick stats about extractable elements
 * @param {string} html - Full page HTML
 * @returns {Object} - Stats per theme
 */
function getExtractionStats(html) {
  try {
    const $ = cheerio.load(html);
    const stats = {};
    
    for (const [theme, selector] of Object.entries(THEME_SELECTORS)) {
      stats[theme] = {
        name: getThemeName(parseInt(theme)),
        count: $(selector).length
      };
    }
    
    return stats;
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = {
  extractForTheme,
  extractForCriterion,
  extractForBatch,
  getThemeFromArticle,
  getThemeName,
  getExtractionStats,
  THEME_SELECTORS
};
