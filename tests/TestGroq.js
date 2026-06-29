const {
    generateFix
} = require(
    "../backend/services/AIFixgenerator"
);

(async () => {

    const result =
        await generateFix({
            ruleId: "image-alt",
            description:
                "Image missing alt text",
            wcagCriterion:
                "1.1.1 Non-text Content"
        });

    console.log(result);

})();