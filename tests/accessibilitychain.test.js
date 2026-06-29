const {
    processViolations
} = require(
    "../backend/services/accessibilitychain"
);

(async () => {

    const results =
        await processViolations([
            {
                ruleId: "image-alt",
                description:
                    "Image missing alt text",
                wcagCriterion:
                    "1.1.1 Non-text Content"
            },

            {
                ruleId: "color-contrast",
                description:
                    "Insufficient contrast",
                wcagCriterion:
                    "1.4.3 Contrast (Minimum)"
            }
        ]);

    console.log(results);

})();