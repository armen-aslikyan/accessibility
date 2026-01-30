/**
 * Complete RGAA 4.1.2 Mapping
 * All 106 RGAA criteria mapped with axe-core rules where applicable
 * Source: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
 * Generated: 2026-01-30
 * 
 * Structure for each criterion:
 * - article: RGAA criterion number (e.g., "1.1")
 * - desc: Full criterion description from RGAA
 * - level: WCAG level (A, AA, AAA)
 * - risk: Business risk level (Critical, High, Medium, Low)
 * - financial: Financial/legal implications
 * - brand: Brand and UX impact
 * - fix: How to fix the issue
 * - testMethod: How this can be tested
 *   - "axe-core": Fully automatable with axe-core
 *   - "axe-core": Axe-core + AI can enhance quality checks
 *   - "manual": Requires human judgment
 *   - "ai": Potentially testable with AI vision/language models
 * - axeRules: Array of axe-core rule IDs that test this criterion (if applicable)
 * - tests: Array of RGAA test numbers for this criterion
 */

const rgaaTheme1Images = {
  "1.1": {
    desc: "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Excludes visually impaired users. Direct SEO penalty.",
    fix: "Provide alt text for informative images using alt attribute, aria-label, aria-labelledby, or title",
    testMethod: "axe-core",
    axeRules: ["image-alt", "input-image-alt", "area-alt", "svg-img-alt", "object-alt", "role-img-alt"],
    tests: ["1.1.1", "1.1.2", "1.1.3", "1.1.4", "1.1.5", "1.1.6", "1.1.7", "1.1.8"]
  },
  "1.2": {
    desc: "Chaque image de décoration est-elle correctement ignorée par les technologies d'assistance ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen reader users hear unnecessary information.",
    fix: "Use empty alt=\"\", aria-hidden=\"true\", or role=\"presentation\" for decorative images",
    testMethod: "axe-core",
    axeRules: ["image-alt"],
    tests: ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5", "1.2.6"]
  },
  "1.3": {
    desc: "Pour chaque image porteuse d'information ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users receive incorrect or misleading information.",
    fix: "Ensure alt text accurately describes the image content and purpose",
    testMethod: "ai",
    axeRules: [],
    tests: ["1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5", "1.3.6", "1.3.7", "1.3.8", "1.3.9"]
  },
  "1.4": {
    desc: "Pour chaque image utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative permet-elle d'identifier la nature et la fonction de l'image ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Users cannot complete essential tasks.",
    brand: "Blocks user registration, purchases, and critical workflows.",
    fix: "CAPTCHA alt text must identify it as a CAPTCHA and its purpose, not reveal the answer",
    testMethod: "manual",
    axeRules: [],
    tests: ["1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5", "1.4.6", "1.4.7"]
  },
  "1.5": {
    desc: "Pour chaque image utilisée comme CAPTCHA, une solution d'accès alternatif au contenu ou à la fonction du CAPTCHA est-elle présente ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Users cannot complete essential tasks.",
    brand: "Blocks user registration, purchases, and critical workflows.",
    fix: "Provide alternative CAPTCHA (audio, text-based) or alternative access method",
    testMethod: "manual",
    axeRules: [],
    tests: ["1.5.1", "1.5.2"]
  },
  "1.6": {
    desc: "Chaque image porteuse d'information a-t-elle, si nécessaire, une description détaillée ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine for complex informative images.",
    brand: "Users miss critical information from charts, diagrams, infographics.",
    fix: "Provide detailed description via aria-describedby, longdesc, or adjacent text",
    testMethod: "manual",
    axeRules: [],
    tests: ["1.6.1", "1.6.2", "1.6.3", "1.6.4", "1.6.5", "1.6.6", "1.6.7", "1.6.8", "1.6.9", "1.6.10"]
  },
  "1.7": {
    desc: "Pour chaque image porteuse d'information ayant une description détaillée, cette description est-elle pertinente ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine if description is inadequate.",
    brand: "Users cannot understand complex visual information.",
    fix: "Ensure detailed description conveys all essential visual information",
    testMethod: "ai",
    axeRules: [],
    tests: ["1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.7.5", "1.7.6"]
  },
  "1.8": {
    desc: "Chaque image texte porteuse d'information, en l'absence d'un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Poor display on zoom, translation tools fail, SEO penalty.",
    fix: "Replace text images with actual text styled with CSS (except logos, essential graphics)",
    testMethod: "manual",
    axeRules: [],
    tests: ["1.8.1", "1.8.2", "1.8.3", "1.8.4", "1.8.5", "1.8.6"]
  },
  "1.9": {
    desc: "Chaque légende d'image est-elle, si nécessaire, correctement reliée à l'image correspondante ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen reader users cannot associate captions with images.",
    fix: "Use <figure> with <figcaption>, role=\"figure\", and aria-label",
    testMethod: "manual",
    axeRules: [],
    tests: ["1.9.1", "1.9.2", "1.9.3", "1.9.4", "1.9.5"]
  }
};

const rgaaTheme2Frames = {
  "2.1": {
    desc: "Chaque cadre a-t-il un titre de cadre ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Confusing UX: Screen readers cannot identify frame content.",
    fix: "Every <iframe> and <frame> must have a title attribute",
    testMethod: "axe-core",
    axeRules: ["frame-title"],
    tests: ["2.1.1"]
  },
  "2.2": {
    desc: "Pour chaque cadre ayant un titre de cadre, ce titre de cadre est-il pertinent ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users receive misleading frame information.",
    fix: "Frame title must accurately describe frame content",
    testMethod: "ai",
    axeRules: [],
    tests: ["2.2.1"]
  }
};

const rgaaTheme3Colors = {
  "3.1": {
    desc: "Dans chaque page web, l'information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Excludes colorblind users (8% of men) and users in poor lighting.",
    fix: "Provide additional visual indicators (text, icons, patterns) alongside color",
    testMethod: "axe-core,manual",
    axeRules: ["link-in-text-block"],
    tests: ["3.1.1", "3.1.2", "3.1.3", "3.1.4", "3.1.5", "3.1.6"]
  },
  "3.2": {
    desc: "Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Text illegible for low vision users and in bright sunlight.",
    fix: "Text contrast ratio: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)",
    testMethod: "axe-core",
    axeRules: ["color-contrast"],
    tests: ["3.2.1", "3.2.2", "3.2.3", "3.2.4", "3.2.5"]
  },
  "3.3": {
    desc: "Dans chaque page web, les couleurs utilisées dans les composants d'interface ou les éléments graphiques porteurs d'informations sont-elles suffisamment contrastées (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "UI controls invisible in certain conditions, poor usability.",
    fix: "UI components and graphics: 3:1 contrast ratio with adjacent colors",
    testMethod: "axe-core",
    axeRules: ["color-contrast"],
    tests: ["3.3.1", "3.3.2", "3.3.3", "3.3.4"]
  }
};

const rgaaTheme4Multimedia = {
  "4.1": {
    desc: "Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Excludes deaf and blind users from video content.",
    fix: "Provide text transcript or audio description for pre-recorded video",
    testMethod: "axe-core,manual",
    axeRules: ["video-caption", "audio-caption"],
    tests: ["4.1.1", "4.1.2", "4.1.3"]
  },
  "4.2": {
    desc: "Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription synchronisée, celles-ci sont-elles pertinentes (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine if transcripts are inadequate.",
    brand: "Users receive incomplete or incorrect media information.",
    fix: "Ensure transcripts accurately convey all audio and visual information",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.2.1", "4.2.2", "4.2.3"]
  },
  "4.3": {
    desc: "Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Excludes deaf and hard-of-hearing users from video content.",
    fix: "Provide synchronized captions using <track kind=\"captions\">",
    testMethod: "axe-core,manual",
    axeRules: ["video-caption"],
    tests: ["4.3.1", "4.3.2"]
  },
  "4.4": {
    desc: "Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine if captions are inadequate.",
    brand: "Users receive incomplete or incorrect media information.",
    fix: "Ensure captions are accurate, synchronized, and include all dialogue and sounds",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.4.1"]
  },
  "4.5": {
    desc: "Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription synchronisée (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Excludes blind users from understanding visual video content.",
    fix: "Provide audio description track describing visual information",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.5.1", "4.5.2"]
  },
  "4.6": {
    desc: "Pour chaque média temporel pré-enregistré ayant une audiodescription synchronisée, celle-ci est-elle pertinente ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction if audio description is inadequate.",
    brand: "Blind users miss visual information in videos.",
    fix: "Ensure audio description conveys all essential visual information",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.6.1", "4.6.2"]
  },
  "4.7": {
    desc: "Chaque média temporel est-il clairement identifiable (hors cas particuliers) ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users cannot identify media purpose.",
    fix: "Provide clear title or description adjacent to media player",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.7.1"]
  },
  "4.8": {
    desc: "Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users cannot access Flash, Silverlight, or other plugin content.",
    fix: "Provide accessible HTML alternative for non-temporal media",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.8.1", "4.8.2"]
  },
  "4.9": {
    desc: "Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction if alternative is inadequate.",
    brand: "Users receive incomplete information from alternative.",
    fix: "Ensure alternative provides equivalent functionality and information",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.9.1"]
  },
  "4.10": {
    desc: "Chaque son déclenché automatiquement est-il contrôlable par l'utilisateur ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Interferes with screen readers, causes user frustration.",
    fix: "Auto-play sound must be ≤3 seconds or provide pause/stop/volume control",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.10.1"]
  },
  "4.11": {
    desc: "La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Keyboard users cannot control media playback.",
    fix: "All media controls must be keyboard accessible and properly labeled",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.11.1", "4.11.2", "4.11.3"]
  },
  "4.12": {
    desc: "La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Keyboard users cannot interact with plugins or complex media.",
    fix: "All non-temporal media controls must be keyboard accessible",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.12.1", "4.12.2"]
  },
  "4.13": {
    desc: "Chaque média temporel et non temporel est-il compatible avec les technologies d'assistance (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Screen readers cannot access or control media.",
    fix: "Ensure media players expose proper ARIA roles, states, and properties",
    testMethod: "manual",
    axeRules: [],
    tests: ["4.13.1", "4.13.2"]
  }
};

const rgaaTheme5Tables = {
  "5.1": {
    desc: "Chaque tableau de données complexe a-t-il un résumé ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Complex data tables are unnavigable for screen reader users.",
    fix: "Provide summary via <caption>, aria-describedby, or adjacent text",
    testMethod: "manual",
    axeRules: [],
    tests: ["5.1.1"]
  },
  "5.2": {
    desc: "Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction if summary is inadequate.",
    brand: "Users cannot understand complex table structure.",
    fix: "Ensure summary explains table structure and relationships",
    testMethod: "manual",
    axeRules: [],
    tests: ["5.2.1"]
  },
  "5.3": {
    desc: "Pour chaque tableau de mise en forme, le contenu linéarisé reste-t-il compréhensible ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Content order is illogical without visual layout.",
    fix: "Layout tables must use role=\"presentation\" and maintain logical reading order",
    testMethod: "manual",
    axeRules: [],
    tests: ["5.3.1"]
  },
  "5.4": {
    desc: "Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers cannot identify table purpose.",
    fix: "Use <caption>, title attribute, aria-label, or aria-labelledby for table title",
    testMethod: "manual",
    axeRules: [],
    tests: ["5.4.1"]
  },
  "5.5": {
    desc: "Pour chaque tableau de données ayant un titre, celui-ci est-il pertinent ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction if title is inadequate.",
    brand: "Users cannot quickly identify table content.",
    fix: "Table title must clearly identify table content and purpose",
    testMethod: "ai",
    axeRules: [],
    tests: ["5.5.1"]
  },
  "5.6": {
    desc: "Pour chaque tableau de données, chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Data tables completely unusable for screen reader users.",
    fix: "Use <th> for headers or role=\"columnheader\"/\"rowheader\" with ARIA",
    testMethod: "axe-core",
    axeRules: ["th-has-data-cells"],
    tests: ["5.6.1", "5.6.2", "5.6.3", "5.6.4"]
  },
  "5.7": {
    desc: "Pour chaque tableau de données, la technique appropriée permettant d'associer chaque cellule avec ses en-têtes est-elle utilisée (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Data tables completely unusable for screen reader users.",
    fix: "Use scope attribute (row/col) or headers/id association for complex tables",
    testMethod: "axe-core",
    axeRules: ["td-headers-attr", "scope-attr-valid"],
    tests: ["5.7.1", "5.7.2", "5.7.3", "5.7.4", "5.7.5"]
  },
  "5.8": {
    desc: "Chaque tableau de mise en forme ne doit pas utiliser d'éléments propres aux tableaux de données. Cette règle est-elle respectée ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers treat layout tables as data tables.",
    fix: "Layout tables must not use <caption>, <th>, <thead>, <tfoot>, summary, scope, headers, axis",
    testMethod: "manual",
    axeRules: [],
    tests: ["5.8.1"]
  }
};

const rgaaTheme6Links = {
  "6.1": {
    desc: "Chaque lien est-il explicite (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Total failure: Users cannot understand link destination.",
    fix: "Link text or context must make destination/purpose clear (avoid \"click here\", \"read more\")",
    testMethod: "axe-core",
    axeRules: ["link-name"],
    tests: ["6.1.1", "6.1.2", "6.1.3", "6.1.4", "6.1.5"]
  },
  "6.2": {
    desc: "Dans chaque page web, chaque lien a-t-il un intitulé ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Links are completely unusable for screen reader users.",
    fix: "Every link must have text content, alt text, aria-label, or aria-labelledby",
    testMethod: "axe-core",
    axeRules: ["link-name"],
    tests: ["6.2.1"]
  }
};

const rgaaTheme7Scripts = {
  "7.1": {
    desc: "Chaque script est-il, si nécessaire, compatible avec les technologies d'assistance ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Functional block: Interactive elements invisible to assistive tech.",
    fix: "Use proper ARIA roles, states, properties for custom components",
    testMethod: "axe-core,manual",
    axeRules: ["aria-allowed-attr", "aria-required-attr", "aria-valid-attr", "aria-valid-attr-value"],
    tests: ["7.1.1", "7.1.2", "7.1.3"]
  },
  "7.2": {
    desc: "Pour chaque script ayant une alternative, cette alternative est-elle pertinente ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine if alternative is inadequate.",
    brand: "Users receive incomplete information from script alternative.",
    fix: "Ensure <noscript> or alternative provides equivalent functionality",
    testMethod: "manual",
    axeRules: [],
    tests: ["7.2.1", "7.2.2"]
  },
  "7.3": {
    desc: "Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Keyboard users cannot access interactive features.",
    fix: "All scripted interactions must be keyboard accessible (Enter, Space, Arrows, Esc)",
    testMethod: "axe-core,manual",
    axeRules: ["accesskeys", "tabindex"],
    tests: ["7.3.1", "7.3.2"]
  },
  "7.4": {
    desc: "Pour chaque script qui initie un changement de contexte, l'utilisateur est-il averti ou en a-t-il le contrôle ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Unexpected context changes disorient users.",
    fix: "Warn users before opening new windows, changing form content, or moving focus",
    testMethod: "manual",
    axeRules: [],
    tests: ["7.4.1"]
  },
  "7.5": {
    desc: "Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d'assistance ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen reader users miss critical status updates and errors.",
    fix: "Use role=\"status\", role=\"alert\", or aria-live for status messages",
    testMethod: "manual",
    axeRules: [],
    tests: ["7.5.1", "7.5.2", "7.5.3"]
  }
};

const rgaaTheme8Mandatory = {
  "8.1": {
    desc: "Chaque page web est-elle définie par un type de document ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Fundamental compliance failure. Automated bots flag immediately.",
    fix: "Include valid DOCTYPE declaration (e.g., <!DOCTYPE html>)",
    testMethod: "manual",
    axeRules: [],
    tests: ["8.1.1", "8.1.2", "8.1.3"]
  },
  "8.2": {
    desc: "Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Browser rendering issues, assistive tech failures.",
    fix: "Validate HTML: no duplicate IDs, proper nesting, closed tags, valid attributes",
    testMethod: "axe-core",
    axeRules: ["duplicate-id", "duplicate-id-active", "duplicate-id-aria"],
    tests: ["8.2.1"]
  },
  "8.3": {
    desc: "Dans chaque page web, la langue par défaut est-elle présente ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Fundamental compliance failure. Screen readers use wrong pronunciation.",
    fix: "Set lang attribute on <html> element (e.g., <html lang=\"fr\">)",
    testMethod: "axe-core",
    axeRules: ["html-has-lang"],
    tests: ["8.3.1"]
  },
  "8.4": {
    desc: "Pour chaque page web ayant une langue par défaut, le code de langue est-il pertinent ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Screen readers use wrong pronunciation for entire page.",
    fix: "Use valid ISO 639-1 language code that matches page language",
    testMethod: "axe-core",
    axeRules: ["html-lang-valid"],
    tests: ["8.4.1"]
  },
  "8.5": {
    desc: "Chaque page web a-t-elle un titre de page ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Poor SEO. Users cannot identify page in browser tabs/history.",
    fix: "Every page must have <title> element in <head>",
    testMethod: "axe-core",
    axeRules: ["document-title"],
    tests: ["8.5.1"]
  },
  "8.6": {
    desc: "Pour chaque page web ayant un titre de page, ce titre est-il pertinent ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Poor SEO. Users cannot identify page purpose.",
    fix: "Page title must be unique and describe page content/purpose",
    testMethod: "ai",
    axeRules: [],
    tests: ["8.6.1"]
  },
  "8.7": {
    desc: "Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers mispronounce foreign words and phrases.",
    fix: "Mark language changes with lang attribute on containing element",
    testMethod: "axe-core,manual",
    axeRules: ["valid-lang"],
    tests: ["8.7.1"]
  },
  "8.8": {
    desc: "Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers use wrong pronunciation for foreign text.",
    fix: "Use valid ISO 639-1 code matching the actual language used",
    testMethod: "axe-core,manual",
    axeRules: ["valid-lang"],
    tests: ["8.8.1"]
  },
  "8.9": {
    desc: "Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation. Cette règle est-elle respectée ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Semantic structure lost, screen readers convey wrong information.",
    fix: "Don't use semantic tags for presentation (e.g., <blockquote> for indentation)",
    testMethod: "manual",
    axeRules: [],
    tests: ["8.9.1"]
  },
  "8.10": {
    desc: "Dans chaque page web, les changements du sens de lecture sont-ils signalés ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers read right-to-left text in wrong order.",
    fix: "Use dir=\"rtl\" or dir=\"ltr\" for bidirectional text (Arabic, Hebrew)",
    testMethod: "manual",
    axeRules: [],
    tests: ["8.10.1", "8.10.2"]
  }
};

const rgaaTheme9Structure = {
  "9.1": {
    desc: "Dans chaque page web, l'information est-elle structurée par l'utilisation appropriée de titres ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Poor SEO. Screen readers cannot navigate efficiently.",
    fix: "Use proper heading hierarchy (<h1>-<h6>), don't skip levels, content must be pertinent",
    testMethod: "axe-core",
    axeRules: ["empty-heading", "heading-order"],
    tests: ["9.1.1", "9.1.2", "9.1.3"]
  },
  "9.2": {
    desc: "Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Poor SEO. Screen readers cannot navigate to main content.",
    fix: "Use <header>, <nav>, <main>, <footer> with proper ARIA landmarks",
    testMethod: "axe-core",
    axeRules: ["bypass", "skip-link", "region", "landmark-one-main"],
    tests: ["9.2.1"]
  },
  "9.3": {
    desc: "Dans chaque page web, chaque liste est-elle correctement structurée ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers cannot navigate lists or identify item relationships.",
    fix: "Use <ul>/<ol> with <li>, <dl> with <dt>/<dd>, or role=\"list\"/\"listitem\"",
    testMethod: "axe-core",
    axeRules: ["list", "listitem", "definition-list", "dlitem"],
    tests: ["9.3.1", "9.3.2", "9.3.3"]
  },
  "9.4": {
    desc: "Dans chaque page web, chaque citation est-elle correctement indiquée ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Semantic meaning lost for citations.",
    fix: "Use <q> for inline quotes, <blockquote> for block quotes",
    testMethod: "manual",
    axeRules: [],
    tests: ["9.4.1", "9.4.2"]
  }
};

const rgaaTheme10Presentation = {
  "10.1": {
    desc: "Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l'information ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Content inaccessible without CSS, poor responsive design.",
    fix: "Use CSS for presentation, not HTML attributes (align, bgcolor, etc.) or spacer images",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.1.1", "10.1.2", "10.1.3"]
  },
  "10.2": {
    desc: "Dans chaque page web, le contenu visible porteur d'information reste-t-il présent lorsque les feuilles de styles sont désactivées ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Critical information hidden without CSS.",
    fix: "Don't use CSS to add informative content (use HTML with CSS styling)",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.2.1"]
  },
  "10.3": {
    desc: "Dans chaque page web, l'information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Content order illogical without CSS positioning.",
    fix: "Ensure DOM order is logical; don't rely on CSS for content meaning",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.3.1"]
  },
  "10.4": {
    desc: "Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu'à 200 %, au moins (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Text illegible for low vision users using browser zoom.",
    fix: "Use relative units (em, rem, %), allow text resize to 200% without loss of content",
    testMethod: "axe-core,manual",
    axeRules: ["meta-viewport"],
    tests: ["10.4.1", "10.4.2"]
  },
  "10.5": {
    desc: "Dans chaque page web, les déclarations CSS de couleurs de fond d'élément et de police sont-elles correctement utilisées ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Unreadable text if user overrides colors.",
    fix: "Always specify both foreground and background colors together",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.5.1", "10.5.2", "10.5.3"]
  },
  "10.6": {
    desc: "Dans chaque page web, chaque lien dont la nature n'est pas évidente est-il visible par rapport au texte environnant ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users cannot identify links within text.",
    fix: "Text links must have 3:1 contrast with surrounding text + underline/border on hover/focus",
    testMethod: "axe-core",
    axeRules: ["link-in-text-block"],
    tests: ["10.6.1"]
  },
  "10.7": {
    desc: "Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ?",
    level: "AA",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Keyboard users cannot see where they are on the page.",
    fix: "Ensure visible focus indicator (outline, border, background) with 3:1 contrast",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.7.1"]
  },
  "10.8": {
    desc: "Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d'assistance ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Hidden content incorrectly exposed or important content hidden.",
    fix: "Use aria-hidden=\"true\" or display:none/visibility:hidden consistently",
    testMethod: "axe-core,manual",
    axeRules: ["aria-hidden-body"],
    tests: ["10.8.1"]
  },
  "10.9": {
    desc: "Dans chaque page web, l'information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen reader users cannot perceive visual-only cues.",
    fix: "Don't rely solely on visual characteristics (\"click the red button on the right\")",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.9.1", "10.9.2", "10.9.3", "10.9.4"]
  },
  "10.10": {
    desc: "Dans chaque page web, l'information ne doit pas être donnée par la forme, taille ou position uniquement. Cette règle est-elle implémentée de façon pertinente ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen reader users miss information conveyed visually.",
    fix: "Provide text alternatives for shape/size/position information",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.10.1", "10.10.2", "10.10.3", "10.10.4"]
  },
  "10.11": {
    desc: "Pour chaque page web, les contenus peuvent-ils être présentés sans perte d'information ou de fonctionnalité et sans avoir recours soit à un défilement vertical pour une fenêtre ayant une hauteur de 256 px, soit à un défilement horizontal pour une fenêtre ayant une largeur de 320 px (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Mobile users and zoom users must scroll in two dimensions.",
    fix: "Implement responsive design, content reflows at 320px width / 256px height",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.11.1", "10.11.2"]
  },
  "10.12": {
    desc: "Dans chaque page web, les propriétés d'espacement du texte peuvent-elles être redéfinies par l'utilisateur sans perte de contenu ou de fonctionnalité (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Dyslexic users cannot adjust text spacing for readability.",
    fix: "Allow user overrides: line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em, word-spacing 0.16em",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.12.1"]
  },
  "10.13": {
    desc: "Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d'un composant d'interface sont-ils contrôlables par l'utilisateur (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Tooltips and popovers obscure content, cannot be dismissed.",
    fix: "Additional content on hover/focus must be dismissible (Esc), hoverable, persistent",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.13.1", "10.13.2", "10.13.3"]
  },
  "10.14": {
    desc: "Dans chaque page web, les contenus additionnels apparaissant via les styles CSS uniquement peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Keyboard users cannot access hover-only content.",
    fix: "Content shown on :hover must also appear on :focus or via keyboard activation",
    testMethod: "manual",
    axeRules: [],
    tests: ["10.14.1", "10.14.2"]
  }
};

const rgaaTheme11Forms = {
  "11.1": {
    desc: "Chaque champ de formulaire a-t-il une étiquette ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Transaction failure: Users cannot understand or complete forms.",
    fix: "Every input must have <label>, aria-label, aria-labelledby, or title",
    testMethod: "axe-core",
    axeRules: ["label", "aria-input-field-name", "select-name"],
    tests: ["11.1.1", "11.1.2", "11.1.3"]
  },
  "11.2": {
    desc: "Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Users receive incorrect form field information.",
    fix: "Label must clearly describe input purpose and include visible label text in accessible name",
    testMethod: "ai",
    axeRules: [],
    tests: ["11.2.1", "11.2.2", "11.2.3", "11.2.4", "11.2.5", "11.2.6"]
  },
  "11.3": {
    desc: "Dans chaque formulaire, chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Inconsistent labeling confuses users.",
    fix: "Use consistent labels for fields with same purpose across pages (e.g., all search fields)",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.3.1", "11.3.2"]
  },
  "11.4": {
    desc: "Dans chaque formulaire, chaque étiquette de champ et son champ associé sont-ils accolés (hors cas particuliers) ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Visual association between label and field is unclear.",
    fix: "Place labels immediately before/above inputs (or after for checkboxes/radios)",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.4.1", "11.4.2", "11.4.3"]
  },
  "11.5": {
    desc: "Dans chaque formulaire, les champs de même nature sont-ils regroupés, si nécessaire ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers cannot understand field relationships.",
    fix: "Group related fields with <fieldset> or role=\"group\"/\"radiogroup\"",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.5.1"]
  },
  "11.6": {
    desc: "Dans chaque formulaire, chaque regroupement de champs de même nature a-t-il une légende ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Screen readers cannot identify field group purpose.",
    fix: "Provide <legend> for <fieldset> or aria-label/aria-labelledby for role=\"group\"",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.6.1"]
  },
  "11.7": {
    desc: "Dans chaque formulaire, chaque légende associée à un regroupement de champs de même nature est-elle pertinente ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users receive incorrect field group information.",
    fix: "Group legend must clearly describe the group purpose",
    testMethod: "ai",
    axeRules: [],
    tests: ["11.7.1"]
  },
  "11.8": {
    desc: "Dans chaque formulaire, les items de même nature d'une liste de choix sont-ils regroupés de manière pertinente ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Long select lists difficult to navigate.",
    fix: "Use <optgroup> with label attribute to group related <option> elements",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.8.1", "11.8.2", "11.8.3"]
  },
  "11.9": {
    desc: "Dans chaque formulaire, l'intitulé de chaque bouton est-il pertinent (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Users cannot understand button purpose.",
    fix: "Button text/value/alt must clearly describe action and include visible text in accessible name",
    testMethod: "axe-core",
    axeRules: ["button-name", "input-button-name"],
    tests: ["11.9.1", "11.9.2"]
  },
  "11.10": {
    desc: "Dans chaque formulaire, le contrôle de saisie est-il utilisé de manière pertinente (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Transaction failure: Users submit invalid forms without understanding errors.",
    fix: "Mark required fields (required/aria-required), provide visible error messages",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.10.1", "11.10.2", "11.10.3", "11.10.4", "11.10.5", "11.10.6", "11.10.7"]
  },
  "11.11": {
    desc: "Dans chaque formulaire, le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Transaction failure: Users cannot fix form errors.",
    fix: "Provide specific error messages with examples of correct format",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.11.1", "11.11.2"]
  },
  "11.12": {
    desc: "Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l'utilisateur ?",
    level: "AA",
    risk: "Critical",
    financial: "€50,000 renewable fine. Legal liability for irreversible financial transactions.",
    brand: "Users accidentally make irreversible financial/legal commitments.",
    fix: "Provide review step, edit capability, or confirmation for critical transactions",
    testMethod: "manual",
    axeRules: [],
    tests: ["11.12.1", "11.12.2"]
  },
  "11.13": {
    desc: "La finalité d'un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l'utilisateur ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Cognitive load: Users must manually fill all fields.",
    fix: "Use autocomplete attribute with appropriate values for personal data fields",
    testMethod: "axe-core",
    axeRules: ["autocomplete-valid"],
    tests: ["11.13.1"]
  }
};

const rgaaTheme12Navigation = {
  "12.1": {
    desc: "Chaque ensemble de pages dispose-t-il de deux systèmes de navigation différents, au moins (hors cas particuliers) ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users have only one way to find content.",
    fix: "Provide at least two of: navigation menu, search, sitemap",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.1.1"]
  },
  "12.2": {
    desc: "Dans chaque ensemble de pages, le menu et les barres de navigation sont-ils toujours à la même place (hors cas particuliers) ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Inconsistent navigation frustrates users.",
    fix: "Keep navigation menus in same visual and DOM position across pages",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.2.1"]
  },
  "12.3": {
    desc: "La page « plan du site » est-elle pertinente ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction if sitemap is inadequate.",
    brand: "Users cannot use sitemap to navigate.",
    fix: "Sitemap must be representative, links must work and be up-to-date",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.3.1", "12.3.2", "12.3.3"]
  },
  "12.4": {
    desc: "Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir d'une fonctionnalité identique ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users cannot consistently find sitemap.",
    fix: "Sitemap link must be in same location with same text across pages",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.4.1", "12.4.2", "12.4.3"]
  },
  "12.5": {
    desc: "Dans chaque ensemble de pages, le moteur de recherche est-il atteignable de manière identique ?",
    level: "AA",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users cannot consistently find search.",
    fix: "Search must be in same location and same order across pages",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.5.1", "12.5.2", "12.5.3"]
  },
  "12.6": {
    desc: "Les zones de regroupement de contenus présentes dans plusieurs pages web (zones d'en-tête, de navigation principale, de contenu principal, de pied de page et de moteur de recherche) peuvent-elles être atteintes ou évitées ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Efficiency loss: Screen reader users cannot navigate page structure.",
    fix: "Use ARIA landmarks (banner, navigation, main, contentinfo, search) or skip links",
    testMethod: "axe-core",
    axeRules: ["region", "bypass"],
    tests: ["12.6.1"]
  },
  "12.7": {
    desc: "Dans chaque page web, un lien d'évitement ou d'accès rapide à la zone de contenu principal est-il présent (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Efficiency loss: Keyboard users must tab through entire header.",
    fix: "Provide visible or focusable 'skip to main content' link as first focusable element",
    testMethod: "axe-core",
    axeRules: ["skip-link", "bypass"],
    tests: ["12.7.1", "12.7.2"]
  },
  "12.8": {
    desc: "Dans chaque page web, l'ordre de tabulation est-il cohérent ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Keyboard navigation is illogical and frustrating.",
    fix: "Tab order must follow logical reading order, avoid positive tabindex values",
    testMethod: "axe-core,manual",
    axeRules: ["focus-order-semantics", "tabindex"],
    tests: ["12.8.1", "12.8.2"]
  },
  "12.9": {
    desc: "Dans chaque page web, la navigation ne doit pas contenir de piège au clavier. Cette règle est-elle respectée ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Functional block: Keyboard users get trapped, cannot proceed.",
    fix: "Users must be able to move focus away from all elements using keyboard alone",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.9.1"]
  },
  "12.10": {
    desc: "Dans chaque page web, les raccourcis clavier n'utilisant qu'une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l'utilisateur ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Single-key shortcuts interfere with assistive technology.",
    fix: "Single-key shortcuts must be disableable, remappable, or only active when component focused",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.10.1"]
  },
  "12.11": {
    desc: "Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l'activation d'un composant d'interface sont-ils si nécessaire atteignables au clavier ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Keyboard users cannot access interactive tooltip content.",
    fix: "If additional content contains interactive elements, they must be keyboard accessible",
    testMethod: "manual",
    axeRules: [],
    tests: ["12.11.1"]
  }
};

const rgaaTheme13Consultation = {
  "13.1": {
    desc: "Pour chaque page web, l'utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Frustrating UX: Users lose control of content and sessions.",
    fix: "Allow users to turn off, adjust, or extend time limits (20+ hours or 10x extension)",
    testMethod: "axe-core,manual",
    axeRules: ["meta-refresh"],
    tests: ["13.1.1", "13.1.2", "13.1.3", "13.1.4"]
  },
  "13.2": {
    desc: "Dans chaque page web, l'ouverture d'une nouvelle fenêtre ne doit pas être déclenchée sans action de l'utilisateur. Cette règle est-elle respectée ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Unexpected popups disorient users, perceived as spam.",
    fix: "Don't auto-open new windows on page load; require user interaction",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.2.1"]
  },
  "13.3": {
    desc: "Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible (hors cas particuliers) ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Users cannot access PDF, Word, Excel documents.",
    fix: "Provide accessible PDF or HTML alternative for downloadable office documents",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.3.1"]
  },
  "13.4": {
    desc: "Pour chaque document bureautique ayant une version accessible, cette version offre-t-elle la même information ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine if alternative is inadequate.",
    brand: "Users receive incomplete information from document alternative.",
    fix: "Accessible document version must contain same information as original",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.4.1"]
  },
  "13.5": {
    desc: "Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Screen readers cannot interpret ASCII art or emoticons.",
    fix: "Provide text alternative via title attribute or adjacent explanation",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.5.1"]
  },
  "13.6": {
    desc: "Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle pertinente ?",
    level: "A",
    risk: "Medium",
    financial: "Compliance deduction. Contributes to non-compliant status.",
    brand: "Users receive incorrect interpretation of ASCII art/emoticons.",
    fix: "Text alternative must accurately describe ASCII art or emoticon meaning",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.6.1"]
  },
  "13.7": {
    desc: "Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. LIFE-THREATENING: Can trigger seizures.",
    brand: "Legal liability: Risk of causing photosensitive epileptic seizures.",
    fix: "Flashing content must be <3 flashes/second or area <21824 pixels",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.7.1", "13.7.2", "13.7.3"]
  },
  "13.8": {
    desc: "Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l'utilisateur ?",
    level: "A",
    risk: "Critical",
    financial: "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
    brand: "Distracting content prevents users from reading/concentrating.",
    fix: "Moving/blinking content must be ≤5 seconds or pauseable by user",
    testMethod: "axe-core,manual",
    axeRules: ["blink"],
    tests: ["13.8.1", "13.8.2"]
  },
  "13.9": {
    desc: "Dans chaque page web, le contenu proposé est-il consultable quelle que soit l'orientation de l'écran (portrait ou paysage) (hors cas particuliers) ?",
    level: "AA",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Mobile users forced to use specific orientation.",
    fix: "Don't restrict content to portrait or landscape orientation",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.9.1"]
  },
  "13.10": {
    desc: "Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d'un geste complexe peuvent-elles être également disponibles au moyen d'un geste simple (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users with motor impairments cannot perform complex gestures.",
    fix: "Provide single-tap alternative for multipoint/path-based gestures",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.10.1", "13.10.2"]
  },
  "13.11": {
    desc: "Dans chaque page web, les actions déclenchées au moyen d'un dispositif de pointage sur un point unique de l'écran peuvent-elles faire l'objet d'une annulation (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users accidentally trigger actions, cannot undo.",
    fix: "Actions trigger on up-event (not down-event) or provide undo mechanism",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.11.1"]
  },
  "13.12": {
    desc: "Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l'appareil ou vers l'appareil peuvent-elles être satisfaites de manière alternative (hors cas particuliers) ?",
    level: "A",
    risk: "High",
    financial: "€25,000 - €50,000 fine. Significant compliance risk.",
    brand: "Users with motor impairments or mounted devices cannot shake/tilt device.",
    fix: "Provide UI alternative for shake/tilt gestures, allow motion detection disable",
    testMethod: "manual",
    axeRules: [],
    tests: ["13.12.1", "13.12.2", "13.12.3"]
  }
};

// Complete RGAA mapping object
const rgaaCompleteMapping = {
  theme1: { name: "Images", criteria: rgaaTheme1Images },
  theme2: { name: "Cadres", criteria: rgaaTheme2Frames },
  theme3: { name: "Couleurs", criteria: rgaaTheme3Colors },
  theme4: { name: "Multimédia", criteria: rgaaTheme4Multimedia },
  theme5: { name: "Tableaux", criteria: rgaaTheme5Tables },
  theme6: { name: "Liens", criteria: rgaaTheme6Links },
  theme7: { name: "Scripts", criteria: rgaaTheme7Scripts },
  theme8: { name: "Éléments obligatoires", criteria: rgaaTheme8Mandatory },
  theme9: { name: "Structuration de l'information", criteria: rgaaTheme9Structure },
  theme10: { name: "Présentation de l'information", criteria: rgaaTheme10Presentation },
  theme11: { name: "Formulaires", criteria: rgaaTheme11Forms },
  theme12: { name: "Navigation", criteria: rgaaTheme12Navigation },
  theme13: { name: "Consultation", criteria: rgaaTheme13Consultation }
};

// Flat mapping for backward compatibility with existing code
const rgaaFlatMapping = {
  ...rgaaTheme1Images,
  ...rgaaTheme2Frames,
  ...rgaaTheme3Colors,
  ...rgaaTheme4Multimedia,
  ...rgaaTheme5Tables,
  ...rgaaTheme6Links,
  ...rgaaTheme7Scripts,
  ...rgaaTheme8Mandatory,
  ...rgaaTheme9Structure,
  ...rgaaTheme10Presentation,
  ...rgaaTheme11Forms,
  ...rgaaTheme12Navigation,
  ...rgaaTheme13Consultation
};

module.exports = {
  rgaaCompleteMapping,
  rgaaFlatMapping,
  rgaaTheme1Images,
  rgaaTheme2Frames,
  rgaaTheme3Colors,
  rgaaTheme4Multimedia,
  rgaaTheme5Tables,
  rgaaTheme6Links,
  rgaaTheme7Scripts,
  rgaaTheme8Mandatory,
  rgaaTheme9Structure,
  rgaaTheme10Presentation,
  rgaaTheme11Forms,
  rgaaTheme12Navigation,
  rgaaTheme13Consultation
};
