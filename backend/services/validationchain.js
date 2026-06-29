const {
    validateFix
} = require("./fixvalidator");

async function validateFixes(
    violations,
    aiFixes
) {

    const results = [];

    const count = Math.min(
        violations.length,
        aiFixes.length
    );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        try {

            const validation =
                await validateFix(
                    violations[i],
                    aiFixes[i].fix
                );

            results.push({
                ruleId:
                    aiFixes[i].ruleId,

                validation
            });

        } catch (err) {

            results.push({
                ruleId:
                    aiFixes[i]?.ruleId ||
                    "Unknown",

                validation: {
                    status: "ERROR",
                    message:
                        err.message
                }
            });
        }
    }

    return results;
}

module.exports = {
    validateFixes
};