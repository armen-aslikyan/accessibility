/**
 * RGAA 4.1 Mapping to axe-core rules
 * Only valid axe-core rule IDs are included
 * Generated: 2026-01-26T20:39:39.945Z
 */

const rgaaTheme1Images = {
  "image-alt": {
    "article": "1.1",
    "desc": "Chaque image porteuse d'information doit avoir une alternative textuelle.",
    "risk": "Critical",
    "financial": "€25,000 - €50,000 fine. Direct violation of EAA 2026.",
    "brand": "Total exclusion of visually impaired users. High SEO penalty.",
    "fix": "Add an 'alt' attribute describing the information conveyed by the image."
  },
  "role-img-alt": {
    "article": "1.2",
    "desc": "Chaque image de décoration doit être correctement ignorée par les technologies d'assistance.",
    "risk": "Medium",
    "financial": "Low direct fine, but lowers overall compliance score below 50% threshold.",
    "brand": "Annoying UX; screen readers will announce 'Unlabelled Image' repeatedly.",
    "fix": "Add alt='' or role='presentation' to the element."
  }
};

const rgaaTheme2Frames = {
  "frame-title": {
    "article": "2.1",
    "desc": "Chaque cadre (iframe) doit avoir un titre (attribut title).",
    "risk": "High",
    "financial": "€25,000 renewable fine. This is a 'binary fail' for the theme.",
    "brand": "Annoying UX: Screen readers announce 'Frame' without context. Users don't know if it's an ad, a video, or the login form.",
    "fix": "Add a title attribute to the <iframe> tag (e.g., title='Lecteur vidéo YouTube' or title='Gestion des cookies')."
  },
  "frame-title-unique": {
    "article": "2.2",
    "desc": "Le titre du cadre doit être pertinent et permettre d'en identifier le contenu.",
    "risk": "Medium",
    "financial": "Legal liability if titles are generic (e.g., title='frame1').",
    "brand": "Confusing: If there are 3 frames all named 'frame', the user is lost.",
    "fix": "Ensure the title accurately describes the content (e.g., replace 'iframe' with 'Formulaire d'inscription')."
  }
};

const rgaaTheme3Colors = {
  "link-in-text-block": {
    "article": "3.1",
    "desc": "L'information ne doit pas être donnée uniquement par la couleur.",
    "risk": "High",
    "financial": "Significant. Hard to automate fixes later; requires design system changes.",
    "brand": "Total failure for colorblind users (8% of men). If a red border is the only way you show an error, they won't see it.",
    "fix": "Add a secondary indicator, like an icon (ex: exclamation mark) or an underline for links."
  },
  "color-contrast": {
    "article": "3.2",
    "desc": "Le contraste entre la couleur du texte et son arrière-plan doit être suffisant (4.5:1 minimum).",
    "risk": "Critical",
    "financial": "€25,000 renewable fine. Most common 'low-hanging fruit' for legal bots.",
    "brand": "Directly impacts readability for everyone in sunlight or on low-quality screens. Fails the 'Inclusive Luxury' test.",
    "fix": "Darken the text color or lighten the background to hit the 4.5:1 ratio (3:1 for large text)."
  }
};

const rgaaTheme4Multimedia = {
  "video-caption": {
    "article": "4.3",
    "desc": "Chaque vidéo doit avoir des sous-titres synchronisés.",
    "risk": "Critical",
    "financial": "€25,000 - €50,000 fine. The EAA specifically targets audiovisual media in 2026.",
    "brand": "Total exclusion of the deaf community. Hurts 'Silent Viewers' (social media users).",
    "fix": "Provide a VTT or SRT file. Use AI to auto-generate and then human-verify."
  },
  "no-autoplay-audio": {
    "article": "4.10",
    "desc": "Le son ne doit pas se déclencher automatiquement (ou doit être contrôlable).",
    "risk": "High",
    "financial": "Safety issue. Auto-playing audio drowns out a blind user's screen reader.",
    "brand": "Extremely intrusive UX. High bounce rate.",
    "fix": "Disable autoplay or provide a 'Mute' button at the very top of the page."
  }
};

const rgaaTheme5Tables = {
  "td-has-header": {
    "article": "5.3",
    "desc": "Chaque cellule de titre doit être déclarée comme telle (tag <th>).",
    "risk": "Critical",
    "financial": "Direct violation of EAA 2026 for digital services.",
    "brand": "Functional block: Screen readers won't associate data with labels.",
    "fix": "Change <td> tags used for headers to <th> tags."
  },
  "scope-attr-valid": {
    "article": "5.4",
    "desc": "Les cellules de titres doivent être correctement reliées aux cellules de données.",
    "risk": "Critical",
    "financial": "Heavy fines for banking/SaaS portals.",
    "brand": "The 'Grid Trap': A user hears '450.00' but doesn't know if it's 'Balance' or 'Tax'.",
    "fix": "Use scope='col' or scope='row' on <th> tags."
  },
  "td-headers-attr": {
    "article": "5.7",
    "desc": "Pour les tableaux à plusieurs niveaux de titres, l'association doit être faite via id/headers.",
    "risk": "High",
    "financial": "Often failed in B2B SaaS platforms.",
    "brand": "Data becomes a nightmare to navigate for professionals with disabilities.",
    "fix": "Add unique IDs to <th> and use the 'headers' attribute on <td> to link them."
  }
};

const rgaaTheme6Links = {
  "link-name": {
    "article": "6.1",
    "desc": "Chaque lien doit être explicite (l'intitulé seul ou son contexte doit permettre de comprendre sa destination).",
    "risk": "Critical",
    "financial": "€25,000 - €50,000 fine. This is the #1 'low-hanging fruit' for legal bots.",
    "brand": "Total failure for screen reader users. Hearing 'Learn More' 20 times in a row provides zero information.",
    "fix": "Change generic text to descriptive text (e.g., 'Learn more about our sustainability report') or add an 'aria-label'."
  }
};

const rgaaTheme7Scripts = {
  "aria-allowed-attr": {
    "article": "7.1",
    "desc": "Chaque script doit être, si nécessaire, compatible avec les technologies d’assistance.",
    "risk": "Critical",
    "financial": "€50,000 fine (High impact). This is the 'Master Key' for app accessibility.",
    "brand": "Functional Block: If your custom React modal doesn't use the correct ARIA roles, it's invisible to blind users.",
    "fix": "Use WAI-ARIA roles and properties (e.g., role='dialog', aria-modal='true') to describe custom components."
  },
  "scrollable-region-focusable": {
    "article": "7.3",
    "desc": "Chaque script doit être contrôlable par le clavier et par tout dispositif de pointage.",
    "risk": "Critical",
    "financial": "Immediate Lawsuit Risk. Prevents motor-impaired users from using the site.",
    "brand": "The 'Keyboard Trap': A user tabs into a menu but can't tab out. They are literally stuck on your page.",
    "fix": "Ensure all interactive elements are in the tab order (tabindex='0') and handle 'Enter/Space' key events."
  }
};

const rgaaTheme8Mandatory = {
  "html-has-lang": {
    "article": "8.3",
    "desc": "La langue principale de chaque page doit être spécifiée.",
    "risk": "Critical",
    "financial": "Binary fail. Lawsuits often start here because it's so easy to prove.",
    "brand": "UX Disaster: Screen readers will read French text with an English accent (or vice versa).",
    "fix": "Add the lang attribute to the <html> tag (e.g., <html lang='fr'>)."
  },
  "html-lang-valid": {
    "article": "8.4",
    "desc": "Les changements de langue doivent être signalés.",
    "risk": "Medium",
    "financial": "Compliance deduction.",
    "brand": "Luxury companies often use English terms (e.g., 'Limited Edition'). Without lang='en', the screen reader mispronounces it.",
    "fix": "Wrap foreign words in a <span> with a lang attribute (e.g., <span lang='en'>Sale</span>)."
  },
  "meta-refresh": {
    "article": "8.5",
    "desc": "Les rafraîchissements de page automatiques doivent être évités ou contrôlables.",
    "risk": "High",
    "financial": "Security/Accessibility violation.",
    "brand": "Frustrating UX: Users lose their place if the page refreshes while they are reading.",
    "fix": "Remove <meta http-equiv='refresh'> or provide a way for users to stop it."
  },
  "document-title": {
    "article": "8.6",
    "desc": "Chaque page doit avoir un titre de page (balise <title>) pertinent.",
    "risk": "Critical",
    "financial": "Direct violation. Fails the 'Context' requirement of EAA 2026.",
    "brand": "SEO Loss: The browser tab says 'Untitled' or 'Page 1'. Users can't find your tab.",
    "fix": "Add a unique, descriptive <title> tag for every page."
  }
};

const rgaaTheme9Structure = {
  "heading-order": {
    "article": "9.1",
    "desc": "Dans chaque page web, la hiérarchie entre les titres doit être déterminée de manière cohérente.",
    "risk": "Medium",
    "financial": "Compliance deduction. Contributes to 'Non-Compliant' status.",
    "brand": "SEO Damage: Google uses headings to understand your content. Skipping from H1 to H4 confuses the crawler.",
    "fix": "Ensure headings follow a logical order (H1 > H2 > H3). Do not skip levels for styling purposes."
  },
  "region": {
    "article": "9.2",
    "desc": "La structure du document doit être cohérente (utilisation de <header>, <nav>, <main>, <footer>).",
    "risk": "High",
    "financial": "Frequent failure point in modern SPAs (Single Page Apps).",
    "brand": "UX Friction: Screen reader users use 'Landmarks' to jump to the menu or content. Without them, they must listen to the whole page.",
    "fix": "Wrap your content in appropriate HTML5 semantic tags: <header>, <nav>, <main>, <aside>, and <footer>."
  },
  "list": {
    "article": "9.3",
    "desc": "Chaque liste doit être correctement structurée (utilisation de <ul>, <ol>, <li>).",
    "risk": "Medium",
    "financial": "Minor hit to compliance percentage.",
    "brand": "Inconsistent UX: A screen reader won't announce 'List of 5 items' if you just use <div> tags with bullet icons.",
    "fix": "Use <ul> or <ol> for groups of related items, and <li> for the items themselves."
  }
};

const rgaaTheme10Presentation = {
  "hidden-content": {
    "article": "10.8",
    "desc": "Les contenus cachés ne doivent pas être vocalisés par les technologies d'assistance.",
    "risk": "Medium",
    "financial": "Annoying UX violation.",
    "brand": "Confusion: Users hear menu items from a closed mobile menu while they are reading the main page.",
    "fix": "Use 'display: none' or 'visibility: hidden' for truly hidden elements; use 'aria-hidden' as backup."
  }
};

const rgaaTheme11Forms = {
  "label": {
    "article": "11.1",
    "desc": "Chaque champ de formulaire doit avoir une étiquette (label) pertinente.",
    "risk": "Critical",
    "financial": "Highest risk. Prevents core business transactions. €50,000 fine.",
    "brand": "If a screen reader user hears 'Edit text' instead of 'Credit Card Number', you lose the sale.",
    "fix": "Link a <label> to the <input> using 'for' and 'id' attributes."
  },
  "label-title-only": {
    "article": "11.2",
    "desc": "Chaque étiquette doit être accolée au champ correspondant.",
    "risk": "Medium",
    "financial": "Compliance hit.",
    "brand": "Cognitive ease: Users shouldn't have to guess which label belongs to which box.",
    "fix": "Ensure labels are visually and programmatically near their inputs."
  },
  "input-button-name": {
    "article": "11.3",
    "desc": "Les étiquettes de champs de même nature doivent être cohérentes.",
    "risk": "Medium",
    "financial": "Deduction for 'Usability'.",
    "brand": "Professionalism: Using 'First Name' on one page and 'Prénom' on another is confusing.",
    "fix": "Standardize label text across the entire platform."
  },
  "button-name": {
    "article": "11.9",
    "desc": "Chaque bouton doit avoir un intitulé pertinent.",
    "risk": "Critical",
    "financial": "Binary failure for the 'Call to Action'.",
    "brand": "If your 'Submit' button is just an icon with no text, it's a ghost button for 20% of users.",
    "fix": "Add text or an aria-label to all <button> and <input type='submit'> elements."
  }
};

const rgaaTheme12Navigation = {
  "skip-link": {
    "article": "12.6",
    "desc": "Des liens d'évitement (ex: 'Aller au contenu') doivent être présents.",
    "risk": "High",
    "financial": "Major indicator of professional accessibility. Failing this marks you as an amateur.",
    "brand": "Efficiency: Without skip links, a keyboard user must press 'Tab' 50 times through the menu on EVERY page load to read one paragraph.",
    "fix": "Add a hidden link at the very top of the HTML: <a href='#main' class='skip-link'>Aller au contenu</a>."
  },
  "tabindex": {
    "article": "12.8",
    "desc": "L'ordre de tabulation doit être logique.",
    "risk": "Critical",
    "financial": "Can trigger 'Discriminatory Design' claims.",
    "brand": "Confusion: If the focus jumps from the header to the footer, then back to the middle, the user gets dizzy.",
    "fix": "Ensure the HTML order matches the visual order; avoid positive tabindex values (tabindex='1')."
  }
};

const rgaaTheme13Consultation = {};

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
