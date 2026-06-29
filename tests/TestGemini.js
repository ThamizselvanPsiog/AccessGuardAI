const {
    generateGuidance
} = require(
    "../backend/services/geminiguidancegenerator"
);

(async () => {

    const result =
        await generateGuidance([

            {

                ruleId: "image-alt",

                description:
                    "Images must have alternative text.",

                severity: "critical",

                wcagCategory: "Perceivable",

                wcagCriterion:
                    "1.1.1 Non-text Content",

                wcagLevel: "A"

            },

            {

                ruleId: "color-contrast",

                description:
                    "Insufficient color contrast.",

                severity: "serious",

                wcagCategory: "Perceivable",

                wcagCriterion:
                    "1.4.3 Contrast (Minimum)",

                wcagLevel: "AA"

            }

        ]);

    console.log(result);

})();