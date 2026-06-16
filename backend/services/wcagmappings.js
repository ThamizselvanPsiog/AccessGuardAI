const wcagMappings = {

    // ===== PERCEIVABLE =====

    "image-alt": {
        category: "Perceivable",
        criterion: "1.1.1 Non-text Content",
        level: "A"
    },

    "input-image-alt": {
        category: "Perceivable",
        criterion: "1.1.1 Non-text Content",
        level: "A"
    },

    "area-alt": {
        category: "Perceivable",
        criterion: "1.1.1 Non-text Content",
        level: "A"
    },

    "color-contrast": {
        category: "Perceivable",
        criterion: "1.4.3 Contrast (Minimum)",
        level: "AA"
    },

    "audio-caption": {
        category: "Perceivable",
        criterion: "1.2.2 Captions (Prerecorded)",
        level: "A"
    },

    "video-caption": {
        category: "Perceivable",
        criterion: "1.2.2 Captions (Prerecorded)",
        level: "A"
    },

    // ===== OPERABLE =====

    "bypass": {
        category: "Operable",
        criterion: "2.4.1 Bypass Blocks",
        level: "A"
    },

    "frame-title": {
        category: "Operable",
        criterion: "2.4.1 Bypass Blocks",
        level: "A"
    },

    "link-name": {
        category: "Operable",
        criterion: "2.4.4 Link Purpose",
        level: "A"
    },

    "focus-order-semantics": {
        category: "Operable",
        criterion: "2.4.3 Focus Order",
        level: "A"
    },

    "tabindex": {
        category: "Operable",
        criterion: "2.1.1 Keyboard",
        level: "A"
    },

    // ===== UNDERSTANDABLE =====

    "html-has-lang": {
        category: "Understandable",
        criterion: "3.1.1 Language of Page",
        level: "A"
    },

    "valid-lang": {
        category: "Understandable",
        criterion: "3.1.1 Language of Page",
        level: "A"
    },

    "label": {
        category: "Understandable",
        criterion: "3.3.2 Labels or Instructions",
        level: "A"
    },

    "form-field-multiple-labels": {
        category: "Understandable",
        criterion: "3.3.2 Labels or Instructions",
        level: "A"
    },

    // ===== ROBUST =====

    "button-name": {
        category: "Robust",
        criterion: "4.1.2 Name, Role, Value",
        level: "A"
    },

    "aria-required-attr": {
        category: "Robust",
        criterion: "4.1.2 Name, Role, Value",
        level: "A"
    },

    "aria-valid-attr": {
        category: "Robust",
        criterion: "4.1.2 Name, Role, Value",
        level: "A"
    },

    "aria-allowed-attr": {
        category: "Robust",
        criterion: "4.1.2 Name, Role, Value",
        level: "A"
    },

    "aria-hidden-focus": {
        category: "Robust",
        criterion: "4.1.2 Name, Role, Value",
        level: "A"
    },

    "duplicate-id": {
        category: "Robust",
        criterion: "4.1.1 Parsing",
        level: "A"
    },

    "duplicate-id-active": {
        category: "Robust",
        criterion: "4.1.1 Parsing",
        level: "A"
    },

    "duplicate-id-aria": {
        category: "Robust",
        criterion: "4.1.1 Parsing",
        level: "A"
    }
};

module.exports = wcagMappings;