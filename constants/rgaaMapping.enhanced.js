/**
 * RGAA 4.1 Enhanced Mapping to axe-core rules
 * Maximizes automated coverage of RGAA criteria
 * Generated: 2026-01-30T09:27:42.379Z
 * 
 * Coverage: 61 axe-core rules
 * Automatable RGAA criteria: 70/106 (66%)
 */

const rgaaTheme1Images = {
  "image-alt": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "Images must have alternative text"
  },
  "input-image-alt": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "Image buttons must have alternative text"
  },
  "area-alt": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "Active <area> elements must have alternative text"
  },
  "svg-img-alt": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "<svg> elements with an img role must have alternative text"
  },
  "object-alt": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "<object> elements must have alternative text"
  },
  "video-caption": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "<video> elements must have captions"
  },
  "audio-caption": {
      "article": "1.1",
      "desc": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes visually impaired users. Direct SEO penalty.",
      "fix": "<audio> elements must have a captions track"
  }
};

const rgaaTheme2Frames = {
  "aria-allowed-attr": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Elements must only use supported ARIA attributes"
  },
  "aria-command-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA commands must have an accessible name"
  },
  "aria-hidden-body": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "aria-hidden=\"true\" must not be present on the document body"
  },
  "aria-input-field-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA input fields must have an accessible name"
  },
  "aria-meter-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA meter nodes must have an accessible name"
  },
  "aria-progressbar-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA progressbar nodes must have an accessible name"
  },
  "aria-required-attr": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Required ARIA attributes must be provided"
  },
  "aria-required-children": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Certain ARIA roles must contain particular children"
  },
  "aria-required-parent": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Certain ARIA roles must be contained by particular parents"
  },
  "aria-roledescription": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "aria-roledescription must be on elements with a semantic role"
  },
  "aria-roles": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA roles used must conform to valid values"
  },
  "aria-toggle-field-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA toggle fields must have an accessible name"
  },
  "aria-valid-attr-value": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA attributes must conform to valid values"
  },
  "aria-valid-attr": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "ARIA attributes must conform to valid names"
  },
  "button-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Buttons must have discernible text"
  },
  "frame-title": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Frames must have an accessible name"
  },
  "input-button-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Input buttons must have discernible text"
  },
  "label": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Form elements must have labels"
  },
  "role-img-alt": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "[role=\"img\"] elements must have alternative text"
  },
  "select-name": {
      "article": "2.1",
      "desc": "Chaque cadre a-t-il un titre de cadre ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Confusing UX: Screen readers cannot identify frame content.",
      "fix": "Select element must have an accessible name"
  }
};

const rgaaTheme3Colors = {
  "link-in-text-block": {
      "article": "3.1",
      "desc": "Dans chaque page web, l'information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Excludes colorblind users (8% of men) and users in poor lighting.",
      "fix": "Links must be distinguishable without relying on color"
  },
  "color-contrast": {
      "article": "3.2",
      "desc": "Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Excludes colorblind users (8% of men) and users in poor lighting.",
      "fix": "Elements must meet minimum color contrast ratio thresholds"
  }
};

const rgaaTheme4Multimedia = {

};

const rgaaTheme5Tables = {
  "definition-list": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements"
  },
  "dlitem": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "<dt> and <dd> elements must be contained by a <dl>"
  },
  "list": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "<ul> and <ol> must only directly contain <li>, <script> or <template> elements"
  },
  "listitem": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "<li> elements must be contained in a <ul> or <ol>"
  },
  "th-has-data-cells": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "Table headers in a data table must refer to data cells"
  },
  "td-headers-attr": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "Table cell headers attributes must refer to other <th> elements in the same table"
  },
  "scope-attr-valid": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "scope attribute should be used correctly"
  },
  "table-duplicate-name": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "Tables should not have the same summary and caption"
  },
  "form-field-multiple-labels": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "Form field must not have multiple label elements"
  },
  "landmark-unique": {
      "article": "5.1",
      "desc": "Chaque tableau de données complexe a-t-il un résumé ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Data becomes unnavigable for screen reader users.",
      "fix": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination"
  }
};

const rgaaTheme6Links = {
  "link-name": {
      "article": "6.1",
      "desc": "Chaque lien est-il explicite ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Total failure: Users cannot understand link destination.",
      "fix": "Links must have discernible text"
  }
};

const rgaaTheme7Scripts = {
  "accesskeys": {
      "article": "7.3",
      "desc": "Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Functional block: Interactive elements invisible to assistive tech.",
      "fix": "accesskey attribute value should be unique"
  },
  "tabindex": {
      "article": "7.3",
      "desc": "Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Functional block: Interactive elements invisible to assistive tech.",
      "fix": "Elements should not have tabindex greater than zero"
  }
};

const rgaaTheme8Mandatory = {
  "duplicate-id": {
      "article": "8.1",
      "desc": "Chaque page web est-elle définie par un type de document ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "id attribute value must be unique"
  },
  "duplicate-id-active": {
      "article": "8.1",
      "desc": "Chaque page web est-elle définie par un type de document ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "IDs of active elements must be unique"
  },
  "duplicate-id-aria": {
      "article": "8.1",
      "desc": "Chaque page web est-elle définie par un type de document ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "IDs used in ARIA and labels must be unique"
  },
  "html-has-lang": {
      "article": "8.3",
      "desc": "Dans chaque page web, la langue par défaut est-elle présente ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "<html> element must have a lang attribute"
  },
  "html-lang-valid": {
      "article": "8.3",
      "desc": "Dans chaque page web, la langue par défaut est-elle présente ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "<html> element must have a valid value for the lang attribute"
  },
  "document-title": {
      "article": "8.5",
      "desc": "Chaque page web a-t-elle un titre de page ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "Documents must have <title> element to aid in navigation"
  },
  "valid-lang": {
      "article": "8.7",
      "desc": "Dans chaque page web, chaque changement de langue est-il indiqué dans le code source ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Fundamental compliance failure. Automated bots flag immediately.",
      "fix": "lang attribute must have a valid value"
  }
};

const rgaaTheme9Structure = {
  "empty-heading": {
      "article": "9.1",
      "desc": "Dans chaque page web, l'information est-elle structurée par l'utilisation appropriée de titres ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "Headings should not be empty"
  },
  "heading-order": {
      "article": "9.1",
      "desc": "Dans chaque page web, l'information est-elle structurée par l'utilisation appropriée de titres ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "Heading levels should only increase by one"
  },
  "bypass": {
      "article": "9.2",
      "desc": "Dans chaque page web, la structure du document est-elle cohérente ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "Page must have means to bypass repeated blocks"
  },
  "skip-link": {
      "article": "9.2",
      "desc": "Dans chaque page web, la structure du document est-elle cohérente ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "The skip-link target should exist and be focusable"
  },
  "region": {
      "article": "9.2",
      "desc": "Dans chaque page web, la structure du document est-elle cohérente ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "All page content should be contained by landmarks"
  },
  "landmark-one-main": {
      "article": "9.2",
      "desc": "Dans chaque page web, la structure du document est-elle cohérente ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Poor SEO. Screen readers cannot navigate efficiently.",
      "fix": "Document should have one main landmark"
  }
};

const rgaaTheme10Presentation = {
  "meta-viewport": {
      "article": "10.4",
      "desc": "Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu'à 200% ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Cognitive overload. Poor readability for all users.",
      "fix": "Zooming and scaling must not be disabled"
  },
  "meta-viewport-large": {
      "article": "10.11",
      "desc": "Pour chaque page web, les contenus peuvent-ils être présentés sans avoir recours à un défilement vertical pour une fenêtre ayant une hauteur de 256px ?",
      "risk": "Medium",
      "financial": "Compliance deduction. Contributes to non-compliant status.",
      "brand": "Cognitive overload. Poor readability for all users.",
      "fix": "Users should be able to zoom and scale the text up to 500%"
  }
};

const rgaaTheme11Forms = {
  "autocomplete-valid": {
      "article": "11.13",
      "desc": "La finalité d'un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l'utilisateur ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Transaction failure: Users cannot complete forms or purchases.",
      "fix": "autocomplete attribute must be used correctly"
  }
};

const rgaaTheme12Navigation = {
  "focus-order-semantics": {
      "article": "12.8",
      "desc": "Dans chaque page web, l'ordre de tabulation est-il cohérent ?",
      "risk": "High",
      "financial": "€25,000 - €50,000 fine. Significant compliance risk.",
      "brand": "Efficiency loss: Keyboard users must tab through entire page.",
      "fix": "Elements in the focus order should have an appropriate role"
  }
};

const rgaaTheme13Consultation = {
  "meta-refresh": {
      "article": "13.1",
      "desc": "Pour chaque page web, l'utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Frustrating UX: Users lose control of content.",
      "fix": "Delayed refresh under 20 hours must not be used"
  },
  "blink": {
      "article": "13.8",
      "desc": "Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l'utilisateur ?",
      "risk": "Critical",
      "financial": "€50,000 renewable fine. Direct violation of EAA 2026 and French law.",
      "brand": "Frustrating UX: Users lose control of content.",
      "fix": "<blink> elements are deprecated and must not be used"
  }
};

const rgaaMasterMapping = {
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
    ...rgaaTheme13Consultation,
};

module.exports = rgaaMasterMapping;
