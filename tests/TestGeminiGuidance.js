const {
    processGuidance
} = require(
    "../backend/services/guidancechain"
);

(async () => {

    const result =
        await processGuidance([

            {
                ruleId: "image-alt",
                description: "Missing alt text",
                severity: "critical",
                wcagCategory: "Perceivable",
                wcagCriterion: "1.1.1 Non-text Content",
                wcagLevel: "A",
                selector: "#logo"
            },

            {
                ruleId: "image-alt",
                description: "Missing alt text",
                severity: "critical",
                wcagCategory: "Perceivable",
                wcagCriterion: "1.1.1 Non-text Content",
                wcagLevel: "A",
                selector: "#banner"
            },

            {
                ruleId: "color-contrast",
                description: "Low contrast",
                severity: "serious",
                wcagCategory: "Perceivable",
                wcagCriterion: "1.4.3 Contrast (Minimum)",
                wcagLevel: "AA",
                selector: ".button"
            }

        ]);

    console.log(result);

})();