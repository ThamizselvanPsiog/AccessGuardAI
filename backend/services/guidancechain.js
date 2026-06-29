const {
    generateGuidance
} = require("./geminiguidancegenerator");

const BATCH_SIZE = 5;

async function processGuidance(
    violations
) {

    try {

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
            `Original Violations: ${violations.length}`
        );

        console.log(
            `Unique Rules: ${uniqueViolations.length}`
        );

        // Step 2: Split into batches

        const batches = [];

        for (
            let i = 0;
            i < uniqueViolations.length;
            i += BATCH_SIZE
        ) {

            batches.push(
                uniqueViolations.slice(
                    i,
                    i + BATCH_SIZE
                )
            );

        }

        console.log(
            `Sending ${batches.length} batch(es) to Gemini...`
        );

        // Step 3: Process each batch

        let uniqueGuidance = [];

        for (const batch of batches) {

            console.log(
                `Processing batch (${batch.length} rule(s))`
            );

            const response =
                await generateGuidance(batch);

            uniqueGuidance.push(...response);

        }

        // Step 4: Build lookup table

        const guidanceMap = {};

        uniqueGuidance.forEach(g => {

            guidanceMap[g.ruleId] = g;

        });

        // Step 5: Attach guidance back to every violation

        return violations.map(v => ({

            ruleId: v.ruleId,

            selector: v.selector,

            guidance:
                guidanceMap[v.ruleId] ||

                {

                    summary:
                        "Guidance unavailable.",

                    whyItMatters: "",

                    howToFix: "",

                    bestPractice: "",

                    wcagReference:
                        v.wcagCriterion || "Unknown"

                }

        }));

    }
    catch(err){

        console.error(
            "Gemini guidance failed:",
            err.message
        );

        return violations.map(v => ({

            ruleId: v.ruleId,

            selector: v.selector,

            guidance: {

                summary:
                    "Guidance unavailable.",

                whyItMatters: "",

                howToFix: "",

                bestPractice: "",

                wcagReference:
                    v.wcagCriterion || "Unknown"

            }

        }));

    }

}

module.exports = {
    processGuidance
};