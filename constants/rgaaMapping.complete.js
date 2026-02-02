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
    tests: ["1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5", "1.4.6", "1.4.7"],
    prompt: `Analyze the HTML for CAPTCHA or test images. For each CAPTCHA/test image found:

1. Check if an alternative text exists (via alt, aria-label, aria-labelledby, or title attribute)
2. Verify the alternative text identifies that this is a CAPTCHA or visual challenge
3. Verify the alternative text explains the PURPOSE (e.g., "Security verification image - type the characters shown" or "Visual puzzle to verify you are human")
4. Ensure the alt text does NOT reveal the CAPTCHA answer

Report:
- PASS: If no CAPTCHAs exist, OR all CAPTCHAs have alt text that identifies their nature and function without revealing the answer
- FAIL: If any CAPTCHA has missing alt text, OR alt text doesn't identify it as a CAPTCHA, OR alt text reveals the answer

List each CAPTCHA found with its alt text and your assessment.`
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
    tests: ["1.5.1", "1.5.2"],
    prompt: `Analyze the HTML for CAPTCHA elements. For each CAPTCHA found, check for alternative access methods:

1. Look for audio CAPTCHA options (buttons/links to play audio challenge)
2. Look for text-based alternatives (simple math questions, logic puzzles)
3. Look for accessibility bypass options (links to contact support, alternative verification methods)
4. Check if there's a refresh/reload option to get a new CAPTCHA

Report:
- PASS: If no CAPTCHAs exist, OR each CAPTCHA provides at least one accessible alternative (audio version, text alternative, or bypass mechanism)
- FAIL: If any CAPTCHA exists without an alternative access method for users who cannot see the visual challenge

List each CAPTCHA found and describe what alternative access methods are available (or missing).`
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
    tests: ["1.6.1", "1.6.2", "1.6.3", "1.6.4", "1.6.5", "1.6.6", "1.6.7", "1.6.8", "1.6.9", "1.6.10"],
    prompt: `Analyze the HTML for complex informative images that require detailed descriptions. These include:
- Charts, graphs, and data visualizations
- Infographics
- Complex diagrams or flowcharts
- Maps with meaningful data
- Technical illustrations
- Images conveying multiple pieces of information

For each complex image found:
1. Check if a detailed description exists via:
   - aria-describedby pointing to descriptive text
   - Adjacent visible text explaining the image in detail
   - A link to a page with full description
   - longdesc attribute (deprecated but valid)
   - figcaption with comprehensive description
2. The alt text alone is NOT sufficient for complex images - there must be extended description

Report:
- PASS: If no complex informative images exist, OR all complex images have detailed descriptions accessible to screen reader users
- FAIL: If any complex image (chart, graph, infographic, diagram) lacks a detailed description beyond basic alt text

List each complex image found and whether it has adequate detailed description.`
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
    tests: ["1.8.1", "1.8.2", "1.8.3", "1.8.4", "1.8.5", "1.8.6"],
    prompt: `Analyze the HTML and visible content for images that contain text (text rendered as images rather than actual HTML text).

Look for:
1. Images where the alt text suggests text content (buttons, headings, slogans, quotes rendered as images)
2. Images in navigation, buttons, or headings that appear to be text
3. Banner images with text overlays that could be HTML text instead
4. Promotional images with calls-to-action text baked into the image

Exceptions (these are allowed as images):
- Logos and brand marks
- Text that is part of a photo or screenshot
- Text where specific typography is essential to the information (e.g., historical documents, calligraphy samples)
- CAPTCHAs

Report:
- PASS: If no images of text are found (except allowed exceptions), OR a mechanism exists to replace text images with styled HTML text
- FAIL: If images containing text are used where styled HTML text could achieve the same visual effect

List each text image found and explain whether it could be replaced with styled HTML text.`
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
    tests: ["1.9.1", "1.9.2", "1.9.3", "1.9.4", "1.9.5"],
    prompt: `Analyze the HTML for images that have visible captions or legends near them.

For each image with an adjacent caption/legend, verify proper programmatic association:
1. Proper structure: <figure> containing the image and <figcaption> for the caption
2. If not using figure/figcaption, check for:
   - role="figure" on container with aria-label including caption text
   - aria-labelledby or aria-describedby linking image to caption element
3. The caption must be programmatically connected, not just visually adjacent

Look for:
- Images followed by small text descriptions
- Gallery images with captions
- Product images with description text
- News article images with photo credits or descriptions

Report:
- PASS: If no images have captions, OR all image captions are properly associated using figure/figcaption or ARIA attributes
- FAIL: If any image has a visible caption that is not programmatically linked to the image

List each image with caption found and describe how (or if) the caption is associated.`
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
    tests: ["3.1.1", "3.1.2", "3.1.3", "3.1.4", "3.1.5", "3.1.6"],
    prompt: `Analyze the HTML and CSS for cases where information is conveyed by color alone.

Check for these common violations:
1. Form fields where errors are indicated only by red border/text color without icons, text labels, or other indicators
2. Required fields marked only with color (e.g., red asterisk without "required" text or aria-required)
3. Links within text that are only distinguished by color (no underline, icon, or other visual cue)
4. Status indicators using only color (green=success, red=error) without text or icons
5. Charts/graphs where data series are distinguished only by color without patterns or labels
6. Navigation items where current page is indicated only by color change
7. Buttons or interactive elements where disabled state is shown only by color

For each element conveying information:
- Identify what information the color conveys
- Check if there's a non-color alternative (text, icon, pattern, shape, underline, border style)

Report:
- PASS: If all color-coded information also has a non-color visual indicator
- FAIL: If any information is conveyed by color alone without additional visual cues

List each instance where color conveys information and whether it has adequate non-color alternatives.`
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
    tests: ["4.1.1", "4.1.2", "4.1.3"],
    prompt: `Analyze the HTML for pre-recorded audio and video content (<video>, <audio>, <iframe> with video embeds like YouTube/Vimeo).

For each pre-recorded media element:
1. VIDEO with audio: Check for text transcript (link nearby, expandable section, or same page) OR audio description track
2. AUDIO only: Check for text transcript
3. VIDEO only (no audio): Check for text transcript describing visual content

Look for:
- Links labeled "Transcript", "Text version", "Full transcript"
- Adjacent or expandable text containing the transcript
- <track kind="descriptions"> for audio descriptions
- Separate audio description version of the video

Exceptions (no transcript needed):
- Decorative media with no informative content
- Media that is itself an alternative to text content already on the page

Report:
- PASS: If no pre-recorded media exists, OR all media has appropriate transcripts/audio descriptions
- FAIL: If any pre-recorded media lacks a text transcript or audio description

List each media element found and whether it has the required alternative.`
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
    tests: ["4.2.1", "4.2.2", "4.2.3"],
    prompt: `For each pre-recorded media element that has a transcript or audio description, evaluate if it is pertinent and complete.

A transcript/audio description is pertinent if it includes:
1. All spoken dialogue and narration (verbatim or accurately paraphrased)
2. Identification of speakers when multiple people speak
3. Relevant non-speech audio (sound effects, music that conveys meaning, environmental sounds)
4. Description of important visual information not conveyed by audio (for video)
5. Logical reading order that makes sense without the media

Check for common issues:
- Auto-generated captions that are inaccurate
- Missing speaker identification
- Omitted sound effects or music descriptions
- Missing visual descriptions for videos

Report:
- PASS: If all transcripts/audio descriptions are accurate, complete, and convey equivalent information
- FAIL: If any transcript/audio description is incomplete, inaccurate, or missing essential information

For each transcript found, note any quality issues or missing information.`
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
    tests: ["4.3.1", "4.3.2"],
    prompt: `Analyze the HTML for pre-recorded synchronized media (video with audio track).

For each video with audio:
1. Check for <track kind="captions"> or <track kind="subtitles"> element
2. For embedded players (YouTube, Vimeo, etc.), check if captions are available/enabled
3. Look for caption toggle buttons in the player interface
4. Check for open captions (burned into the video)

Exceptions (captions not required):
- Video without any audio content
- Video where audio is not essential to understanding
- Video that is an alternative to text content already on the page

Report:
- PASS: If no synchronized video+audio exists, OR all such videos have synchronized captions available
- FAIL: If any pre-recorded video with audio lacks synchronized captions

List each video found and whether captions are available.`
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
    tests: ["4.4.1"],
    prompt: `For each video with synchronized captions, evaluate the caption quality:

Captions are pertinent if they:
1. Accurately transcribe all spoken dialogue
2. Are properly synchronized with the audio (appear when words are spoken)
3. Identify different speakers when needed (e.g., [John] or JOHN:)
4. Include relevant sound effects in brackets (e.g., [door slams], [music playing])
5. Indicate tone/manner when not obvious (e.g., [sarcastically], [whispering])
6. Are readable (appropriate duration on screen, not too fast)
7. Are positioned to not obscure important visual content

Common issues to check:
- Auto-generated captions with errors
- Missing punctuation making text hard to read
- Captions too fast to read
- Missing sound effect descriptions
- No speaker identification in multi-person dialogue

Report:
- PASS: If all captions are accurate, well-synchronized, and include all audio information
- FAIL: If captions are inaccurate, poorly synchronized, or missing essential audio information

Note specific quality issues found in captions.`
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
    tests: ["4.5.1", "4.5.2"],
    prompt: `Analyze pre-recorded videos for audio description availability.

Audio description is needed when videos contain visual information not conveyed by the main audio track, such as:
- On-screen text, titles, or graphics
- Actions, gestures, or facial expressions important to understanding
- Scene changes or locations
- Character appearances or visual context
- Silent demonstrations or visual instructions

For each video requiring audio description:
1. Check for <track kind="descriptions"> element
2. Look for an audio description toggle in the player
3. Check for an alternative version of the video with audio description
4. Look for a link to an audio-described version

Exceptions (audio description not required):
- Videos where all visual information is already described in the main audio
- Talking head videos where visuals add no extra information
- Videos that are alternatives to text content on the page

Report:
- PASS: If no videos require audio description, OR all videos needing it have synchronized audio description available
- FAIL: If any video has essential visual content not conveyed by audio and lacks audio description

List each video and whether audio description is needed and available.`
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
    tests: ["4.6.1", "4.6.2"],
    prompt: `For each video with audio description, evaluate if the description is pertinent and complete.

Audio description is pertinent if it:
1. Describes essential visual information during natural pauses in dialogue
2. Identifies speakers when they first appear
3. Describes key actions, gestures, and facial expressions
4. Notes scene changes and new locations
5. Describes on-screen text, graphics, or titles
6. Provides context for visual jokes or reactions
7. Does not talk over important dialogue
8. Uses clear, concise language

Common issues:
- Describing obvious things while missing important visual details
- Talking over dialogue
- Insufficient description of key visual elements
- Missing identification of new characters or speakers

Report:
- PASS: If all audio descriptions convey essential visual information appropriately timed
- FAIL: If any audio description misses important visual content or interferes with main audio

Note specific quality issues found in audio descriptions.`
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
    tests: ["4.7.1"],
    prompt: `Analyze each audio and video element to verify it is clearly identifiable.

For each media element, check for:
1. A visible title or heading immediately before the media
2. An accessible name via aria-label or aria-labelledby
3. A title attribute on the element
4. An adjacent text description explaining what the media contains
5. For embedded players (iframe), a meaningful title attribute

The identification should:
- Clearly indicate what the media content is about
- Help users decide whether to play the media
- Be programmatically associated with the media or visually adjacent

Report:
- PASS: If all media elements have clear, accessible identification of their content
- FAIL: If any media element lacks clear identification (no title, heading, or accessible name)

List each media element found and how it is identified (or note if identification is missing).`
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
    tests: ["4.8.1", "4.8.2"],
    prompt: `Analyze the HTML for non-temporal media (interactive content that is not time-based).

Non-temporal media includes:
- Flash content (<object>, <embed> with SWF)
- Java applets
- Silverlight applications
- Interactive SVG graphics
- Canvas-based interactive applications
- WebGL content
- PDF viewers embedded in the page
- Interactive maps or data visualizations

For each non-temporal media found:
1. Check for an accessible HTML alternative (link to alternative version or adjacent accessible content)
2. Check if the content within is natively accessible (proper ARIA, keyboard support)
3. Look for <noscript> or fallback content providing equivalent functionality

Report:
- PASS: If no non-temporal media exists, OR all such media has accessible alternatives
- FAIL: If any non-temporal media lacks an accessible alternative and is not natively accessible

List each non-temporal media element and whether it has an adequate alternative.`
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
    tests: ["4.9.1"],
    prompt: `For each non-temporal media with an alternative, evaluate if the alternative is pertinent.

The alternative is pertinent if it:
1. Provides the same information as the original media
2. Offers equivalent functionality (if the original is interactive)
3. Is accessible to assistive technologies
4. Is kept up to date with the original content
5. Is clearly linked or presented alongside the original

Check that the alternative:
- Conveys all data and information from interactive charts/maps
- Provides same interactive capabilities through accessible means
- Includes all text content from PDF or Flash
- Functions without requiring plugins

Report:
- PASS: If all alternatives provide equivalent information and functionality in an accessible format
- FAIL: If any alternative is incomplete, inaccessible, or missing essential content/functionality

Note specific gaps between original media and its alternative.`
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
    tests: ["4.10.1"],
    prompt: `Analyze the HTML and JavaScript for auto-playing audio content.

Check for:
1. <audio autoplay> or <video autoplay> elements with sound
2. JavaScript that triggers audio.play() or video.play() on page load
3. Embedded media players configured to autoplay (YouTube, Vimeo with autoplay parameter)
4. Background music or ambient sounds that start automatically

For any auto-playing audio found:
1. Check if it stops within 3 seconds automatically
2. Check for a visible mechanism to pause/stop the audio at the top of the page
3. Check for a visible mechanism to control volume (mute or adjust)
4. Ensure the control is keyboard accessible and appears early in the tab order

Report:
- PASS: If no auto-playing audio exists, OR audio ≤3 seconds, OR accessible pause/stop/volume controls are present
- FAIL: If audio auto-plays for >3 seconds without accessible controls to pause/stop or adjust volume

List each auto-playing audio source and available controls (or lack thereof).`
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
    tests: ["4.11.1", "4.11.2", "4.11.3"],
    prompt: `Analyze media players for keyboard accessibility of all controls.

For each video and audio player, verify keyboard access to:
1. Play/Pause - activatable with keyboard (Enter/Space)
2. Stop - if present, keyboard accessible
3. Volume control - adjustable via keyboard (arrow keys or direct input)
4. Mute toggle - keyboard accessible
5. Progress/seek bar - navigable with keyboard (arrow keys)
6. Fullscreen toggle - keyboard accessible
7. Caption toggle - keyboard accessible
8. Playback speed - if present, keyboard accessible

Check:
- All controls are focusable (in tab order or via arrow keys within player)
- Controls have visible focus indicators
- Controls have accessible names (aria-label or visible text)
- Controls respond to expected keyboard interactions (Enter, Space, arrows)

Report:
- PASS: If all media player controls are fully keyboard accessible with proper labels and focus indicators
- FAIL: If any essential control (play, pause, volume, mute) is not keyboard accessible

List each media player and which controls are keyboard accessible/inaccessible.`
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
    tests: ["4.12.1", "4.12.2"],
    prompt: `Analyze non-temporal media (interactive content like maps, interactive graphics, canvas applications) for keyboard accessibility.

For each interactive non-temporal media element:
1. Check if all interactive features are keyboard accessible
2. Verify focus can enter and exit the component using Tab
3. Check that internal navigation works with expected keys (arrows, Enter, Space, Escape)
4. Verify visible focus indicators exist within the component
5. Check that all functionality available via mouse is also available via keyboard

Common non-temporal media to check:
- Interactive maps (can zoom, pan, select locations via keyboard?)
- Interactive charts (can navigate data points, show tooltips via keyboard?)
- Canvas-based games or applications
- SVG interactive graphics
- Embedded PDF viewers

Report:
- PASS: If all non-temporal media is fully keyboard operable with clear focus management
- FAIL: If any interactive feature requires mouse-only interaction

List each non-temporal media and keyboard accessibility status of its interactive features.`
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
    tests: ["4.13.1", "4.13.2"],
    prompt: `Analyze media players for assistive technology compatibility.

For each media player (video, audio, interactive media):
1. Check that controls have proper accessible names (aria-label, visible text, or title)
2. Verify controls announce their state (aria-pressed for toggle buttons, aria-valuenow for sliders)
3. Check that dynamic state changes are announced (play/pause state, current time, volume level)
4. Verify the player has a proper role (application, region with aria-label, or native controls)
5. Check that screen readers can identify the media type and its current state

Specific checks:
- Play button: has accessible name, announces pressed/unpressed state
- Volume slider: has accessible name, announces current value
- Progress bar: has accessible name, can report current position
- Custom controls: proper ARIA roles and states
- Status updates: aria-live for time updates if announced

Report:
- PASS: If all media players have proper ARIA attributes and announce state changes to assistive technologies
- FAIL: If any media player lacks accessible names, roles, or state announcements

List each media player control and its ARIA implementation status.`
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
    tests: ["5.1.1"],
    prompt: `Analyze the HTML for complex data tables and verify each has a summary.

A complex data table has:
- Multiple levels of headers (headers spanning rows or columns)
- Nested header relationships
- Multiple header rows or columns
- Irregular structure

For each complex data table:
1. Check for a summary that explains the table structure via:
   - <caption> element with structure explanation
   - aria-describedby pointing to explanatory text
   - Adjacent visible text describing the table structure
   - Summary attribute (deprecated but acceptable)
2. The summary should explain how the table is organized and how to navigate it

Simple tables (single row of headers, regular structure) do not require a summary.

Report:
- PASS: If no complex data tables exist, OR all complex tables have summaries explaining their structure
- FAIL: If any complex data table lacks a summary describing its structure

List each complex table found and whether it has an adequate summary.`
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
    tests: ["5.2.1"],
    prompt: `For each complex data table that has a summary, evaluate if the summary is pertinent.

A pertinent summary should:
1. Explain the overall organization of the table
2. Describe the header structure (how many levels, what they represent)
3. Clarify relationships between headers and data
4. Help users understand how to navigate the table efficiently
5. Be concise but complete enough to understand the table structure

The summary should NOT:
- Simply repeat the table caption/title
- Be too generic (e.g., "This is a data table")
- Describe the data content instead of the structure

Report:
- PASS: If all complex table summaries adequately explain the table structure and navigation
- FAIL: If any summary is too vague, inaccurate, or fails to explain the table structure

For each complex table with a summary, evaluate the summary quality and note any issues.`
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
    tests: ["5.3.1"],
    prompt: `Analyze layout tables (tables used for visual positioning, not data) for linearized reading order.

Identify layout tables by:
- Tables without <th> headers
- Tables with role="presentation" or role="none"
- Tables used for page layout (sidebars, columns, form layouts)

For each layout table:
1. Read the cell contents in DOM order (left-to-right, top-to-bottom)
2. Check if the content makes logical sense when read sequentially
3. Verify related content stays together when linearized
4. Ensure form labels appear before their inputs in reading order

Common issues:
- Labels in one column, inputs in another (label comes after unrelated content)
- Navigation in left column, content in right (mixing navigation with content)
- Multi-column layouts where reading across columns breaks meaning

Report:
- PASS: If no layout tables exist, OR all layout table content is comprehensible when linearized
- FAIL: If any layout table content becomes illogical or confusing when read in DOM order

List each layout table and describe how content flows when linearized.`
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
    tests: ["5.4.1"],
    prompt: `Analyze data tables that have visible titles and verify the title is properly associated.

For each data table with a visible title/heading:
1. Check if the title is programmatically associated via:
   - <caption> element as first child of <table>
   - aria-labelledby pointing to the heading element
   - aria-label containing the title text
   - title attribute on the <table>
2. Verify the association is correct (IDs match, caption is inside table)

A table title is any visible text that identifies or describes the table, such as:
- A heading immediately before the table
- A title above the table
- Text describing what data the table contains

Report:
- PASS: If no data tables have titles, OR all titled tables have proper programmatic association
- FAIL: If any data table has a visible title that is not programmatically associated with the table

List each data table with a visible title and how the title is (or isn't) associated.`
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
    tests: ["5.8.1"],
    prompt: `Analyze layout tables to ensure they don't use data table elements.

Identify layout tables by:
- Tables with role="presentation" or role="none"
- Tables without logical header/data relationships
- Tables used purely for visual positioning

For each layout table, check that it does NOT contain:
1. <caption> element
2. <th> (table header) elements
3. <thead> (table head) element
4. <tfoot> (table footer) element
5. summary attribute on <table>
6. scope attribute on any cell
7. headers attribute on any cell
8. axis attribute (deprecated)

These elements are specifically for data tables and will confuse screen readers if used in layout tables.

Layout tables SHOULD have:
- role="presentation" or role="none" to indicate they're for layout only

Report:
- PASS: If no layout tables exist, OR all layout tables avoid data table elements
- FAIL: If any layout table uses <caption>, <th>, <thead>, <tfoot>, summary, scope, headers, or axis

List each layout table and any data table elements incorrectly used.`
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
    tests: ["7.1.1", "7.1.2", "7.1.3"],
    prompt: `Analyze JavaScript-powered interactive components for assistive technology compatibility.

For each custom interactive component (dropdown, modal, accordion, tabs, carousel, date picker, autocomplete, etc.):

1. Check for proper ARIA roles:
   - Custom buttons have role="button" or use <button>
   - Menus have role="menu" with role="menuitem" children
   - Dialogs have role="dialog" or role="alertdialog"
   - Tab interfaces use role="tablist", "tab", "tabpanel"
   - Accordions use appropriate roles and aria-expanded

2. Check for required ARIA states and properties:
   - aria-expanded for expandable elements
   - aria-selected for selectable items
   - aria-pressed for toggle buttons
   - aria-checked for checkboxes/radios
   - aria-controls linking controls to controlled content
   - aria-haspopup for elements that trigger popups

3. Check for accessible names:
   - All interactive elements have accessible names
   - aria-label or aria-labelledby where needed

4. Check dynamic updates:
   - State changes update ARIA attributes
   - Focus is managed appropriately

Report:
- PASS: If all custom interactive components have proper ARIA implementation
- FAIL: If any component lacks appropriate roles, states, or properties for AT compatibility

List each custom component and its ARIA implementation status.`
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
    tests: ["7.2.1", "7.2.2"],
    prompt: `For JavaScript functionality that has alternatives, verify the alternatives are pertinent.

Check for:
1. <noscript> elements providing content/functionality when JS is disabled
2. Progressive enhancement (base HTML functionality enhanced by JS)
3. Server-side fallbacks for client-side features
4. Alternative versions of JS-heavy features

For each script with an alternative:
1. Does the alternative provide the same information?
2. Does the alternative provide equivalent functionality?
3. Can users complete the same tasks?
4. Is the alternative accessible?

Examples:
- Form validation: Does server-side validation catch the same errors?
- Image carousel: Is there a static list of images as fallback?
- AJAX content loading: Does page work with standard navigation?
- Interactive map: Is there an address or directions list as fallback?

Report:
- PASS: If all script alternatives provide equivalent accessible functionality
- FAIL: If any alternative is missing information, functionality, or is inaccessible

List each script with alternative and assess the alternative's equivalence.`
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
    tests: ["7.3.1", "7.3.2"],
    prompt: `Analyze all JavaScript-powered interactive elements for keyboard accessibility.

For each interactive element created or enhanced by JavaScript:

1. Check keyboard operability:
   - Can be focused with Tab key
   - Can be activated with Enter and/or Space
   - Dropdown/menus navigable with Arrow keys
   - Dialogs closeable with Escape
   - All mouse interactions have keyboard equivalents

2. Check for mouse-only event handlers:
   - onclick should also work via keyboard
   - onmouseover/onmouseout need onfocus/onblur equivalents
   - ondblclick needs keyboard alternative
   - Drag-and-drop has keyboard alternative

3. Check focus management:
   - Focus visible at all times
   - Focus moves logically (not trapped, returns appropriately)
   - Dynamic content receives focus when appropriate

4. Check custom components:
   - Custom dropdowns: Arrow keys navigate options
   - Modals: Focus trapped within, Escape closes
   - Tabs: Arrow keys switch tabs
   - Sliders: Arrow keys adjust values
   - Date pickers: Full keyboard navigation

Report:
- PASS: If all interactive elements are fully keyboard operable
- FAIL: If any interactive feature requires mouse-only interaction

List each interactive element and its keyboard accessibility status.`
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
    tests: ["7.4.1"],
    prompt: `Analyze JavaScript for context changes that might disorient users.

Context changes include:
1. Opening new windows/tabs (window.open, target="_blank")
2. Moving focus unexpectedly
3. Submitting forms automatically
4. Significantly changing page content
5. Redirecting to another page
6. Changing form controls based on selection

For each context change found:
1. Is it triggered by user action (button click, form submit) or automatic?
2. If automatic or unexpected, is the user warned in advance?
3. For new windows: Is there visual indication (icon) and/or text warning?
4. For auto-submit: Is user warned that selecting will submit?
5. For major content changes: Is focus managed appropriately?

Check for these patterns:
- Links with target="_blank" without "(opens in new window)" or icon
- Select boxes that auto-navigate or auto-submit on change
- Forms that submit when radio buttons are selected
- Page redirects without user action
- Focus moving to dynamic content without announcement

Report:
- PASS: If all context changes are user-initiated OR users are warned in advance
- FAIL: If any unexpected context change occurs without warning or user control

List each context change and whether users are adequately warned.`
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
    tests: ["7.5.1", "7.5.2", "7.5.3"],
    prompt: `Analyze the page for status messages and verify they are announced to assistive technologies.

Status messages include:
1. Form validation errors (after submission or inline)
2. Success messages ("Item added to cart", "Form submitted successfully")
3. Warning messages ("Session expiring soon")
4. Progress indicators ("Loading...", "50% complete")
5. Search result counts ("25 results found")
6. Dynamic content updates that don't receive focus

For each status message:
1. Check for appropriate ARIA live region:
   - role="status" for non-urgent updates (search results, success messages)
   - role="alert" for important, time-sensitive messages
   - aria-live="polite" for non-interruptive updates
   - aria-live="assertive" for urgent messages
2. Verify the live region exists in DOM before content is added
3. Check that only the new content is announced (not entire sections)

Common issues:
- Error messages appear visually but aren't announced
- Success messages not announced at all
- Live region added dynamically with content (won't announce)
- aria-live="assertive" overused (interrupts users)

Report:
- PASS: If all status messages have appropriate live regions and will be announced
- FAIL: If any status message lacks live region announcement

List each status message type found and its ARIA live region implementation.`
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
    tests: ["8.1.1", "8.1.2", "8.1.3"],
    prompt: `Analyze the HTML document for a valid DOCTYPE declaration.

Check for:
1. Presence of DOCTYPE declaration at the very beginning of the document
2. DOCTYPE must appear before the <html> tag
3. DOCTYPE should be valid for the HTML version used

Valid DOCTYPE examples:
- <!DOCTYPE html> (HTML5 - recommended)
- <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
- <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

Issues to flag:
- Missing DOCTYPE entirely
- DOCTYPE appears after other content
- Malformed or invalid DOCTYPE syntax
- Outdated transitional DOCTYPEs (less ideal but acceptable)

Report:
- PASS: If a valid DOCTYPE declaration is present at the start of the document
- FAIL: If DOCTYPE is missing, malformed, or not at the document start

State which DOCTYPE is used and whether it is valid.`
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
    tests: ["8.7.1"],
    prompt: `Analyze the page content for language changes that need to be marked.

A language change must be indicated when:
1. Words or phrases in a different language than the page's main language
2. Quotes in foreign languages
3. Technical terms in another language
4. Proper nouns that should be pronounced in their original language
5. Entire sections or blocks in a different language

For each text in a different language:
1. Check if it has a lang attribute on itself or a containing element
2. The lang attribute should use valid ISO 639-1 codes (e.g., "en", "fr", "de", "es")

Exceptions (don't need marking):
- Proper nouns that have become common in the main language
- Technical terms universally used (e.g., "email", "software" in French)
- Widely understood foreign words absorbed into the language

Report:
- PASS: If all significant language changes are marked with lang attributes
- FAIL: If foreign language text exists without appropriate lang attribute

List each foreign language text found and whether it is properly marked.`
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
    tests: ["8.8.1"],
    prompt: `For each element with a lang attribute marking a language change, verify the code is valid and pertinent.

Check each lang attribute:
1. Valid: Must be a valid ISO 639-1 language code
   - Two-letter codes: en, fr, de, es, it, pt, nl, ru, ja, zh, etc.
   - Can include region: en-US, en-GB, fr-CA, pt-BR, zh-Hans, zh-Hant
2. Pertinent: Must match the actual language of the content
   - German text should have lang="de", not lang="en"
   - Spanish text should have lang="es"
   - The content within the element should be in the declared language

Common issues:
- Invalid language codes (e.g., lang="english" instead of lang="en")
- Wrong language code for content (mismatch)
- Overly specific codes when not needed
- Using lang on elements where content is actually in page language

Report:
- PASS: If all lang attributes use valid codes matching the actual content language
- FAIL: If any lang code is invalid or doesn't match the content language

List each lang attribute found and verify code validity and appropriateness.`
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
    tests: ["8.9.1"],
    prompt: `Analyze HTML for misuse of semantic tags for purely presentational purposes.

Check for these common misuses:
1. <blockquote> used for indentation instead of actual quotes
2. <h1>-<h6> used for styling text size/weight, not structure
3. <table> used for layout instead of data (without role="presentation")
4. <ul>/<ol> used for visual bullets without actual list content
5. <br> used multiple times for spacing instead of CSS margins
6. <p> used as spacing elements (empty paragraphs)
7. <strong>/<em> used for visual styling without emphasis meaning
8. <address> used for non-contact information
9. <code>/<pre> used for visual styling without code content
10. <fieldset> used for visual grouping of non-form content

For each semantic element:
- Verify it's used for its intended semantic purpose
- Check if the content matches what the element semantically represents

Report:
- PASS: If all semantic elements are used appropriately for their semantic meaning
- FAIL: If any semantic tag is used purely for visual presentation

List each misused semantic element and explain the correct alternative.`
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
    tests: ["8.10.1", "8.10.2"],
    prompt: `Analyze the page for text direction changes that need to be marked.

Right-to-left (RTL) languages that need dir="rtl":
- Arabic (ar)
- Hebrew (he)
- Persian/Farsi (fa)
- Urdu (ur)
- Pashto (ps)
- Yiddish (yi)
- Syriac (syr)

For each text in an RTL language:
1. Check if dir="rtl" is set on the element or a container
2. For mixed LTR/RTL content, verify proper dir attributes

For the page:
1. If the page is primarily RTL, check dir="rtl" on <html>
2. If primarily LTR with RTL sections, check dir="rtl" on those sections
3. For inline RTL text in LTR page, use <bdo dir="rtl"> or <span dir="rtl">

Also check:
- If dir="ltr" is needed for LTR content within RTL pages
- Bidirectional text (mixed LTR and RTL) is properly handled

Report:
- PASS: If no RTL text exists, OR all RTL text has appropriate dir attribute
- FAIL: If RTL text exists without dir="rtl" marking

List each RTL text section and whether direction is properly indicated.`
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
    tests: ["9.4.1", "9.4.2"],
    prompt: `Analyze the page content for quotations and verify they are properly marked up.

Types of quotations to identify:
1. Block quotes (longer quotations set apart from main text)
2. Inline quotes (shorter quotations within a sentence)
3. Testimonials and customer reviews
4. Cited passages from other sources
5. Dialogue or speech quotes

For each quotation found:
1. Block quotes should use <blockquote> element
   - Check for cite attribute linking to source when applicable
   - <blockquote> should contain the quoted text
2. Inline quotes should use <q> element
   - Browser adds quotation marks automatically
   - Can have cite attribute for source
3. Attribution/source should use <cite> for work titles or <footer> for attribution

Common issues:
- Quotes using only CSS styling (italics, indentation) without semantic markup
- Using <blockquote> for indentation instead of actual quotes
- Missing <q> tags for inline quotations
- Quotation marks typed manually without <q> element

Report:
- PASS: If all quotations are properly marked with <blockquote> or <q>
- FAIL: If quotations exist without appropriate semantic markup

List each quotation found and whether it is properly marked up.`
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
    tests: ["10.1.1", "10.1.2", "10.1.3"],
    prompt: `Analyze the HTML for deprecated presentational attributes and elements that should be CSS.

Check for these deprecated HTML presentational attributes:
1. align, valign on any element
2. bgcolor, background on any element
3. border on <table>, <img>
4. cellpadding, cellspacing on <table>
5. width, height on elements (except <img>, <video>, <canvas>, <svg>)
6. color, face, size on <font>
7. hspace, vspace on <img>
8. nowrap on <td>, <th>
9. frameborder on <iframe>

Check for deprecated presentational elements:
1. <font> tags
2. <center> tags
3. <basefont> tags
4. <big>, <small> (when used for presentation only)
5. <s>, <strike>, <u> (when used for presentation only)
6. Spacer GIFs or transparent images for layout

These should all be replaced with CSS:
- Use CSS background, background-color instead of bgcolor
- Use CSS text-align instead of align
- Use CSS border, padding instead of table attributes
- Use CSS width, height for sizing

Report:
- PASS: If all presentation is controlled by CSS with no deprecated HTML presentation
- FAIL: If any deprecated presentational HTML attributes or elements are found

List each deprecated presentational element/attribute found.`
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
    tests: ["10.2.1"],
    prompt: `Analyze the page for informative content that is only visible via CSS and would be lost if CSS is disabled.

Check for:
1. CSS content property adding informative text
   - ::before and ::after pseudo-elements with content: "text"
   - Check if the text is purely decorative or carries information
2. CSS background images that convey information
   - Icons that represent actions or status without text alternatives
   - Infographics or charts as background images
3. CSS-only visibility of important content
   - Content that relies on CSS display, visibility, opacity to be shown
4. CSS icon fonts without text alternatives
   - Font Awesome, Material Icons, etc. used without aria-label or sr-only text

Information that MUST be in HTML, not CSS:
- Status indicators (online/offline, active/inactive)
- Required field markers
- Error/warning/success indicators
- Navigation cues
- Action icons (edit, delete, save)

Report:
- PASS: If all informative content is in HTML and remains when CSS is disabled
- FAIL: If any informative content is added via CSS and would be lost without CSS

List each CSS-generated content that carries information.`
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
    tests: ["10.3.1"],
    prompt: `Analyze the page DOM order to verify content remains comprehensible without CSS.

Check that the DOM order (reading order without CSS) is logical:
1. Main heading appears before content it describes
2. Labels appear before or immediately after their form fields
3. Related content is grouped together in the DOM
4. Navigation follows a logical pattern
5. Instructions appear before the elements they describe

Issues to look for:
1. CSS flexbox/grid order property changing visual order significantly
   - order: property reordering items differently from DOM
2. CSS position: absolute moving content visually
   - Elements positioned far from their DOM location
3. CSS float causing unexpected reading order
4. Two-column layouts where DOM order differs from visual reading order

Without CSS, reading order should:
- Flow logically from top to bottom of DOM
- Make sense when read sequentially
- Keep related items together (form labels with inputs)
- Present information in expected order (header, nav, main, footer)

Report:
- PASS: If content remains logically ordered and comprehensible without CSS
- FAIL: If disabling CSS would make content order confusing or illogical

Describe the DOM order and any significant differences from visual order.`
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
    tests: ["10.4.1", "10.4.2"],
    prompt: `Analyze the page's CSS and HTML for text resize support up to 200%.

Check for:
1. Viewport meta tag issues:
   - user-scalable=no (prevents zoom)
   - maximum-scale=1 or less (limits zoom)
   - These block text resizing in mobile browsers

2. CSS unit analysis:
   - Check for fixed font sizes in px that won't scale
   - Look for containers with fixed heights that would clip text
   - Check for overflow: hidden on text containers

3. Layout issues at 200% text size:
   - Text containers with fixed width causing overflow
   - Text clipping or being cut off
   - Text overlapping other elements
   - Horizontal scrolling required to read text
   - Loss of content or functionality

Best practices:
- Use rem or em for font sizes
- Use relative units or auto for container heights
- Allow containers to expand with content
- Test at 200% browser zoom

Report:
- PASS: If text remains readable at 200% with no loss of content or functionality
- FAIL: If viewport prevents scaling, OR text is clipped/lost/overlapping at 200%

List any CSS/HTML that would prevent proper text resizing.`
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
    tests: ["10.5.1", "10.5.2", "10.5.3"],
    prompt: `Analyze CSS color declarations to ensure foreground and background colors are always paired.

When a user has custom stylesheets or high contrast mode, unpaired color declarations cause problems:
- Setting only background-color: white text on user's dark background becomes invisible
- Setting only color: dark text on user's dark background becomes invisible

For each element with color styling, check:
1. If background-color is set, color must also be set
2. If color is set, background-color must also be set
3. If background-image is used, both color and background-color should be set as fallback

Check these patterns in CSS:
- Elements with only "color:" without "background-color:"
- Elements with only "background-color:" without "color:"
- Background images without fallback background-color and text color

Special attention to:
- Body and html elements
- Text containers
- Links (a elements)
- Buttons and form elements
- Headers and footers

Report:
- PASS: If all color declarations are properly paired (foreground + background)
- FAIL: If any element has color or background-color without the other

List elements with unpaired color declarations.`
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
    tests: ["10.7.1"],
    prompt: `Analyze all focusable elements to verify focus is clearly visible.

Focusable elements to check:
1. Links (<a> with href)
2. Buttons (<button>, <input type="button/submit/reset">)
3. Form controls (input, select, textarea)
4. Elements with tabindex="0" or positive tabindex
5. Elements with contenteditable
6. Summary elements in details
7. Any element with click handlers that are keyboard accessible

For each focusable element, check:
1. Focus indicator is visible when element receives focus
2. Focus indicator has sufficient contrast (3:1 minimum against adjacent colors)
3. Focus indicator is clear and distinctive (not just a subtle change)

Look for these CSS patterns that remove/hide focus:
- outline: none or outline: 0 without replacement
- :focus { outline: none } without other focus styles
- Browser default focus removed without custom focus style

Acceptable focus indicators:
- Visible outline (solid, dashed, dotted)
- Border change on focus
- Background color change on focus
- Box-shadow creating visible outline effect
- Combination of multiple indicators

Report:
- PASS: If all focusable elements have clearly visible focus indicators with adequate contrast
- FAIL: If any focusable element has invisible, removed, or low-contrast focus indicator

List each focusable element type and describe its focus indicator (or note if missing).`
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
    tests: ["10.8.1"],
    prompt: `Analyze hidden content to verify correct AT (assistive technology) behavior.

Check hidden content patterns:

1. Content hidden from everyone (should be hidden from AT too):
   - display: none - Correctly hides from AT
   - visibility: hidden - Correctly hides from AT
   - HTML hidden attribute - Correctly hides from AT
   - These should NOT also have aria-hidden (redundant)

2. Content visually hidden but available to AT (sr-only patterns):
   - Visually hidden with clip, position absolute, small size
   - Should NOT have aria-hidden="true" (would hide from AT too)
   - Should NOT have display:none or visibility:hidden

3. Decorative content hidden from AT only:
   - aria-hidden="true" for decorative icons, images
   - Should be used for purely decorative elements

4. Problematic patterns:
   - aria-hidden="true" on parent containing focusable children
   - aria-hidden="true" on informative content
   - Focusable element inside aria-hidden region
   - opacity:0 (visually hidden but still in AT tree and focusable)
   - transform: scale(0) (same issue)
   - Off-screen positioned content still focusable

Report:
- PASS: If all hidden content is appropriately handled for AT
- FAIL: If aria-hidden is misused, or hidden content is incorrectly exposed to/hidden from AT

List each hidden content pattern and whether it's correctly implemented.`
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
    tests: ["10.9.1", "10.9.2", "10.9.3", "10.9.4"],
    prompt: `Analyze the page for information conveyed only by shape, size, or position.

Check for these issues:

1. Instructions referencing visual position only:
   - "Click the button on the right"
   - "Use the menu at the top of the page"
   - "See the sidebar for more information"
   - These need additional context (button name, menu title, etc.)

2. Instructions referencing shape only:
   - "Click the round button"
   - "Select the square icon"
   - "Fill in the oval field"
   - Need text labels or descriptions

3. Instructions referencing size only:
   - "Click the large button"
   - "Use the small form"
   - Need identifying text

4. Information conveyed by icon shape alone:
   - Star icon for favorites without label
   - Gear icon for settings without label
   - Arrow icons for navigation without text

5. Status indicators using shape/size/position only:
   - Current page indicated only by position in navigation
   - Selected item shown only by size change
   - Progress shown only by bar position

6. Data relationships shown only by position:
   - Related items grouped spatially without semantic grouping

Report:
- PASS: If all shape/size/position information also has text or other non-visual alternatives
- FAIL: If any information relies solely on shape, size, or visual position

List each instance where visual characteristics convey information.`
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
    tests: ["10.10.1", "10.10.2", "10.10.3", "10.10.4"],
    prompt: `For elements that convey information via shape, size, or position, verify the text alternatives are pertinent.

Where 10.9 checks IF alternatives exist, 10.10 checks if they are PERTINENT (accurate and useful).

For each alternative provided:

1. Text describing position:
   - Does it accurately identify the element? (e.g., "Submit button" not just "button on right")
   - Is the text meaningful without visual context?

2. Text describing shape-based icons:
   - Does aria-label or text accurately describe the function?
   - Star icon: labeled "Add to favorites" not just "Star"
   - Gear icon: labeled "Settings" not just "Gear"

3. Alternative for size-based information:
   - Large/small emphasis: is text alternative provided (em, strong, or aria-label)?
   - Does the alternative convey the same level of importance?

4. Alternative for position-based relationships:
   - Are grouped items semantically grouped (fieldset, list, ARIA)?
   - Is current item in navigation marked with aria-current?
   - Are related items associated programmatically?

5. Alternative for visual progress/status:
   - Progress bars: have aria-valuenow, aria-valuemin, aria-valuemax?
   - Status indicators: have text or aria-label describing status?

Report:
- PASS: If all text alternatives accurately convey the same information as visual cues
- FAIL: If any alternative is missing, inaccurate, or doesn't convey equivalent information

List each visual cue and evaluate its text alternative's accuracy.`
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
    tests: ["10.11.1", "10.11.2"],
    prompt: `Analyze the page's responsive behavior at 320px width and 256px height.

This tests content reflow to ensure users who zoom don't need to scroll in two directions.

At 320px viewport width, check:
1. Content reflows to single column without horizontal scrolling
2. All text is visible without horizontal scroll
3. All functionality remains available
4. No content is cut off or hidden
5. Images scale or have alternate display
6. Navigation remains accessible (hamburger menu acceptable)
7. Forms remain usable

At 256px viewport height, check:
1. Content scrolls vertically only (not horizontally)
2. All content is accessible via vertical scroll
3. Fixed headers/footers don't consume too much space

Exceptions (may require 2D scrolling):
- Data tables
- Complex diagrams
- Maps
- Games
- Interfaces where spatial layout is essential (presentations, video editors)

Check for:
- Fixed width containers that don't shrink
- overflow: hidden cutting off content
- Absolutely positioned elements that break layout
- Images with fixed widths causing horizontal scroll
- Text that doesn't wrap properly

Report:
- PASS: If content reflows properly at 320px/256px without 2D scrolling (except allowed exceptions)
- FAIL: If horizontal scrolling is needed at 320px width, or content is lost/hidden

Describe the responsive behavior and any issues found.`
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
    tests: ["10.12.1"],
    prompt: `Analyze the page to verify text spacing can be adjusted without breaking content.

Users with dyslexia and reading difficulties often need to increase text spacing. Test with these values simultaneously:
- Line height (line-height) at least 1.5 times the font size
- Paragraph spacing (margin-bottom) at least 2 times the font size
- Letter spacing (letter-spacing) at least 0.12 times the font size
- Word spacing (word-spacing) at least 0.16 times the font size

When these styles are applied, check for:
1. No loss of content (text not cut off or hidden)
2. No overlapping text
3. All functionality still works (buttons clickable, forms usable)
4. Text containers expand to accommodate spacing
5. No horizontal scrolling needed due to text expansion

Look for CSS patterns that may cause issues:
- Fixed height containers with overflow: hidden
- Text containers that don't allow expansion
- Fixed-size buttons that can't accommodate text growth
- Tightly constrained layouts

Exceptions:
- Video captions and other timed text (already have standards)
- Images of text (can't be restyled)

Report:
- PASS: If text spacing can be increased to specified values without content loss or overlap
- FAIL: If increasing text spacing causes text clipping, overlap, or loss of functionality

Describe any containers that would fail text spacing adjustments.`
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
    tests: ["10.13.1", "10.13.2", "10.13.3"],
    prompt: `Analyze hover and focus triggered content (tooltips, popovers, dropdowns) for user control.

For each content that appears on hover or focus:

1. DISMISSIBLE - Can be closed without moving pointer/focus:
   - Check if Escape key dismisses the content
   - Check if clicking elsewhere closes it
   - Important if content obscures other page elements

2. HOVERABLE - Pointer can move to the additional content:
   - Check if mouse can move from trigger to tooltip without it disappearing
   - The additional content must remain visible when pointer moves to it
   - Critical for content with links or interactive elements inside

3. PERSISTENT - Content remains until dismissed or trigger loses hover/focus:
   - Content should NOT disappear on a timeout while still hovered
   - Should remain visible until user moves away or dismisses

Check these components:
- Tooltips (on hover and focus)
- Dropdown menus
- Mega menus
- Popovers
- Sub-menus
- Info icons with hover content

Exceptions:
- Browser-native tooltips (title attribute) - handled by browser
- Content triggered by user activation (click) rather than hover/focus

Report:
- PASS: If all hover/focus content is dismissible, hoverable, and persistent
- FAIL: If any hover/focus content lacks one of these three properties

List each hover/focus triggered component and its compliance with all three criteria.`
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
    tests: ["10.14.1", "10.14.2"],
    prompt: `Analyze CSS-only hover effects to verify keyboard accessibility.

For each element where CSS :hover reveals additional content:
1. Check if same content is revealed on :focus
2. Verify the triggering element is focusable (keyboard accessible)

Common CSS patterns to check:
- element:hover > .hidden-content { display: block; }
- element:hover .tooltip { visibility: visible; }
- element:hover + .adjacent-content { opacity: 1; }
- element:hover ~ .sibling { transform: translateX(0); }

For each hover-revealed content:
1. Is there a corresponding :focus rule?
   - :focus or :focus-within should show the same content
2. Is the triggering element keyboard focusable?
   - Links, buttons: naturally focusable
   - Other elements: need tabindex="0"

Examples of issues:
- Dropdown menus that only open on hover, not on focus
- Tooltips visible only on hover without focus support
- Hidden navigation that appears on hover without :focus-within

Solution patterns:
- Add :focus alongside :hover in CSS
- Use :focus-within for parent elements
- Make sure trigger elements are focusable

Report:
- PASS: If all CSS hover-revealed content is also accessible via keyboard focus
- FAIL: If any hover content is not accessible via keyboard

List each hover-revealed content and whether :focus support exists.`
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
    tests: ["11.3.1", "11.3.2"],
    prompt: `Analyze form fields across the page (and ideally across the site) for label consistency.

Check for fields with the same function:
1. Search fields - should all be labeled consistently (e.g., all "Search" not mix of "Search", "Find", "Look up")
2. Email fields - all should use same label (e.g., "Email" or "Email address")
3. Name fields - consistent labeling (e.g., "First name" vs "Given name")
4. Phone fields - same label throughout
5. Address fields - consistent field names
6. Login credentials - same labels for username/password across forms

On the same page, check:
- If multiple forms exist, same-purpose fields have same labels
- Repeated field patterns (like multiple address sections) use consistent labels

Across the site (if context available):
- Header search should match footer search labeling
- Login form fields should match registration form equivalents
- Contact form labels should be consistent with other forms

Report:
- PASS: If all fields with the same function use consistent labels
- FAIL: If same-purpose fields have different labels causing potential confusion

List any inconsistent labeling found for same-purpose fields.`
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
    tests: ["11.4.1", "11.4.2", "11.4.3"],
    prompt: `Analyze form field labels to verify they are visually adjacent to their associated fields.

Label positioning rules:
1. Text inputs, selects, textareas: Label should be immediately BEFORE or ABOVE the field
2. Checkboxes and radio buttons: Label should be immediately AFTER the input
3. Groups of fields: Legend should be at the START of the fieldset

Check for these issues:
1. Label positioned far from its input field
2. Label and input separated by other content
3. Labels positioned in a column separate from inputs (e.g., left column labels, right column inputs with large gap)
4. Checkbox/radio labels appearing before the input instead of after
5. Form layouts where visual proximity doesn't match programmatic association

Verify in the HTML and CSS:
- DOM order places label adjacent to input
- CSS doesn't visually separate label from input
- No other elements between label and its field
- For floating labels: label appears in/above input, not far removed

Special cases:
- Placeholder text is NOT a substitute for adjacent labels
- Icon-only labels need adjacent text alternative

Report:
- PASS: If all labels are visually adjacent to their associated form fields
- FAIL: If any label is visually separated from its field

List each form field and describe its label positioning.`
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
    tests: ["11.5.1"],
    prompt: `Analyze forms to verify related fields are properly grouped.

Fields that REQUIRE grouping:
1. Radio button groups (same name) - Must be grouped
2. Checkbox groups for related options - Should be grouped
3. Address fields (street, city, zip, country) - Should be grouped
4. Date/time components (day, month, year) - Must be grouped
5. Name components (first, middle, last) - Should be grouped
6. Contact information sections - Should be grouped
7. Billing vs Shipping information - Should be separately grouped

Check for proper grouping using:
1. <fieldset> with <legend> - preferred for most groups
2. role="group" with aria-labelledby or aria-label
3. role="radiogroup" specifically for radio buttons

Issues to look for:
- Radio buttons without any grouping (each appears independent)
- Address fields scattered without container
- Multiple date/time selects without grouping
- Related checkboxes without group context

When is grouping NOT required:
- Single standalone fields
- Logically independent fields (email and password in login form can be ungrouped)
- Simple forms with only 2-3 unrelated fields

Report:
- PASS: If all related field sets are properly grouped with fieldset/legend or ARIA
- FAIL: If related fields exist without appropriate grouping

List each group of related fields and whether they are properly grouped.`
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
    tests: ["11.6.1"],
    prompt: `For each group of related form fields, verify a legend/label identifies the group.

Check each field grouping for proper legend:

1. <fieldset> must have <legend>:
   - <legend> should be first child of <fieldset>
   - Legend text should identify what the group is for
   - Example: <fieldset><legend>Shipping Address</legend>...</fieldset>

2. role="group" must have accessible name via:
   - aria-label with descriptive text
   - aria-labelledby pointing to visible heading
   - Example: <div role="group" aria-labelledby="shipping-heading">

3. role="radiogroup" must have accessible name:
   - aria-label or aria-labelledby required
   - Should describe what the radio options are for
   - Example: <div role="radiogroup" aria-label="Payment method">

Check for these issues:
- <fieldset> without <legend>
- <fieldset> with empty <legend>
- role="group" without aria-label or aria-labelledby
- Legend/label that doesn't describe the group purpose
- Visually hidden legend that should be visible

The legend should answer: "What is this group of fields for?"
- Good: "Billing Address", "Contact Preferences", "Delivery Options"
- Bad: "Fields", "Options", "Section 1"

Report:
- PASS: If all field groups have descriptive legends/labels
- FAIL: If any field group lacks a legend or has an inadequate legend

List each field group and its legend (or note if missing).`
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
    tests: ["11.8.1", "11.8.2", "11.8.3"],
    prompt: `Analyze <select> elements to verify options are properly grouped when applicable.

When to use <optgroup>:
1. Lists with categories (e.g., countries grouped by continent)
2. Lists with logical sections (e.g., popular choices vs all choices)
3. Long lists that benefit from organization
4. Options that naturally fall into groups

Check each <select> element:
1. Are options logically groupable?
2. If yes, are <optgroup> elements used?
3. Does each <optgroup> have a label attribute?
4. Is the label descriptive and helpful?

Example of proper grouping:
<select>
  <optgroup label="North America">
    <option>United States</option>
    <option>Canada</option>
  </optgroup>
  <optgroup label="Europe">
    <option>France</option>
    <option>Germany</option>
  </optgroup>
</select>

When grouping is NOT needed:
- Short lists (under 10 items)
- Lists where all items are of same type with no natural grouping
- Yes/No or simple choice lists
- Lists already in logical order (A-Z) where groups wouldn't help

Report:
- PASS: If select lists appropriately use <optgroup> where beneficial, with descriptive labels
- FAIL: If a select list would clearly benefit from grouping but lacks <optgroup>

List each <select> and whether grouping is appropriately used or needed.`
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
    tests: ["11.10.1", "11.10.2", "11.10.3", "11.10.4", "11.10.5", "11.10.6", "11.10.7"],
    prompt: `Analyze form validation and input controls for accessibility.

Check each form for:

1. Required fields identification:
   - Are required fields marked with required attribute or aria-required="true"?
   - Is there a visual indicator (asterisk, "required" text)?
   - Is the meaning of the indicator explained (e.g., "* required field")?

2. Input format requirements:
   - Are expected formats clearly stated (e.g., "DD/MM/YYYY", "10 digits")?
   - Are format hints visible before submission, not just after error?
   - Are input constraints appropriate (not overly restrictive)?

3. Error handling:
   - Are error messages visible (not just title attribute or color change)?
   - Are errors associated with fields (aria-describedby or adjacent)?
   - Do errors clearly explain what's wrong?
   - Are fields in error state marked with aria-invalid="true"?

4. Error announcement:
   - Are errors announced to screen readers (aria-live region or focus management)?
   - Is there an error summary at form level for multiple errors?
   - Does focus move to first error or error summary?

5. Data type inputs:
   - Are appropriate input types used (email, tel, date, number)?
   - Do inputs have appropriate autocomplete values?

Report:
- PASS: If all form validation is accessible with proper required marking, format hints, and error handling
- FAIL: If required fields aren't marked, formats aren't explained, or errors aren't accessible

List each form and evaluate its validation accessibility.`
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
    tests: ["11.11.1", "11.11.2"],
    prompt: `Analyze form error messages to verify they include helpful suggestions for correction.

When input errors are detected, error messages should include suggestions unless:
- It would compromise security (e.g., not revealing valid usernames)
- The correct format is already obvious

For each form field that can have validation errors:

1. Format errors should suggest correct format:
   - Bad: "Invalid date"
   - Good: "Invalid date. Please use format DD/MM/YYYY (e.g., 25/12/2024)"

2. Required field errors should be specific:
   - Bad: "This field is required"
   - Good: "Please enter your email address"

3. Invalid value errors should explain why and suggest alternatives:
   - Bad: "Invalid selection"
   - Good: "Please select a delivery date that is at least 2 days from today"

4. Pattern/constraint errors should show expected pattern:
   - Bad: "Invalid phone number"
   - Good: "Phone number should be 10 digits (e.g., 0612345678)"

5. Suggestions should be appropriate to error type:
   - Spelling suggestions for close matches
   - Format examples for pattern mismatches
   - Range hints for out-of-range values
   - List of valid options when applicable

Report:
- PASS: If all error messages provide helpful suggestions for correction
- FAIL: If error messages only state something is wrong without guidance

List each error message type found and evaluate if suggestions are provided.`
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
    tests: ["11.12.1", "11.12.2"],
    prompt: `Analyze forms with legal, financial, or data-modifying consequences for reversibility/review mechanisms.

Forms requiring this criterion:
1. Financial transactions (purchases, payments, transfers)
2. Legal agreements (contracts, terms acceptance)
3. Data modification (account changes, profile updates)
4. Data deletion (account deletion, content removal)
5. Test/exam submissions
6. Booking/reservation systems

For each such form, at least ONE of these must be present:

1. REVERSIBLE: Submissions can be reversed/cancelled
   - Undo option after submission
   - Cancellation window
   - Order cancellation capability

2. CHECKED: Data is reviewed for errors before finalizing
   - Server-side validation with opportunity to correct
   - System checks for common errors

3. CONFIRMED: Review page before final submission
   - Summary of all data entered
   - Clear opportunity to go back and edit
   - Explicit confirmation action (checkbox, type confirmation)

Check for:
- Purchase flows: Is there an order review step?
- Account deletion: Is there confirmation dialog?
- Legal agreements: Can user review before signing?
- Test submissions: Warning before final submit?
- Data changes: Preview of changes before applying?

Report:
- PASS: If all high-consequence forms have reversibility, checking, or confirmation mechanisms
- FAIL: If any financial/legal/data-modifying form lacks these protections

List each high-consequence form and describe what protection mechanisms exist.`
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
    tests: ["12.1.1"],
    prompt: `Verify the website provides at least two different ways to navigate/find content.

Navigation mechanisms include:
1. Navigation menu (main navigation, header/footer navigation)
2. Search function (site search)
3. Sitemap (page listing all content with links)
4. Table of contents (for long pages)
5. Breadcrumbs (showing navigation path)

For the site to pass, identify at least TWO of these:
- A navigation menu with links to main sections
- A functional search feature
- A sitemap page accessible from all pages
- A comprehensive table of contents

Check for:
1. Does a main navigation menu exist?
2. Is there a search function? (Look for search input, search icon)
3. Is there a sitemap link (usually in footer)?
4. If applicable, is there a table of contents for long documents?

Exceptions (may need only one mechanism):
- Single-page websites
- Simple sites with very few pages
- Web applications where navigation doesn't apply

Report:
- PASS: If at least two different navigation mechanisms are available
- FAIL: If only one way to find content exists (e.g., only a menu, no search or sitemap)

List each navigation mechanism found on the site.`
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
    tests: ["12.2.1"],
    prompt: `Verify navigation elements appear in consistent positions across all pages.

Check consistency of:

1. Main navigation menu:
   - Same visual position on all pages (e.g., always at top)
   - Same DOM order relative to other elements
   - Same structure and organization

2. Secondary navigation (if present):
   - Footer navigation in same position
   - Sidebar navigation consistent across sections

3. Search functionality:
   - Located in same position across all pages
   - Same visual presentation

4. Breadcrumbs (if used):
   - Same position relative to content
   - Consistent styling

5. Other navigation elements:
   - Skip links in same position
   - Utility navigation (login, cart) consistent

Check between:
- Home page and interior pages
- Different sections of the site
- Different page templates

Look for inconsistencies:
- Navigation moving from top to side
- Search appearing in different locations
- Menu items changing order (except to indicate current section)
- Different navigation structure on mobile vs desktop is OK if consistent within each

Report:
- PASS: If navigation elements maintain consistent position across all pages
- FAIL: If navigation position varies between pages

Describe the navigation layout and any inconsistencies found.`
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
    tests: ["12.3.1", "12.3.2", "12.3.3"],
    prompt: `If a sitemap page exists, evaluate if it is pertinent and useful.

A pertinent sitemap should:

1. Be representative of site structure:
   - Include all main sections and important pages
   - Reflect the actual site hierarchy
   - Cover key content areas users need to find

2. Have working links:
   - All links should be functional (no 404 errors)
   - Links should go to correct destinations
   - No broken or outdated links

3. Be up-to-date:
   - New sections/pages are included
   - Removed pages are not listed
   - Reflects current site structure

4. Be organized logically:
   - Clear hierarchical structure
   - Grouped by topic or section
   - Easy to scan and understand

5. Provide useful navigation:
   - More detailed than main navigation
   - Helps users find specific content
   - Includes pages not in main nav

Check for issues:
- Incomplete sitemap missing major sections
- Outdated links to moved/deleted pages
- Flat list with no organization
- Auto-generated sitemap that's not user-friendly
- XML sitemap (for search engines) offered instead of HTML sitemap (for users)

Report:
- PASS: If sitemap exists and is complete, organized, up-to-date with working links
- FAIL: If sitemap is incomplete, disorganized, has broken links, or is missing

If no sitemap exists, note that one of the other navigation mechanisms should be present per 12.1.`
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
    tests: ["12.4.1", "12.4.2", "12.4.3"],
    prompt: `If a sitemap exists, verify access to it is consistent across all pages.

Check that the sitemap link:

1. Same location on all pages:
   - Usually in footer or header
   - Same visual position
   - Same DOM location relative to other elements

2. Same link text/labeling:
   - Consistent text (e.g., always "Sitemap" or always "Plan du site")
   - Not varying between "Site Map", "Sitemap", "Index", etc.
   - Same icon if icon is used

3. Accessible on all pages:
   - Present on every page, not just home page
   - Works from all sections of the site
   - Same functionality (leads to same sitemap page)

4. Same presentation:
   - Same styling across pages
   - Same icon (if used)
   - Same keyboard position in tab order (relative to other footer/header links)

Look for inconsistencies:
- Sitemap link in footer on some pages, header on others
- Different link text on different pages
- Link missing on some pages
- Link position changing in footer

Report:
- PASS: If sitemap link is consistently accessible from same location with same text across all pages
- FAIL: If sitemap access varies between pages (different location, text, or missing on some pages)

If no sitemap exists, this criterion is not applicable.`
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
    tests: ["12.5.1", "12.5.2", "12.5.3"],
    prompt: `If a search function exists, verify it is consistently accessible across all pages.

Check that the search feature:

1. Same location on all pages:
   - Usually in header or sidebar
   - Same visual position relative to other elements
   - Same DOM location

2. Same presentation:
   - Same appearance (input field, button, icon)
   - Same placeholder text or label
   - Same styling across pages

3. Same keyboard accessibility position:
   - Reachable at same point in tab order (relative to other header elements)
   - Same number of tabs from start of page to reach search

4. Same functionality:
   - Works the same way on all pages
   - Searches same content scope
   - Same search results format

5. Consistent on all page types:
   - Present on home page and all interior pages
   - Present across different sections
   - Not removed on certain page templates

Look for inconsistencies:
- Search visible on home page but hidden on other pages
- Search in header on some pages, footer on others
- Different search input styling or labeling
- Search missing on certain page types

Report:
- PASS: If search is consistently accessible from same location with same presentation across all pages
- FAIL: If search access varies between pages (different location, presentation, or missing)

If no search exists, this criterion is not applicable, but verify one of the other navigation mechanisms (12.1) is present.`
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
    tests: ["12.8.1", "12.8.2"],
    prompt: `Analyze the page's tab order to verify it follows a logical sequence.

Check that tab order:

1. Follows visual reading order:
   - Generally left-to-right, top-to-bottom (for LTR languages)
   - Matches the visual flow of the page
   - Doesn't jump around unexpectedly

2. Respects logical groupings:
   - Related items are tabbed through together
   - Form fields in logical order
   - Navigation items in visual order

3. Avoids these issues:
   - Positive tabindex values (tabindex="1", tabindex="2", etc.) that override natural order
   - CSS positioning (absolute, fixed, float) creating mismatch between visual and DOM order
   - Focusable elements outside the current visual context receiving focus

4. For specific components:
   - Modal dialogs: focus trapped within modal when open
   - Dropdown menus: tab order through menu items when open
   - Skip links: properly positioned at start of tab order

Check the HTML for:
- tabindex values greater than 0 (avoid these)
- tabindex="-1" on elements that shouldn't be in tab order (acceptable)
- tabindex="0" on elements that need to be focusable (acceptable)

Issues to look for:
- Focus jumping from header to footer, skipping main content
- Form labels getting focus between form fields
- Hidden elements receiving focus
- Focus order not matching visual layout

Report:
- PASS: If tab order follows logical visual reading order without unexpected jumps
- FAIL: If tab order is illogical, uses positive tabindex, or creates confusing navigation

Describe the tab order and any issues found.`
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
    tests: ["12.9.1"],
    prompt: `Test keyboard navigation to ensure no keyboard traps exist.

A keyboard trap occurs when:
- Focus enters a component but cannot leave using keyboard
- Tab key doesn't move focus forward
- Shift+Tab doesn't move focus backward
- Standard escape mechanisms don't work

Check these common trap scenarios:

1. Modal dialogs:
   - Focus should be trapped WITHIN modal while open (this is correct)
   - BUT must be escapable via Escape key or Close button
   - Focus should return to trigger when closed

2. Embedded content:
   - Iframes, embedded videos, PDFs
   - Flash/plugin content (if any)
   - Focus must be able to leave using Tab/Shift+Tab

3. Custom widgets:
   - Date pickers, autocomplete dropdowns
   - Rich text editors
   - Custom select menus
   - Verify Tab can exit the widget

4. Infinite scroll areas:
   - Focus shouldn't get lost in infinitely scrolling content
   - Must be able to Tab past scroll regions

5. Media players:
   - Focus should be able to leave player controls

Testing method:
1. Tab through entire page
2. Ensure focus eventually cycles back to browser chrome or loops to start
3. Test entering and exiting all interactive components
4. Verify Shift+Tab works to go backward
5. Test Escape key for modal/popup dismissal

Report:
- PASS: If keyboard can navigate through all elements without getting trapped
- FAIL: If focus gets stuck in any component with no keyboard escape method

List any keyboard traps found and which component causes them.`
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
    tests: ["12.10.1"],
    prompt: `Identify single-key keyboard shortcuts and verify user control mechanisms.

Single-key shortcuts are those activated by:
- A single letter key (a-z, A-Z)
- A single number (0-9)
- A punctuation mark (., /, ?, etc.)
- A symbol (#, @, etc.)

NOT including:
- Modifier key combinations (Ctrl+S, Alt+F, Cmd+C)
- Standard keys (Tab, Enter, Escape, Arrow keys, Space on buttons)

For each single-key shortcut found, verify at least ONE of:

1. TURN OFF: A mechanism to disable the shortcut
   - Keyboard settings panel
   - Preference to turn off shortcuts

2. REMAP: A mechanism to change the shortcut to include modifier
   - Keyboard shortcut customization
   - Ability to change from "s" to "Ctrl+s"

3. FOCUS-ONLY: Shortcut only active when specific component is focused
   - Video player: single keys work only when player focused
   - Text editor: shortcuts only in editor context
   - Map: keyboard navigation only when map focused

Why this matters:
- Voice control users speak letters that can trigger shortcuts
- Screen reader users navigate by letter keys
- Speech-to-text users may accidentally trigger shortcuts

Look for shortcuts in:
- Rich text editors (B for bold, I for italic)
- Video players (K for play/pause, J/L for seek)
- Mapping applications (arrow keys for pan)
- Games and interactive applications

Report:
- PASS: If no single-key shortcuts exist, OR all have turn off/remap/focus-only mechanisms
- FAIL: If single-key shortcuts exist without user control options

List each single-key shortcut found and its user control mechanism.`
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
    tests: ["12.11.1"],
    prompt: `Check if additional content that appears on hover/focus/activation is keyboard reachable when it contains interactive elements.

This applies when the additional content (tooltip, popup, dropdown) contains:
- Links
- Buttons
- Form controls
- Other interactive elements

For each popup/tooltip with interactive content:

1. Can the content be reached by keyboard?
   - Can Tab move into the popup content?
   - Can arrow keys navigate within (for menus)?
   - Is focus managed appropriately?

2. Can the interactive elements be activated?
   - Links clickable with Enter
   - Buttons activatable with Enter/Space
   - Form controls usable

3. Can the user leave the content?
   - Tab moves focus out appropriately
   - Escape closes popup and returns focus
   - No keyboard trap

Examples to check:
- Mega menus with links that appear on hover
- Tooltips containing "Learn more" links
- Popover dialogs with action buttons
- Dropdown menus with interactive items
- Info icons revealing content with links

Non-interactive popups (pure text tooltips):
- Don't need to be keyboard navigable inside
- Just need to appear on focus (covered in 10.13/10.14)

Report:
- PASS: If all interactive content in popups is keyboard reachable and operable
- FAIL: If any interactive elements in hover/focus content cannot be reached or operated by keyboard

List each popup with interactive content and keyboard accessibility status.`
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
    tests: ["13.1.1", "13.1.2", "13.1.3", "13.1.4"],
    prompt: `Analyze the page for time limits that affect content or user sessions.

Types of time limits to check:

1. Page refresh/redirect:
   - <meta http-equiv="refresh"> with time value
   - JavaScript setTimeout redirecting page
   - Auto-refresh of page content

2. Session timeouts:
   - Login session expiration
   - Shopping cart timeout
   - Form completion time limits

3. Auto-advancing content:
   - Carousels that advance automatically
   - Slideshows with timed transitions
   - Auto-playing presentations

4. Countdown timers:
   - Auction end times
   - Limited-time offers
   - Test/quiz time limits

For each time limit found, verify at least ONE of these user controls:

1. TURN OFF: User can disable the time limit before encountering it
2. ADJUST: User can adjust time limit to at least 10x the default
3. EXTEND: User warned before expiration and given 20+ seconds to extend (with simple action) at least 10 times

Exceptions (no control required):
- Real-time events (auctions, live sessions)
- Time is essential (test with time limit)
- Time limit is longer than 20 hours

Report:
- PASS: If no time limits exist, OR all time limits have user control mechanisms
- FAIL: If any time limit lacks turn off/adjust/extend mechanism

List each time limit found and its user control options.`
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
    tests: ["13.2.1"],
    prompt: `Check that no new browser windows or tabs open automatically without user action.

Look for these patterns that open windows without user action:

1. JavaScript on page load:
   - window.open() in DOMContentLoaded, load, or inline script
   - Automatic popup/popunder scripts
   - Analytics or tracking opening new windows

2. HTML that auto-triggers:
   - Meta refresh to new window
   - Automatic form submission opening new tab

3. On focus/blur events:
   - Windows opening when page gains or loses focus
   - Not triggered by user clicking

What IS allowed:
- Windows opening on user click (button, link with target="_blank")
- Windows opening on user-initiated form submit
- Dialogs/modals within the same page (not new browser windows)
- Print dialogs triggered by user action

What is NOT allowed:
- Popup windows on page load
- Popunder windows (open behind current window)
- Windows opening on scroll
- Windows opening after timer without user action
- Multiple windows opening from single action

Check the JavaScript code for:
- window.open() calls in initialization code
- Event listeners on load/DOMContentLoaded that open windows
- setTimeout/setInterval triggering window.open

Report:
- PASS: If no windows open automatically without explicit user action
- FAIL: If any window/tab opens without being triggered by user click/submit

List any automatic window opening found.`
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
    tests: ["13.3.1"],
    prompt: `Identify downloadable documents and verify accessible versions are available.

Document types to check:
1. PDF files (.pdf)
2. Word documents (.doc, .docx)
3. Excel spreadsheets (.xls, .xlsx)
4. PowerPoint presentations (.ppt, .pptx)
5. OpenDocument formats (.odt, .ods, .odp)

For each downloadable document:

1. Is the document itself accessible?
   - PDF: Tagged PDF with reading order, alt text, bookmarks
   - Word/Office: Proper heading styles, alt text, table headers
   
2. If document is not accessible, is there an alternative?
   - HTML version of the content
   - Accessible PDF version
   - RTF version
   - Plain text version

Check document links for:
- Indication of file format and size
- Link to alternative accessible version
- Note about accessibility of document

What makes a PDF accessible:
- Tagged structure (headings, lists, tables)
- Reading order defined
- Images have alt text
- Text is selectable (not scanned image)
- Form fields are labeled

If document cannot be made accessible:
- Provide HTML alternative with same information
- Offer to provide accessible version on request
- Contact method for accessibility requests

Report:
- PASS: If all downloadable documents are accessible OR have accessible alternatives available
- FAIL: If inaccessible documents are provided without accessible alternatives

List each downloadable document and its accessibility status/alternatives.`
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
    tests: ["13.4.1"],
    prompt: `For each document with an accessible alternative, verify the alternative provides the same information.

The accessible version must contain:

1. All text content from the original
   - Main body text
   - Headings and subheadings
   - Lists and bullet points
   - Footnotes and references

2. All tabular data
   - Tables with same data
   - Properly structured with headers
   - Relationships preserved

3. Equivalent of visual content
   - Charts described in text or with accessible chart
   - Images described or replaced with text descriptions
   - Diagrams explained textually

4. All functional content
   - Forms (if any) with same fields
   - Interactive elements replicated or explained
   - Calculations or formulas included

5. Document structure
   - Same organizational structure
   - Bookmarks/navigation for long documents
   - Page numbers or sections if relevant

Common issues to check:
- Summary versions that omit details
- Missing chart/graph data in text format
- Simplified versions lacking complete information
- Outdated accessible version (original updated, alt not)
- Missing appendices or attachments

Report:
- PASS: If accessible versions contain all information from original documents
- FAIL: If any accessible version is incomplete or missing information

Compare each accessible version to its original and note any missing content.`
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
    tests: ["13.5.1"],
    prompt: `Identify cryptic content and verify text alternatives are provided.

Types of cryptic content:

1. ASCII art:
   - Text-based drawings or graphics
   - Decorative text patterns
   - Example: ¯\\_(ツ)_/¯ or complex ASCII drawings

2. Text emoticons:
   - :) :( :D ;) :-P
   - <3 (heart)
   - Text-based emoji representations

3. Unicode emoji:
   - 😀 🎉 ❤️ 👍
   - These may or may not need alternatives depending on context

4. Cryptic syntax:
   - Mathematical notation: ∑ ∫ √
   - Technical symbols: © ® ™
   - Currency symbols in unusual context
   - Abbreviations that aren't clear

5. Leet speak or internet slang:
   - l33t, b4, u r
   - Content requiring decoding

For each cryptic content found, check for alternatives:
- title attribute explaining the meaning
- aria-label with text equivalent
- Adjacent visible text explanation
- Screen reader-only text (.sr-only class)

Emoji accessibility:
- Decorative emoji: aria-hidden="true" (no alt needed)
- Meaningful emoji: aria-label or text equivalent
- Multiple emoji in sequence: single description for the group

Report:
- PASS: If all cryptic content has text alternatives, OR no cryptic content exists
- FAIL: If cryptic content exists without alternatives that explain meaning

List each cryptic content found and whether it has an alternative.`
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
    tests: ["13.6.1"],
    prompt: `For cryptic content with text alternatives, verify the alternatives accurately convey the meaning.

Evaluate each alternative for:

1. Accuracy:
   - Does it correctly describe what the cryptic content represents?
   - :) should be "smiling face" or "happy", not "colon parenthesis"
   - 👍 should be "thumbs up" or "approval", not "hand emoji"

2. Contextual appropriateness:
   - Does the alternative fit the usage context?
   - Same emoji might mean different things in different contexts
   - "❤️" could be "love", "like", or "favorite" depending on use

3. Conciseness:
   - Is the description brief but complete?
   - Not overly verbose for simple emoticons
   - Adequate detail for complex ASCII art

4. Cultural understanding:
   - Does it convey the intended emotion/meaning?
   - Consider the cultural context of the content

Examples of good alternatives:
- :) → "smiling", "happy"
- :( → "sad face", "disappointed"
- ¯\\_(ツ)_/¯ → "shrug", "I don't know"
- 🎉 → "celebration", "congratulations"
- ASCII art cat → Description of the cat image

Examples of poor alternatives:
- 😀 → "yellow circle" (misses the meaning)
- :) → "punctuation marks" (too literal)
- Complex ASCII art → "picture" (too vague)

Report:
- PASS: If all cryptic content alternatives accurately describe meaning in context
- FAIL: If any alternative is inaccurate, too vague, or doesn't convey intended meaning

Evaluate each cryptic content alternative for accuracy and appropriateness.`
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
    tests: ["13.7.1", "13.7.2", "13.7.3"],
    prompt: `CRITICAL SAFETY CHECK: Analyze the page for flashing or rapidly changing content that could trigger seizures.

This is a health and safety requirement. Flashing content can trigger seizures in people with photosensitive epilepsy.

Check for:

1. Flashing visual content:
   - Rapidly blinking elements (CSS animation, JavaScript)
   - Strobe-like effects in images or videos
   - Rapid color changes
   - Flashing advertisements or banners

2. High-contrast transitions:
   - Rapid alternation between light and dark
   - Flash transitions between colors
   - Lightning or explosion effects in video

Safety thresholds:
- General flash threshold: Maximum 3 flashes per second
- Red flash threshold: No saturated red flashing
- Small area exception: Flashing area must be < 21,824 square pixels (roughly 341x64 pixels) at standard screen

What to look for in code:
- CSS animations with rapid timing (animation-duration < 333ms per cycle)
- JavaScript setInterval/setTimeout with fast intervals changing visibility/color
- GIF images with rapid frame changes
- Video content with strobing/flashing

Also check:
- Auto-playing videos with potential flashing
- Animated advertisements
- Loading animations
- Notification flashes

If flashing content exists, verify:
- Flashes are < 3 per second, OR
- Flashing area is < 21,824 pixels, OR
- Content has seizure warning and can be disabled

Report:
- PASS: If no content flashes more than 3 times per second, OR flashing areas are below threshold
- FAIL: If any content exceeds flash thresholds (CRITICAL - health hazard)

List all potentially flashing content and evaluate against safety thresholds.`
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
    tests: ["13.8.1", "13.8.2"],
    prompt: `Analyze the page for moving, scrolling, blinking, or auto-updating content.

Types of content to check:

1. Moving content:
   - Carousels/sliders that auto-advance
   - Scrolling text (marquee effect)
   - Animated graphics or illustrations
   - Parallax scrolling effects

2. Blinking content:
   - CSS blink animation
   - JavaScript-created blinking elements
   - Attention-grabbing pulsing effects
   - <blink> tag (deprecated but check)

3. Auto-updating content:
   - Live feeds that refresh automatically
   - Stock tickers
   - News feeds
   - Real-time counters or timers

For content lasting more than 5 seconds OR auto-updating:

Verify user controls exist:
1. PAUSE/STOP: Button to pause or stop the movement
2. HIDE: Mechanism to hide the moving content
3. CONTROL FREQUENCY: For auto-updating, ability to control update frequency

Controls must be:
- Clearly visible and labeled
- Keyboard accessible
- Available before or alongside the moving content

Exceptions (no pause needed):
- Animation stops within 5 seconds automatically
- Movement is essential to the content (video that user started)
- Loading indicators (brief, indicates process completion)

Report:
- PASS: If all moving/blinking content ≤5 seconds, OR has accessible pause/stop controls
- FAIL: If moving/blinking content >5 seconds lacks user controls

List each moving/blinking element and its duration or control mechanism.`
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
    tests: ["13.9.1"],
    prompt: `Verify the page content is accessible in both portrait and landscape orientations.

Check that:

1. Content works in both orientations:
   - All content visible and readable in portrait mode
   - All content visible and readable in landscape mode
   - No functionality lost in either orientation

2. No forced orientation lock:
   - Page doesn't use JavaScript to force orientation
   - No CSS that makes content unusable in one orientation
   - Screen orientation API not used to restrict view

3. Layout adapts appropriately:
   - Content reflows for different orientations
   - Navigation remains accessible
   - Forms remain usable
   - Media players work in both orientations

Check the code for:
- screen.orientation.lock() JavaScript calls
- CSS orientation media queries that hide critical content
- JavaScript detecting orientation and showing error/redirect

Why this matters:
- Users with mounted devices (wheelchairs) often can't rotate
- Some users hold devices in specific ways due to dexterity
- Tablets in stands may be fixed orientation

Exceptions (orientation restriction allowed):
- Piano/keyboard apps (need landscape)
- Check deposit apps (need specific orientation for camera)
- Apps where orientation is essential to function
- VR/AR content

Report:
- PASS: If all content is accessible in both portrait and landscape orientations
- FAIL: If content requires specific orientation without essential reason

Describe how the page behaves in both orientations.`
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
    tests: ["13.10.1", "13.10.2"],
    prompt: `Identify complex gestures and verify simple alternatives exist.

Complex gestures that require alternatives:

1. Multipoint gestures (require multiple fingers):
   - Pinch to zoom (two fingers)
   - Two-finger scroll
   - Three-finger swipe
   - Rotate gesture

2. Path-based gestures (require specific movement):
   - Swipe (left, right, up, down)
   - Drag and drop
   - Drawing gestures (shapes, patterns)
   - Flick gestures

For each complex gesture, there must be a simple alternative:

Simple alternatives include:
- Single tap/click
- Double tap/click
- Long press
- Button controls
- Plus/minus buttons for zoom
- Arrow buttons for navigation
- Select/dropdown menus

Check these common features:
- Image carousel: Swipe → also has prev/next buttons?
- Map zoom: Pinch → also has zoom +/- buttons?
- Image gallery: Swipe → also has navigation arrows?
- Drag-and-drop reordering: → also has move up/down buttons?
- Signature drawing: → alternative text input method?

Exceptions (complex gesture may be essential):
- Games where the gesture IS the content
- Signature capture (legal requirement)
- Drawing/art applications
- Music/instrument applications

Report:
- PASS: If all complex gestures have simple single-point alternatives
- FAIL: If any functionality requires complex gesture without simple alternative

List each complex gesture and its simple alternative (or note if missing).`
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
    tests: ["13.11.1"],
    prompt: `Verify pointer actions can be cancelled or reversed to prevent accidental activation.

For all pointer-activated functionality, at least ONE must be true:

1. NO DOWN-EVENT: Action executes on up-event (mouseup, touchend), not down-event
   - Default for click events (mousedown + mouseup)
   - Allows user to move pointer away before releasing

2. ABORT: User can abort by moving pointer away before releasing
   - Press down, drag away, release = no action
   - Common with button implementations

3. UNDO: Action can be reversed after completion
   - Undo button or function available
   - Confirmation dialog before irreversible action

4. ESSENTIAL: Down-event is essential for the function
   - Piano keys (need immediate response on press)
   - Shooting in games (timing critical)
   - Drag operations (need down-event to start)

Check JavaScript event handlers for:
- mousedown/touchstart triggering actions (potentially problematic)
- mouseup/touchend/click triggering actions (good)
- Drag-and-drop implementations (acceptable)

Common issues:
- Custom buttons using mousedown instead of click
- Touch interfaces activating on touchstart
- Important actions with no undo capability

Test by:
- Pressing and holding on interactive elements
- Moving pointer away while still pressed
- Releasing outside the element
- Verifying no action occurred

Report:
- PASS: If all pointer actions fire on up-event, or can be aborted/undone
- FAIL: If actions trigger on down-event without abort capability

List each pointer-activated element and how it handles activation/cancellation.`
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
    tests: ["13.12.1", "13.12.2", "13.12.3"],
    prompt: `Identify motion-activated features and verify alternatives exist.

Device motion functionality includes:

1. Shake gestures:
   - Shake to undo
   - Shake to refresh
   - Shake to shuffle

2. Tilt/rotation:
   - Tilt to scroll
   - Tilt for panoramic view
   - Rotation to control

3. Device orientation:
   - Auto-rotation based on orientation
   - Gyroscope-based controls
   - Accelerometer functions

For each motion-activated feature, verify:

1. UI ALTERNATIVE: Same function available through interface
   - Shake to undo → Undo button also available
   - Tilt to scroll → Touch/swipe scrolling also works
   - Shake to refresh → Refresh button or pull-to-refresh

2. DISABLE OPTION: User can turn off motion response
   - Settings to disable shake features
   - Option to use only UI controls
   - Respects device accessibility settings

Check JavaScript for:
- DeviceMotionEvent listeners
- DeviceOrientationEvent listeners
- Accelerometer API usage
- Gyroscope API usage

Why motion alternatives are needed:
- Wheelchair-mounted devices cannot be shaken/tilted
- Users with motor impairments may move unintentionally
- Tremor or spasticity causes unintended motion
- Some users physically cannot move devices

Exceptions (motion may be essential):
- Step counter/pedometer applications
- Motion-controlled games (as primary purpose)
- AR/VR applications requiring orientation

Report:
- PASS: If all motion-activated features have UI alternatives and/or can be disabled
- FAIL: If any motion feature lacks alternative or disable option

List each motion-activated feature and its UI alternative (or note if missing).`
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
