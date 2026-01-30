const rgaaTheme1Images = {
    // 1.1: Informative Image Alternative
    "image-alt": {
      article: "1.1",
      desc: "Chaque image porteuse d'information doit avoir une alternative textuelle.",
      risk: "Critical",
      financial: "€25,000 - €50,000 fine. Direct violation of EAA 2026.",
      brand: "Total exclusion of visually impaired users. High SEO penalty.",
      fix: "Add an 'alt' attribute describing the information conveyed by the image."
    },
    
    // 1.2: Decorative Image (Correctly Ignored)
    "role-img-alt": { // When role='img' is used on decorative elements
      article: "1.2",
      desc: "Chaque image de décoration doit être correctement ignorée par les technologies d'assistance.",
      risk: "Medium",
      financial: "Low direct fine, but lowers overall compliance score below 50% threshold.",
      brand: "Annoying UX; screen readers will announce 'Unlabelled Image' repeatedly.",
      fix: "Add alt='' or role='presentation' to the element."
    },
  
    // 1.3: Pertinence of Alternative
    // (Axe-core identifies the presence, but human/AI must check pertinence)
    "image-alt-pertinence": { 
      article: "1.3",
      desc: "L'alternative textuelle doit être pertinente.",
      risk: "High",
      financial: "Legal liability if the alt text is misleading (e.g., alt='image').",
      brand: "Frustrating experience. Users get the 'wrong' information.",
      fix: "Replace generic text like 'image.jpg' with a meaningful description."
    },
  
    // 1.4 & 1.5: CAPTCHAs
    "captcha-alternative": {
      article: "1.4",
      desc: "Les CAPTCHAs doivent avoir une alternative identifiant leur nature.",
      risk: "Critical",
      financial: "Severe. Completely blocks user registration/security flows.",
      brand: "Security gate that is impossible for some users to pass.",
      fix: "Ensure the CAPTCHA has a text label identifying it as a security check and provide an audio alternative (Crit. 1.5)."
    },
  
    // 1.6 & 1.7: Detailed Descriptions
    "image-describedby": {
      article: "1.6",
      desc: "Chaque image complexe doit avoir une description détaillée si nécessaire.",
      risk: "High",
      financial: "Common failure point for luxury/data-heavy sites.",
      brand: "Loss of complex info (charts, infographics) for disabled users.",
      fix: "Use 'aria-describedby' to link the image to a nearby text description."
    },
  
    // 1.8: Text in Images
    "image-text-alternative": {
      article: "1.8",
      desc: "L'image texte doit être remplacée par du texte stylé si possible.",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "Blurry text on zoom; bad for mobile responsiveness and SEO.",
      fix: "Replace the image with actual HTML text styled with CSS."
    },
  
    // 1.9: Image Captions (Legends)
    "figure-caption": {
      article: "1.9",
      desc: "Chaque légende doit être correctement reliée à l'image correspondante.",
      risk: "Low",
      financial: "Minor compliance hit.",
      brand: "Disconnected content; users don't know which caption goes with which photo.",
      fix: "Wrap image and text in a <figure> and <figcaption> tag structure."
    }
  };
  const rgaaTheme2Frames = {
    // 2.1: Frame Title Presence
    "frame-title": {
      article: "2.1",
      desc: "Chaque cadre (iframe) doit avoir un titre (attribut title).",
      risk: "High",
      financial: "€25,000 renewable fine. This is a 'binary fail' for the theme.",
      brand: "Annoying UX: Screen readers announce 'Frame' without context. Users don't know if it's an ad, a video, or the login form.",
      fix: "Add a title attribute to the <iframe> tag (e.g., title='Lecteur vidéo YouTube' or title='Gestion des cookies')."
    },
  
    // 2.2: Relevance of Frame Title
    "frame-title-unique": {
      article: "2.2",
      desc: "Le titre du cadre doit être pertinent et permettre d'en identifier le contenu.",
      risk: "Medium",
      financial: "Legal liability if titles are generic (e.g., title='frame1').",
      brand: "Confusing: If there are 3 frames all named 'frame', the user is lost.",
      fix: "Ensure the title accurately describes the content (e.g., replace 'iframe' with 'Formulaire d'inscription')."
    }
  };
  const rgaaTheme3Colors = {
    // 3.1: Information via Color Alone
    "link-in-text-block": { // Related to Axe ID for links
      article: "3.1",
      desc: "L'information ne doit pas être donnée uniquement par la couleur.",
      risk: "High",
      financial: "Significant. Hard to automate fixes later; requires design system changes.",
      brand: "Total failure for colorblind users (8% of men). If a red border is the only way you show an error, they won't see it.",
      fix: "Add a secondary indicator, like an icon (ex: exclamation mark) or an underline for links."
    },
  
    // 3.2: Text Contrast
    "color-contrast": {
      article: "3.2",
      desc: "Le contraste entre la couleur du texte et son arrière-plan doit être suffisant (4.5:1 minimum).",
      risk: "Critical",
      financial: "€25,000 renewable fine. Most common 'low-hanging fruit' for legal bots.",
      brand: "Directly impacts readability for everyone in sunlight or on low-quality screens. Fails the 'Inclusive Luxury' test.",
      fix: "Darken the text color or lighten the background to hit the 4.5:1 ratio (3:1 for large text)."
    },
  
    // 3.3: UI Component & Graphical Contrast
    "color-contrast-enhanced": { // Often maps to Axe's graphical contrast rules
      article: "3.3",
      desc: "Les composants d'interface (boutons, bordures de champs) doivent être suffisamment contrastés (3:1 minimum).",
      risk: "High",
      financial: "Required for 'AA' compliance under EAA 2026.",
      brand: "If a user can't see the outline of your 'Search' bar, they won't use it. Impacts 'Usability' metrics.",
      fix: "Ensure button borders and state indicators (focus/hover) have a 3:1 contrast against the background."
    }
  };
  const rgaaTheme4Multimedia = {
    // 4.1 & 4.3: Subtitles and Transcripts
    "video-caption": {
      article: "4.3",
      desc: "Chaque vidéo doit avoir des sous-titres synchronisés.",
      risk: "Critical",
      financial: "€25,000 - €50,000 fine. The EAA specifically targets audiovisual media in 2026.",
      brand: "Total exclusion of the deaf community. Hurts 'Silent Viewers' (social media users).",
      fix: "Provide a VTT or SRT file. Use AI to auto-generate and then human-verify."
    },
  
    // 4.5 & 4.6: Audio Description
    "video-description": {
      article: "4.5",
      desc: "Les vidéos informatives doivent avoir une audiodescription pour les non-voyants.",
      risk: "High",
      financial: "Frequent cause for 'Partial Compliance' status (60-70% trap).",
      brand: "Luxury brands rely on visual storytelling; without AD, blind users miss the 'Brand Story'.",
      fix: "Provide a secondary audio track describing the visual actions on screen."
    },
  
    // 4.7: Media Identification
    "media-label": {
      article: "4.7",
      desc: "Chaque média doit être identifiable par un titre ou un nom clair.",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "UX Friction: Users won't click 'Video_123.mp4'. They need to know what they are playing.",
      fix: "Add a clear heading or aria-label preceding the video player."
    },
  
    // 4.10: Audio Control (No Auto-Play)
    "no-autoplay-audio": {
      article: "4.10",
      desc: "Le son ne doit pas se déclencher automatiquement (ou doit être contrôlable).",
      risk: "High",
      financial: "Safety issue. Auto-playing audio drowns out a blind user's screen reader.",
      brand: "Extremely intrusive UX. High bounce rate.",
      fix: "Disable autoplay or provide a 'Mute' button at the very top of the page."
    },
  
    // 4.11: Player Controls
    "video-controls": {
      article: "4.11",
      desc: "Le lecteur média doit être entièrement contrôlable au clavier et à la souris.",
      risk: "Critical",
      financial: "Binary fail for the entire multimedia theme.",
      brand: "Functional block. If a user can't hit 'Pause' or 'Subtitles' via keyboard, the site is broken.",
      fix: "Ensure the 'Play/Pause', 'Volume', and 'CC' buttons are reachable via Tab key."
    }
  };
  const rgaaTheme5Tables = {
    // 5.1: Table Description/Summary
    "table-caption": {
      article: "5.1",
      desc: "Chaque tableau de données doit avoir un résumé ou un titre (caption).",
      risk: "Medium",
      financial: "Compliance deduction. Standard part of the 'Non-Compliant' binary fail.",
      brand: "UX Failure: Blind users enter a table without knowing what the data represents.",
      fix: "Add a <caption> element inside the <table> tag."
    },
  
    // 5.2: Complex Table Description
    "table-description": {
      article: "5.2",
      desc: "Pour les tableaux complexes, un résumé de la structure doit être disponible.",
      risk: "High",
      financial: "Targeted in Fintech audits (dashboards/reports).",
      brand: "Complex data (e.g., banking statements) becomes an unusable 'wall of numbers'.",
      fix: "Use 'aria-describedby' or a summary attribute to explain how to read the complex headers."
    },
  
    // 5.3: Table Headers (The 'th' rule)
    "td-has-header": {
      article: "5.3",
      desc: "Chaque cellule de titre doit être déclarée comme telle (tag <th>).",
      risk: "Critical",
      financial: "Direct violation of EAA 2026 for digital services.",
      brand: "Functional block: Screen readers won't associate data with labels.",
      fix: "Change <td> tags used for headers to <th> tags."
    },
  
    // 5.4 & 5.5: Headers/Cells Association
    "scope-attr-valid": {
      article: "5.4",
      desc: "Les cellules de titres doivent être correctement reliées aux cellules de données.",
      risk: "Critical",
      financial: "Heavy fines for banking/SaaS portals.",
      brand: "The 'Grid Trap': A user hears '450.00' but doesn't know if it's 'Balance' or 'Tax'.",
      fix: "Use scope='col' or scope='row' on <th> tags."
    },
  
    // 5.6: Data Table Titles
    "table-has-title": {
      article: "5.6",
      desc: "Chaque tableau de données doit avoir un titre pertinent.",
      risk: "Low",
      financial: "Minor compliance hit.",
      brand: "Bad document structure; hurts 'skimmability' for screen readers.",
      fix: "Ensure the <caption> is not empty and is descriptive."
    },
  
    // 5.7: Table IDs/Headers (For very complex tables)
    "td-headers-attr": {
      article: "5.7",
      desc: "Pour les tableaux à plusieurs niveaux de titres, l'association doit être faite via id/headers.",
      risk: "High",
      financial: "Often failed in B2B SaaS platforms.",
      brand: "Data becomes a nightmare to navigate for professionals with disabilities.",
      fix: "Add unique IDs to <th> and use the 'headers' attribute on <td> to link them."
    },
  
    // 5.8: Layout Tables (Presentation)
    "layout-table-role": {
      article: "5.8",
      desc: "Les tableaux utilisés pour la mise en forme ne doivent pas utiliser de balises de données.",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "Screen readers will announce 'Table with 5 rows' for a simple layout, wasting time.",
      fix: "Add role='presentation' to the <table> tag if it's used for layout, not data."
    }
  };
  const rgaaTheme6Links = {
    // 6.1: Explicit Link Purpose
    "link-name": {
      article: "6.1",
      desc: "Chaque lien doit être explicite (l'intitulé seul ou son contexte doit permettre de comprendre sa destination).",
      risk: "Critical",
      financial: "€25,000 - €50,000 fine. This is the #1 'low-hanging fruit' for legal bots.",
      brand: "Total failure for screen reader users. Hearing 'Learn More' 20 times in a row provides zero information.",
      fix: "Change generic text to descriptive text (e.g., 'Learn more about our sustainability report') or add an 'aria-label'."
    },
  
    // 6.2: Link Label (Accessible Name)
    "link-name-aria": {
      article: "6.2",
      desc: "Dans chaque page web, chaque lien a-t-il un intitulé ?",
      risk: "Critical",
      financial: "Immediate non-compliance trigger. Binary failure.",
      brand: "If a link is just an icon (like a social media logo) without a label, it is invisible to assistive technology.",
      fix: "Add an 'aria-label' to icon-only links (e.g., aria-label='Suivez-nous sur Instagram')."
    },
  
    // 6.3: (Obsolete/Combined in 4.1 but checked via context)
    // 6.4: Same label, different destinations (User confusion)
    "link-name-consistent": {
      article: "6.4",
      desc: "Pour chaque page web, les liens ayant le même intitulé doivent avoir la même destination.",
      risk: "High",
      financial: "Compliance deduction based on 'User Error' risk.",
      brand: "Extreme frustration. If two 'Register' links go to different forms, the user loses trust.",
      fix: "Ensure identical link text always leads to the same URL, or differentiate the labels."
    },
  
    // 6.5: Link to new window/tab identification
    "link-external": {
      article: "6.5",
      desc: "Chaque lien qui ouvre une nouvelle fenêtre doit en avertir l'utilisateur.",
      risk: "Medium",
      financial: "Minor hit to compliance percentage.",
      brand: "Confusing UX: Users (especially those with cognitive disabilities) get lost when the browser suddenly switches tabs.",
      fix: "Add a warning to the link text (e.g., 'Download PDF (nouvelle fenêtre)') or use an icon with an aria-label."
    }
  };
  const rgaaTheme7Scripts = {
    // 7.1: Compatibility with Assistive Tech
    "aria-allowed-attr": { // Maps to several Axe rules regarding ARIA
      article: "7.1",
      desc: "Chaque script doit être, si nécessaire, compatible avec les technologies d’assistance.",
      risk: "Critical",
      financial: "€50,000 fine (High impact). This is the 'Master Key' for app accessibility.",
      brand: "Functional Block: If your custom React modal doesn't use the correct ARIA roles, it's invisible to blind users.",
      fix: "Use WAI-ARIA roles and properties (e.g., role='dialog', aria-modal='true') to describe custom components."
    },
  
    // 7.2: Script Alternatives (Graceful Degradation)
    "noscript": {
      article: "7.2",
      desc: "Chaque script doit avoir une alternative si nécessaire.",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "Reliability: If your script fails to load or is blocked, can the user still perform the core action?",
      fix: "Provide a <noscript> alternative or ensure core content is rendered server-side (SSR)."
    },
  
    // 7.3: Keyboard & Pointing Device Control
    "scrollable-region-focusable": { // One of many Axe triggers for 7.3
      article: "7.3",
      desc: "Chaque script doit être contrôlable par le clavier et par tout dispositif de pointage.",
      risk: "Critical",
      financial: "Immediate Lawsuit Risk. Prevents motor-impaired users from using the site.",
      brand: "The 'Keyboard Trap': A user tabs into a menu but can't tab out. They are literally stuck on your page.",
      fix: "Ensure all interactive elements are in the tab order (tabindex='0') and handle 'Enter/Space' key events."
    },
  
    // 7.4: Notification of Context Changes
    "aria-live-explicit": {
      article: "7.4",
      desc: "Pour chaque script qui initie un changement de contexte, l’utilisateur doit en être averti.",
      risk: "High",
      financial: "Frequent cause for 'Partial' status (60-70%).",
      brand: "Confusion: If a search results list updates via AJAX but the screen reader doesn't say anything, the user thinks it's broken.",
      fix: "Use 'aria-live' regions (polite or assertive) to announce dynamic content updates."
    },
  
    // 7.5: Status Messages
    "aria-status-messages": {
      article: "7.5",
      desc: "Les messages de statut doivent être correctement rendus par les technologies d'assistance.",
      risk: "High",
      financial: "Critical for E-commerce (Checkout errors/success messages).",
      brand: "Blind users might miss a 'Payment Successful' or 'Out of Stock' message if it's not coded as a status.",
      fix: "Use role='status' or role='alert' for transient feedback messages."
    }
  };
  const rgaaTheme8Mandatory = {
    // 8.1: Doctype Presence
    "doctype": {
      article: "8.1",
      desc: "Chaque page web doit avoir un type de document (doctype) valide.",
      risk: "Medium",
      financial: "Immediate compliance hit. Affects browser rendering (Quirks Mode).",
      brand: "Stability: Pages might look broken on older or mobile browsers.",
      fix: "Add <!DOCTYPE html> to the very top of your HTML file."
    },
  
    // 8.2: Valid Code (W3C)
    "html-xml-valid": {
      article: "8.2",
      desc: "Le code source doit être valide selon le type de document spécifié.",
      risk: "High",
      financial: "Frequent cause for legal disputes regarding 'Quality of Service'.",
      brand: "Performance: Invalid HTML slows down the browser's parser.",
      fix: "Fix unclosed tags, duplicate IDs, and nested elements that don't belong together."
    },
  
    // 8.3: Language Declaration
    "html-has-lang": {
      article: "8.3",
      desc: "La langue principale de chaque page doit être spécifiée.",
      risk: "Critical",
      financial: "Binary fail. Lawsuits often start here because it's so easy to prove.",
      brand: "UX Disaster: Screen readers will read French text with an English accent (or vice versa).",
      fix: "Add the lang attribute to the <html> tag (e.g., <html lang='fr'>)."
    },
  
    // 8.4: Language Changes
    "html-lang-valid": {
      article: "8.4",
      desc: "Les changements de langue doivent être signalés.",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "Luxury companies often use English terms (e.g., 'Limited Edition'). Without lang='en', the screen reader mispronounces it.",
      fix: "Wrap foreign words in a <span> with a lang attribute (e.g., <span lang='en'>Sale</span>)."
    },
  
    // 8.5: Meta Refresh/Redirection
    "meta-refresh": {
      article: "8.5",
      desc: "Les rafraîchissements de page automatiques doivent être évités ou contrôlables.",
      risk: "High",
      financial: "Security/Accessibility violation.",
      brand: "Frustrating UX: Users lose their place if the page refreshes while they are reading.",
      fix: "Remove <meta http-equiv='refresh'> or provide a way for users to stop it."
    },
  
    // 8.6: Page Title
    "document-title": {
      article: "8.6",
      desc: "Chaque page doit avoir un titre de page (balise <title>) pertinent.",
      risk: "Critical",
      financial: "Direct violation. Fails the 'Context' requirement of EAA 2026.",
      brand: "SEO Loss: The browser tab says 'Untitled' or 'Page 1'. Users can't find your tab.",
      fix: "Add a unique, descriptive <title> tag for every page."
    },
  
    // 8.7 & 8.8: Language Direction (RTL/LTR)
    "document-dir": {
      article: "8.8",
      desc: "Le sens de lecture doit être spécifié si nécessaire.",
      risk: "Low",
      financial: "Compliance hit for multi-lingual sites.",
      brand: "Total layout breakage for Arabic or Hebrew users.",
      fix: "Add the dir='rtl' attribute where the reading direction changes."
    },
  
    // 8.9: Avoidance of Forbidden Tags
    "no-deprecated-tags": {
      article: "8.9",
      desc: "La page ne doit pas contenir de balises HTML purement présentatives (ex: <font>, <center>).",
      risk: "Medium",
      financial: "Sign of 'Legacy Debt'. Fails modern audit standards.",
      brand: "Maintenance: Harder to update the site's design via CSS.",
      fix: "Remove deprecated tags and use CSS for styling."
    },
  
    // 8.10: Logical Order (The 'Reading' Order)
    "logical-order": {
      article: "8.10",
      desc: "L'ordre de lecture doit être logique et cohérent.",
      risk: "High",
      financial: "Can be used to prove 'Discriminatory Design' in court.",
      brand: "Confusion: If the CSS makes the sidebar appear first visually but it's last in code, the user gets lost.",
      fix: "Ensure the HTML source code follows the visual flow of information."
    }
  };
  const rgaaTheme9Structure = {
    // 9.1: Logical Heading Hierarchy
    "heading-order": {
      article: "9.1",
      desc: "Dans chaque page web, la hiérarchie entre les titres doit être déterminée de manière cohérente.",
      risk: "Medium",
      financial: "Compliance deduction. Contributes to 'Non-Compliant' status.",
      brand: "SEO Damage: Google uses headings to understand your content. Skipping from H1 to H4 confuses the crawler.",
      fix: "Ensure headings follow a logical order (H1 > H2 > H3). Do not skip levels for styling purposes."
    },
  
    // 9.2: Structure via Semantic Elements
    "region": { // Maps to Axe's check for landmarks/main/nav
      article: "9.2",
      desc: "La structure du document doit être cohérente (utilisation de <header>, <nav>, <main>, <footer>).",
      risk: "High",
      financial: "Frequent failure point in modern SPAs (Single Page Apps).",
      brand: "UX Friction: Screen reader users use 'Landmarks' to jump to the menu or content. Without them, they must listen to the whole page.",
      fix: "Wrap your content in appropriate HTML5 semantic tags: <header>, <nav>, <main>, <aside>, and <footer>."
    },
  
    // 9.3: List Structuring
    "list": {
      article: "9.3",
      desc: "Chaque liste doit être correctement structurée (utilisation de <ul>, <ol>, <li>).",
      risk: "Medium",
      financial: "Minor hit to compliance percentage.",
      brand: "Inconsistent UX: A screen reader won't announce 'List of 5 items' if you just use <div> tags with bullet icons.",
      fix: "Use <ul> or <ol> for groups of related items, and <li> for the items themselves."
    },
  
    // 9.4: Quotation Markup
    "blockquote": {
      article: "9.4",
      desc: "Chaque citation doit être correctement identifiée (balise <blockquote> ou <q>).",
      risk: "Low",
      financial: "Compliance deduction.",
      brand: "Semantic clarity: Assistive tech can signal to the user that they are hearing a quote from another source.",
      fix: "Wrap quotes in <blockquote> and provide a <cite> attribute or tag if the source is known."
    }
  };
  const rgaaTheme10Presentation = {
    // 10.1: CSS for Presentation
    "style-tag": {
      article: "10.1",
      desc: "Les balises de présentation ne doivent pas être utilisées ; le contenu doit être séparé de la mise en forme (CSS).",
      risk: "Medium",
      financial: "Compliance deduction.",
      brand: "Code Debt: Makes the site harder to maintain and slower to load.",
      fix: "Remove tags like <font> or <center> and move styling to an external CSS file."
    },
  
    // 10.2: Content remains visible when CSS is disabled
    "css-display-none": { 
      article: "10.2",
      desc: "Le contenu doit rester compréhensible lorsque les feuilles de style sont désactivées.",
      risk: "High",
      financial: "Common failure point in complex JavaScript 'Single Page Apps'.",
      brand: "Reliability: Ensures that if the CSS fails to load on a slow connection, the user can still read the site.",
      fix: "Ensure logical HTML order so content makes sense without visual styling."
    },
  
    // 10.3: Content remains readable when zoomed to 200%
    "zoom-200": {
      article: "10.3",
      desc: "La page doit rester utilisable et lisible lorsqu'elle est zoomée à 200%.",
      risk: "Critical",
      financial: "Target for lawsuits by elderly user advocacy groups.",
      brand: "Loss of Sales: If your 'Buy' button disappears or overlaps when zoomed, the sale is lost.",
      fix: "Use responsive design (Flexbox/Grid) and avoid fixed heights (px) for containers."
    },
  
    // 10.4: Text Spacing (Reflow)
    "text-spacing": {
      article: "10.4",
      desc: "Le texte doit pouvoir être espacé sans perte de contenu ou de fonctionnalité.",
      risk: "Medium",
      financial: "Required for EAA 2026 'AA' status.",
      brand: "Readability: Essential for users with dyslexia who use custom font-spacing tools.",
      fix: "Avoid fixed-width containers that cause text to 'cutoff' when padding/margin is increased."
    },
  
    // 10.5: CSS Background Images (Information)
    "background-image-info": {
      article: "10.5",
      desc: "L'information ne doit pas être donnée uniquement par des images de fond CSS.",
      risk: "High",
      financial: "Severe failure; content is invisible to screen readers.",
      brand: "SEO Loss: Images in CSS are not indexed by Google or seen by assistive tech.",
      fix: "If the image conveys info, use a <img> tag with alt text instead of background-image."
    },
  
    // 10.6 & 10.7: Focus Indicators
    "focus-visible": {
      article: "10.7",
      desc: "Chaque élément recevant le focus doit avoir un indicateur visuel de focus.",
      risk: "Critical",
      financial: "Immediate Lawsuit Risk. Prevents keyboard-only users from navigating.",
      brand: "The 'Invisible Mouse': Imagine moving your mouse but not seeing the cursor. That is what a missing focus ring feels like.",
      fix: "Do not use 'outline: none' in CSS unless you provide a clear alternative focus style."
    },
  
    // 10.8: Hidden Content Visibility
    "hidden-content": {
      article: "10.8",
      desc: "Les contenus cachés ne doivent pas être vocalisés par les technologies d'assistance.",
      risk: "Medium",
      financial: "Annoying UX violation.",
      brand: "Confusion: Users hear menu items from a closed mobile menu while they are reading the main page.",
      fix: "Use 'display: none' or 'visibility: hidden' for truly hidden elements; use 'aria-hidden' as backup."
    },
  
    // 10.9 & 10.10: Color Contrast for Form Fields
    "form-contrast": {
      article: "10.10",
      desc: "Les bordures des champs de formulaire doivent avoir un contraste suffisant (3:1).",
      risk: "High",
      financial: "Accessibility deduction.",
      brand: "UX Friction: If a user can't see the box where they are supposed to type, they leave.",
      fix: "Darken input borders to meet the 3:1 contrast ratio."
    }
  };
  const rgaaTheme11Forms = {
    // 11.1: Control Labels
    "label": {
      article: "11.1",
      desc: "Chaque champ de formulaire doit avoir une étiquette (label) pertinente.",
      risk: "Critical",
      financial: "Highest risk. Prevents core business transactions. €50,000 fine.",
      brand: "If a screen reader user hears 'Edit text' instead of 'Credit Card Number', you lose the sale.",
      fix: "Link a <label> to the <input> using 'for' and 'id' attributes."
    },
  
    // 11.2: Label Association (Context)
    "label-title-only": {
      article: "11.2",
      desc: "Chaque étiquette doit être accolée au champ correspondant.",
      risk: "Medium",
      financial: "Compliance hit.",
      brand: "Cognitive ease: Users shouldn't have to guess which label belongs to which box.",
      fix: "Ensure labels are visually and programmatically near their inputs."
    },
  
    // 11.3: Labels for same-type inputs
    "input-button-name": {
      article: "11.3",
      desc: "Les étiquettes de champs de même nature doivent être cohérentes.",
      risk: "Medium",
      financial: "Deduction for 'Usability'.",
      brand: "Professionalism: Using 'First Name' on one page and 'Prénom' on another is confusing.",
      fix: "Standardize label text across the entire platform."
    },
  
    // 11.4: Label Relevance
    "aria-label": {
      article: "11.4",
      desc: "L'étiquette doit être pertinente (compréhensible).",
      risk: "High",
      financial: "Legal liability for 'ambiguous' services.",
      brand: "Avoids user errors. A label like 'Field 1' is useless.",
      fix: "Provide clear, concise text for all labels and aria-labels."
    },
  
    // 11.5 to 11.8: Grouping Fields (Fieldsets)
    "fieldset": {
      article: "11.5",
      desc: "Les champs de même nature doivent être regroupés (utilisation de <fieldset> et <legend>).",
      risk: "High",
      financial: "Required for complex checkouts/surveys.",
      brand: "Context: If you have two sets of 'City' inputs (Billing vs Shipping), a blind user needs the group name to know which is which.",
      fix: "Wrap related inputs in a <fieldset> with a <legend>."
    },
  
    // 11.9: Button Labels
    "button-name": {
      article: "11.9",
      desc: "Chaque bouton doit avoir un intitulé pertinent.",
      risk: "Critical",
      financial: "Binary failure for the 'Call to Action'.",
      brand: "If your 'Submit' button is just an icon with no text, it's a ghost button for 20% of users.",
      fix: "Add text or an aria-label to all <button> and <input type='submit'> elements."
    },
  
    // 11.10: Input Suggestions (Autocomplete)
    "autocomplete-appropriate": {
      article: "11.10",
      desc: "Le champ doit proposer des suggestions de saisie (attribut autocomplete).",
      risk: "Medium",
      financial: "Required under EAA 2026 for personal data fields.",
      brand: "Speed: Users love when their address/name auto-fills. This reduces 'form fatigue'.",
      fix: "Add appropriate autocomplete values (e.g., autocomplete='email', autocomplete='tel')."
    },
  
    // 11.11: Error Identification & Feedback
    "aria-errormessage": {
      article: "11.11",
      desc: "Les messages d'erreur doivent être reliés aux champs correspondants.",
      risk: "Critical",
      financial: "Major litigation point. If a user can't fix an error, they are blocked.",
      brand: "Trust: Users get frustrated if the site says 'Error' but doesn't say where or why.",
      fix: "Use 'aria-describedby' to link the error text to the invalid input."
    },
  
    // 11.12: Error Suggestions
    "error-suggestion": {
      article: "11.12",
      desc: "Le site doit proposer des suggestions pour corriger les erreurs de saisie.",
      risk: "High",
      financial: "Compliance requirement for 'User Assistance'.",
      brand: "Helpfulness: Instead of 'Invalid Date', say 'Use the format DD/MM/YYYY'.",
      fix: "Provide specific instructions on how to resolve the error."
    },
  
    // 11.13: Data Persistence (Legal/Financial Safeguard)
    "form-persistence": {
      article: "11.13",
      desc: "Pour les données sensibles (financières, juridiques), l'utilisateur doit pouvoir modifier ou annuler sa saisie.",
      risk: "Critical",
      financial: "Consumer Protection Law overlap. High lawsuit risk.",
      brand: "Safety: Essential for banking and luxury e-commerce to prevent accidental purchases.",
      fix: "Provide a 'Review' page before final submission or a 30-minute window to cancel."
    }
  };
  const rgaaTheme12Navigation = {
    // 12.1: Two navigation methods (Search + Sitemap)
    "navigation-methods": {
      article: "12.1",
      desc: "Le site doit proposer au moins deux méthodes de navigation (menu, moteur de recherche, ou plan du site).",
      risk: "Medium",
      financial: "Frequent deduction in administrative audits.",
      brand: "Findability: Users who can't find what they want in a menu will leave if there's no search bar.",
      fix: "Ensure your site has both a Search bar and a Sitemap (Plan du site)."
    },
  
    // 12.3: Sitemap relevance
    "sitemap-link": {
      article: "12.3",
      desc: "Le plan du site doit être pertinent et accessible.",
      risk: "Low",
      financial: "Minor compliance hit.",
      brand: "SEO: A good sitemap helps Google index all your pages correctly.",
      fix: "Create a dedicated page listing all main sections of the site."
    },
  
    // 12.6: Skip Links (The 'Keyboard Shortcut')
    "skip-link": {
      article: "12.6",
      desc: "Des liens d'évitement (ex: 'Aller au contenu') doivent être présents.",
      risk: "High",
      financial: "Major indicator of professional accessibility. Failing this marks you as an amateur.",
      brand: "Efficiency: Without skip links, a keyboard user must press 'Tab' 50 times through the menu on EVERY page load to read one paragraph.",
      fix: "Add a hidden link at the very top of the HTML: <a href='#main' class='skip-link'>Aller au contenu</a>."
    },
  
    // 12.8: Focus Order (Tab Order)
    "tabindex": {
      article: "12.8",
      desc: "L'ordre de tabulation doit être logique.",
      risk: "Critical",
      financial: "Can trigger 'Discriminatory Design' claims.",
      brand: "Confusion: If the focus jumps from the header to the footer, then back to the middle, the user gets dizzy.",
      fix: "Ensure the HTML order matches the visual order; avoid positive tabindex values (tabindex='1')."
    },
  
    // 12.11: Visual Focus Style (re-emphasis)
    "focus-indicator": {
      article: "12.11",
      desc: "Le focus doit être visible sur chaque élément.",
      risk: "Critical",
      financial: "Immediate Lawsuit Risk.",
      brand: "Usability: The only way a keyboard user knows where they 'are'.",
      fix: "Never use outline:0 in CSS."
    }
  };
  const rgaaTheme13Consultation = {
    // 13.1: Control over Time Limits
    "meta-refresh-delay": {
      article: "13.1",
      desc: "L'utilisateur doit pouvoir contrôler les limites de temps (ex: déconnexion automatique).",
      risk: "High",
      financial: "Critical for Banking and Public Services.",
      brand: "Security vs UX: Users with cognitive or motor disabilities need more time to finish a task without being kicked out.",
      fix: "Provide a warning before a timeout and allow users to extend the session."
    },
  
    // 13.3: Moving/Auto-updating Content (Carousels)
    "pause-autoplay": {
      article: "13.3",
      desc: "L'utilisateur doit pouvoir arrêter ou mettre en pause tout contenu en mouvement ou clignotant.",
      risk: "Critical",
      financial: "Safety violation (Seizure risk/Distraction).",
      brand: "Inclusion: Moving text/backgrounds make it impossible for users with ADHD or low vision to focus on the content.",
      fix: "Add a 'Pause' button to carousels and video backgrounds."
    },
  
    // 13.5: No Flashing Content
    "no-flashing-content": {
      article: "13.5",
      desc: "Le contenu ne doit pas provoquer de crises d'épilepsie (pas plus de 3 flashs par seconde).",
      risk: "Critical",
      financial: "High liability; physical safety issue.",
      brand: "Physical Safety: A fast-flashing 'Sale' banner can trigger medical emergencies.",
      fix: "Remove or slow down flashing animations."
    },
  
    // 13.7: Orientation (Portrait vs Landscape)
    "screen-orientation": {
      article: "13.7",
      desc: "Le contenu ne doit pas être verrouillé sur une seule orientation d'écran (portrait ou paysage).",
      risk: "Medium",
      financial: "Frequent mobile-audit failure.",
      brand: "Accessibility: Users with wheelchairs who have tablets mounted in a fixed position cannot rotate their devices.",
      fix: "Ensure CSS allows the site to reflow in both orientations."
    },
  
    // 13.8: Input Purpose (Visual Labels)
    "input-purpose": {
      article: "13.8",
      desc: "Les composants d'interface doivent être facilement identifiables.",
      risk: "High",
      financial: "Compliance hit.",
      brand: "Cognitive Load: If a button doesn't look like a button, users won't click it.",
      fix: "Use standard UI patterns and clear visual affordances."
    },
  
    // 13.9: Document Download Information
    "download-info": {
      article: "13.9",
      desc: "Chaque document en téléchargement doit être accessible et indiquer son poids/format.",
      risk: "Medium",
      financial: "Standard part of French Public Sector audits.",
      brand: "Transparency: Users on mobile data need to know if they are about to download a 50MB PDF.",
      fix: "Add text like '(PDF, 2Mo)' to the download link."
    }
  };
  const waiAriaPatterns = {
    // 1. MODALS (The most sued component in 2026)
    "aria-modal-dialog": {
      pattern: "Dialog (Modal)",
      requirement: "Focus trap + Escape key + aria-modal='true'",
      risk: "Critical: Screen readers stay stuck on the page 'behind' the modal.",
      fix: "Use a focus-trap library and ensure role='dialog' is on the container."
    },
  
    // 2. TABS (FINTECH / SAAS favorite)
    "aria-tabs": {
      pattern: "Tabs",
      requirement: "role='tablist', role='tab', role='tabpanel'",
      risk: "High: User hears 'Link' instead of 'Tab', doesn't know there's hidden content.",
      fix: "Manage focus so arrow keys switch between tabs (W3C standard)."
    },
  
    // 3. ACCORDIONS (FAQ sections)
    "aria-expanded": {
      pattern: "Accordion",
      requirement: "aria-expanded='true/false' + aria-controls",
      risk: "Medium: User clicks but doesn't know if the section opened or closed.",
      fix: "Toggle the aria-expanded attribute on the button via JavaScript."
    },
  
    // 4. COMBOBOXES (Search Autocomplete)
    "aria-combobox": {
      pattern: "Combobox / Autocomplete",
      requirement: "aria-autocomplete + aria-controls + aria-expanded",
      risk: "Critical: Users type in your search bar but never hear the results list.",
      fix: "Use aria-live to announce how many results were found."
    },
  
    // 5. TOOLTIPS
    "aria-tooltip": {
      pattern: "Tooltip",
      requirement: "role='tooltip' + aria-describedby",
      risk: "Low/Medium: Vital info (like 'CVV code') is invisible to assistive tech.",
      fix: "Trigger tooltip on focus, not just on hover."
    }
  };
const rgaaMasterMapping = {
    // --- THEME 1: IMAGES ---
    ...rgaaTheme1Images,
    // --- THEME 2: FRAMES ---
...rgaaTheme2Frames,
    // --- THEME 3: COLORS ---
    ...rgaaTheme3Colors,
    // --- THEME 4: MULTIMEDIA ---
    ...rgaaTheme4Multimedia,
    // --- THEME 5: TABLES ---
    ...rgaaTheme5Tables,
    // --- THEME 6: LINKS ---
    ...rgaaTheme6Links,
    // --- THEME 7: SCRIPTS ---
    ...rgaaTheme7Scripts,
    // --- THEME 8: MANDATORY ELEMENTS ---
    ...rgaaTheme8Mandatory,
    // --- THEME 9: STRUCTURE ---
    ...rgaaTheme9Structure,
    // --- THEME 10: ARIA ---
    ...rgaaTheme10Presentation,
    // --- THEME 11: FORMS ---
    ...rgaaTheme11Forms,
    // --- THEME 12: NAVIGATION ---
    ...rgaaTheme12Navigation,
    // --- THEME 13: CONSULTATION ---
    ...rgaaTheme13Consultation,
    // --- WAIA PATTERNS ---
    ...waiAriaPatterns,
};

module.exports = rgaaMasterMapping;