const {
    generateFix
} = require("./AIfixgenerator");

async function processViolations(
    violations
) {

    const fixes = [];

    for (const violation of violations) {

        try {

            const fix =
                await generateFix(
                    violation
                );

            fixes.push({
                ruleId:
                    violation.ruleId,

                fix
            });

        } catch (err) {

            fixes.push({
                ruleId:
                    violation.ruleId,

                error:
                    err.message
            });
        }
    }

    return fixes;
}

module.exports = {
    processViolations
};