const {
    validateFix
} = require("./fixvalidator");

async function validateFixes(
    violations,
    aiFixes
) {

    // Step 1: Keep one violation + fix per unique ruleId

    const uniqueRules = [];

    const seen = new Set();

    for (let i = 0; i < violations.length; i++) {

        const ruleId = violations[i].ruleId;

        if (!seen.has(ruleId)) {

            seen.add(ruleId);

            uniqueRules.push({

                violation: violations[i],

                fix: aiFixes[i]?.fix,

                ruleId

            });

        }

    }

    console.log(
        `Validating ${uniqueRules.length} unique rule(s)...`
    );

    // Step 2: Validate only unique rules

    const validationMap = {};

    for (const rule of uniqueRules) {

        try {

            validationMap[rule.ruleId] =
                await validateFix(
                    rule.violation,
                    rule.fix
                );

        } catch (err) {

            validationMap[rule.ruleId] = {

                status: "ERROR",

                message: err.message

            };

        }

    }

    // Step 3: Map validation back to every occurrence

    return violations.map(v => ({

        ruleId: v.ruleId,

        selector: v.selector,

        validation:
            validationMap[v.ruleId]

    }));

}

module.exports = {
    validateFixes
};