/**
 * WCAG 2.1/2.2 Success Criteria mapped to axe-core rules
 * Each criterion includes: level, description, and associated axe rules
 */

const wcagCriteria = {
    // Principle 1: Perceivable
    '1.1.1': {
        number: '1.1.1',
        name: 'Non-text Content',
        level: 'A',
        description: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
        axeRules: ['image-alt', 'input-image-alt', 'area-alt', 'svg-img-alt', 'object-alt', 'video-caption', 'audio-caption']
    },
    '1.2.1': {
        number: '1.2.1',
        name: 'Audio-only and Video-only (Prerecorded)',
        level: 'A',
        description: 'For prerecorded audio-only and prerecorded video-only media, provide an alternative.',
        axeRules: [] // Manual check required
    },
    '1.2.2': {
        number: '1.2.2',
        name: 'Captions (Prerecorded)',
        level: 'A',
        description: 'Captions are provided for all prerecorded audio content in synchronized media.',
        axeRules: ['video-caption']
    },
    '1.2.3': {
        number: '1.2.3',
        name: 'Audio Description or Media Alternative (Prerecorded)',
        level: 'A',
        description: 'An alternative for time-based media or audio description of the prerecorded video content is provided.',
        axeRules: [] // Manual check required
    },
    '1.2.4': {
        number: '1.2.4',
        name: 'Captions (Live)',
        level: 'AA',
        description: 'Captions are provided for all live audio content in synchronized media.',
        axeRules: [] // Manual check required
    },
    '1.2.5': {
        number: '1.2.5',
        name: 'Audio Description (Prerecorded)',
        level: 'AA',
        description: 'Audio description is provided for all prerecorded video content in synchronized media.',
        axeRules: [] // Manual check required
    },
    '1.3.1': {
        number: '1.3.1',
        name: 'Info and Relationships',
        level: 'A',
        description: 'Information, structure, and relationships conveyed through presentation can be programmatically determined.',
        axeRules: ['aria-allowed-attr', 'aria-required-attr', 'aria-required-children', 'aria-required-parent', 
                   'aria-roles', 'aria-valid-attr', 'aria-valid-attr-value', 'definition-list', 'dlitem', 
                   'list', 'listitem', 'th-has-data-cells', 'td-headers-attr', 'scope-attr-valid',
                   'table-duplicate-name', 'form-field-multiple-labels', 'label', 'landmark-unique']
    },
    '1.3.2': {
        number: '1.3.2',
        name: 'Meaningful Sequence',
        level: 'A',
        description: 'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.',
        axeRules: ['tabindex']
    },
    '1.3.3': {
        number: '1.3.3',
        name: 'Sensory Characteristics',
        level: 'A',
        description: 'Instructions provided for understanding and operating content do not rely solely on sensory characteristics.',
        axeRules: [] // Manual check required
    },
    '1.3.4': {
        number: '1.3.4',
        name: 'Orientation',
        level: 'AA',
        description: 'Content does not restrict its view and operation to a single display orientation.',
        axeRules: [] // Manual check required
    },
    '1.3.5': {
        number: '1.3.5',
        name: 'Identify Input Purpose',
        level: 'AA',
        description: 'The purpose of each input field collecting information about the user can be programmatically determined.',
        axeRules: ['autocomplete-valid']
    },
    '1.4.1': {
        number: '1.4.1',
        name: 'Use of Color',
        level: 'A',
        description: 'Color is not used as the only visual means of conveying information.',
        axeRules: ['link-in-text-block'] // Partial automated check
    },
    '1.4.2': {
        number: '1.4.2',
        name: 'Audio Control',
        level: 'A',
        description: 'If any audio on a Web page plays automatically for more than 3 seconds, provide a mechanism to pause or stop.',
        axeRules: [] // Manual check required
    },
    '1.4.3': {
        number: '1.4.3',
        name: 'Contrast (Minimum)',
        level: 'AA',
        description: 'Text and images of text have a contrast ratio of at least 4.5:1.',
        axeRules: ['color-contrast']
    },
    '1.4.4': {
        number: '1.4.4',
        name: 'Resize Text',
        level: 'AA',
        description: 'Text can be resized without assistive technology up to 200 percent without loss of content or functionality.',
        axeRules: ['meta-viewport']
    },
    '1.4.5': {
        number: '1.4.5',
        name: 'Images of Text',
        level: 'AA',
        description: 'If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.',
        axeRules: [] // Manual check required
    },
    '1.4.10': {
        number: '1.4.10',
        name: 'Reflow',
        level: 'AA',
        description: 'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.',
        axeRules: ['meta-viewport-large']
    },
    '1.4.11': {
        number: '1.4.11',
        name: 'Non-text Contrast',
        level: 'AA',
        description: 'Visual presentation of UI components and graphical objects have a contrast ratio of at least 3:1.',
        axeRules: ['color-contrast'] // Partial coverage
    },
    '1.4.12': {
        number: '1.4.12',
        name: 'Text Spacing',
        level: 'AA',
        description: 'No loss of content or functionality occurs when text spacing is adjusted.',
        axeRules: [] // Manual check required
    },
    '1.4.13': {
        number: '1.4.13',
        name: 'Content on Hover or Focus',
        level: 'AA',
        description: 'Additional content that appears on hover or focus can be dismissed, hoverable, and persistent.',
        axeRules: [] // Manual check required
    },

    // Principle 2: Operable
    '2.1.1': {
        number: '2.1.1',
        name: 'Keyboard',
        level: 'A',
        description: 'All functionality of the content is operable through a keyboard interface.',
        axeRules: ['accesskeys', 'tabindex']
    },
    '2.1.2': {
        number: '2.1.2',
        name: 'No Keyboard Trap',
        level: 'A',
        description: 'If keyboard focus can be moved to a component, it can also be moved away using only keyboard.',
        axeRules: ['focus-order-semantics'] // Partial check
    },
    '2.1.4': {
        number: '2.1.4',
        name: 'Character Key Shortcuts',
        level: 'A',
        description: 'If a keyboard shortcut uses only character keys, it can be turned off, remapped, or is only active on focus.',
        axeRules: [] // Manual check required
    },
    '2.2.1': {
        number: '2.2.1',
        name: 'Timing Adjustable',
        level: 'A',
        description: 'For each time limit set by the content, the user can turn off, adjust, or extend the time limit.',
        axeRules: ['meta-refresh']
    },
    '2.2.2': {
        number: '2.2.2',
        name: 'Pause, Stop, Hide',
        level: 'A',
        description: 'For moving, blinking, scrolling, or auto-updating information, provide a mechanism to pause, stop, or hide it.',
        axeRules: ['blink'] // Partial check
    },
    '2.3.1': {
        number: '2.3.1',
        name: 'Three Flashes or Below Threshold',
        level: 'A',
        description: 'Web pages do not contain anything that flashes more than three times in any one second period.',
        axeRules: [] // Manual check required
    },
    '2.4.1': {
        number: '2.4.1',
        name: 'Bypass Blocks',
        level: 'A',
        description: 'A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.',
        axeRules: ['bypass', 'skip-link', 'region', 'landmark-one-main']
    },
    '2.4.2': {
        number: '2.4.2',
        name: 'Page Titled',
        level: 'A',
        description: 'Web pages have titles that describe topic or purpose.',
        axeRules: ['document-title']
    },
    '2.4.3': {
        number: '2.4.3',
        name: 'Focus Order',
        level: 'A',
        description: 'If a Web page can be navigated sequentially, focusable components receive focus in an order that preserves meaning.',
        axeRules: ['tabindex', 'focus-order-semantics']
    },
    '2.4.4': {
        number: '2.4.4',
        name: 'Link Purpose (In Context)',
        level: 'A',
        description: 'The purpose of each link can be determined from the link text alone or from the link text together with context.',
        axeRules: ['link-name']
    },
    '2.4.5': {
        number: '2.4.5',
        name: 'Multiple Ways',
        level: 'AA',
        description: 'More than one way is available to locate a Web page within a set of Web pages.',
        axeRules: [] // Manual check required
    },
    '2.4.6': {
        number: '2.4.6',
        name: 'Headings and Labels',
        level: 'AA',
        description: 'Headings and labels describe topic or purpose.',
        axeRules: ['empty-heading', 'heading-order', 'label']
    },
    '2.4.7': {
        number: '2.4.7',
        name: 'Focus Visible',
        level: 'AA',
        description: 'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
        axeRules: [] // Manual check required
    },
    '2.5.1': {
        number: '2.5.1',
        name: 'Pointer Gestures',
        level: 'A',
        description: 'All functionality that uses multipoint or path-based gestures can be operated with a single pointer.',
        axeRules: [] // Manual check required
    },
    '2.5.2': {
        number: '2.5.2',
        name: 'Pointer Cancellation',
        level: 'A',
        description: 'For functionality operated using a single pointer, specific conditions are met to prevent accidental activation.',
        axeRules: [] // Manual check required
    },
    '2.5.3': {
        number: '2.5.3',
        name: 'Label in Name',
        level: 'A',
        description: 'For user interface components with labels, the name contains the text that is presented visually.',
        axeRules: ['label-content-name-mismatch']
    },
    '2.5.4': {
        number: '2.5.4',
        name: 'Motion Actuation',
        level: 'A',
        description: 'Functionality that can be operated by device motion can also be operated by user interface components.',
        axeRules: [] // Manual check required
    },

    // Principle 3: Understandable
    '3.1.1': {
        number: '3.1.1',
        name: 'Language of Page',
        level: 'A',
        description: 'The default human language of each Web page can be programmatically determined.',
        axeRules: ['html-has-lang', 'html-lang-valid']
    },
    '3.1.2': {
        number: '3.1.2',
        name: 'Language of Parts',
        level: 'AA',
        description: 'The human language of each passage or phrase can be programmatically determined.',
        axeRules: ['valid-lang']
    },
    '3.2.1': {
        number: '3.2.1',
        name: 'On Focus',
        level: 'A',
        description: 'When any component receives focus, it does not initiate a change of context.',
        axeRules: [] // Manual check required
    },
    '3.2.2': {
        number: '3.2.2',
        name: 'On Input',
        level: 'A',
        description: 'Changing the setting of any user interface component does not automatically cause a change of context.',
        axeRules: [] // Manual check required
    },
    '3.2.3': {
        number: '3.2.3',
        name: 'Consistent Navigation',
        level: 'AA',
        description: 'Navigational mechanisms that are repeated on multiple Web pages occur in the same relative order.',
        axeRules: [] // Manual check required
    },
    '3.2.4': {
        number: '3.2.4',
        name: 'Consistent Identification',
        level: 'AA',
        description: 'Components that have the same functionality are identified consistently.',
        axeRules: [] // Manual check required
    },
    '3.3.1': {
        number: '3.3.1',
        name: 'Error Identification',
        level: 'A',
        description: 'If an input error is automatically detected, the item that is in error is identified and described to the user in text.',
        axeRules: ['aria-input-field-name']
    },
    '3.3.2': {
        number: '3.3.2',
        name: 'Labels or Instructions',
        level: 'A',
        description: 'Labels or instructions are provided when content requires user input.',
        axeRules: ['label', 'form-field-multiple-labels']
    },
    '3.3.3': {
        number: '3.3.3',
        name: 'Error Suggestion',
        level: 'AA',
        description: 'If an input error is automatically detected and suggestions for correction are known, provide the suggestions to the user.',
        axeRules: [] // Manual check required
    },
    '3.3.4': {
        number: '3.3.4',
        name: 'Error Prevention (Legal, Financial, Data)',
        level: 'AA',
        description: 'For Web pages that cause legal commitments or financial transactions, submissions are reversible, checked, or confirmed.',
        axeRules: [] // Manual check required
    },

    // Principle 4: Robust
    '4.1.1': {
        number: '4.1.1',
        name: 'Parsing',
        level: 'A',
        description: 'In content implemented using markup languages, elements have complete start and end tags, are nested correctly.',
        axeRules: ['duplicate-id', 'duplicate-id-active', 'duplicate-id-aria']
    },
    '4.1.2': {
        number: '4.1.2',
        name: 'Name, Role, Value',
        level: 'A',
        description: 'For all user interface components, the name and role can be programmatically determined.',
        axeRules: ['aria-allowed-attr', 'aria-command-name', 'aria-hidden-body', 'aria-input-field-name',
                   'aria-meter-name', 'aria-progressbar-name', 'aria-required-attr', 'aria-required-children',
                   'aria-required-parent', 'aria-roledescription', 'aria-roles', 'aria-toggle-field-name',
                   'aria-valid-attr-value', 'aria-valid-attr', 'button-name', 'frame-title', 'input-button-name',
                   'input-image-alt', 'label', 'role-img-alt', 'select-name']
    },
    '4.1.3': {
        number: '4.1.3',
        name: 'Status Messages',
        level: 'AA',
        description: 'Status messages can be programmatically determined through role or properties.',
        axeRules: ['aria-live-region-atomic']
    }
};

module.exports = wcagCriteria;
