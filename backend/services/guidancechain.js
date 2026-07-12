const {

    generateGuidance,

    evaluateGuidance

} = require("./geminiguidancegenerator");

const BATCH_SIZE = 5;

async function processGuidance(
    violations
) {

    try {

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

        let uniqueGuidance = [];

        for (const batch of batches) {

            console.log(
                `Generating guidance for ${batch.length} rule(s)...`
            );

            const response =
                await generateGuidance(batch);

            uniqueGuidance.push(...response);

        }

        let evaluations = [];

        for (let i = 0; i < uniqueGuidance.length; i += BATCH_SIZE) {

            const batch =
                uniqueGuidance.slice(
                    i,
                    i + BATCH_SIZE
                );

            console.log(
                `Evaluating guidance for ${batch.length} rule(s)...`
            );

            const result =
                await evaluateGuidance(batch);

            evaluations.push(...result);

        }

        const guidanceMap = {};

        uniqueGuidance.forEach(g => {

            guidanceMap[g.ruleId] = {

                guidance: g

            };

        });

        evaluations.forEach(e => {

            if (guidanceMap[e.ruleId]) {

                guidanceMap[e.ruleId].evaluation = e;

            }

        });

        return violations.map(v => ({

            ruleId: v.ruleId,

            selector: v.selector,

            guidance:

                guidanceMap[v.ruleId]?.guidance ||

                {

                    summary:
                        "Guidance unavailable.",

                    whyItMatters: "",

                    howToFix: "",

                    bestPractice: "",

                    wcagReference:
                        v.wcagCriterion || "Unknown"

                },

            evaluation:

                guidanceMap[v.ruleId]?.evaluation ||

                {

                    overallScore: 0,

                    accuracy: 0,

                    clarity: 0,

                    actionability: 0,

                    wcagCompliance: 0,

                    feedback:
                        "Evaluation unavailable."

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

            },

            evaluation: {

                overallScore: 0,

                accuracy: 0,

                clarity: 0,

                actionability: 0,

                wcagCompliance: 0,

                feedback:
                    "Evaluation unavailable."

            }

        }));

    }

}

module.exports = {
    processGuidance
};