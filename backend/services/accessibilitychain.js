const {
    generateFix
} = require("./AIfixgenerator");

async function processViolations(
    violations
) {

    // Step 1: Keep only one violation per ruleId

    const uniqueViolations = [

        ...new Map(

            violations.map(v => [

                v.ruleId,

                v

            ])

        ).values()

    ];

    console.log(
        `Generating AI fixes for ${uniqueViolations.length} unique rule(s)...`
    );

    // Step 2: Generate one fix per rule

    const fixMap = {};

    for (const violation of uniqueViolations) {

        try {

            fixMap[
                violation.ruleId
            ] = await generateFix(
                violation
            );

        }
        catch(err){

            console.error(
                `Groq failed for ${violation.ruleId}:`,
                err.message
            );

            fixMap[
                violation.ruleId
            ] = {

                explanation:
                    "Unable to generate fix.",

                incorrectHTML: "",

                correctedHTML: "",

                ariaFix: ""

            };

        }

    }

    // Step 3: Attach fix back to every violation

    return violations.map(v => ({

        ruleId:
            v.ruleId,

        selector:
            v.selector,

        fix:
            fixMap[
                v.ruleId
            ]

    }));

}

module.exports = {
    processViolations
};