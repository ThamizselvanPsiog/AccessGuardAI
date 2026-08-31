require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.5-flash";

/*
 * ============================================================
 * GEMINI REQUEST HELPER
 * ============================================================
 *
 * Centralizes Gemini API handling.
 *
 * Important:
 * - 429 / RESOURCE_EXHAUSTED is NOT retried.
 * - This prevents repeatedly hitting an exhausted quota.
 * - Other errors are also returned safely.
 * ============================================================
 */

async function callGemini(prompt) {

    try {

        const response =
            await ai.models.generateContent({
                model: MODEL,
                contents: prompt
            });

        return String(
            response?.text || ""
        )
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

    } catch (err) {

        const message =
            err?.message ||
            err?.error?.message ||
            String(err);

        /*
         * ================================================
         * QUOTA ERROR
         * ================================================
         */

        if (
            message.includes("429") ||
            message.includes("RESOURCE_EXHAUSTED") ||
            message
                .toLowerCase()
                .includes("quota exceeded")
        ) {

            console.error(
                "Gemini quota exceeded. Skipping this Gemini request."
            );

            return null;
        }

        /*
         * ================================================
         * OTHER GEMINI ERROR
         * ================================================
         */

        console.error(
            "Gemini API Error:",
            message
        );

        return null;
    }
}


/*
 * ============================================================
 * GENERATE GUIDANCE
 * ============================================================
 */

async function generateGuidance(violations) {

    if (
        !Array.isArray(violations) ||
        violations.length === 0
    ) {
        return [];
    }


    /*
     * ================================================
     * PREPARE VIOLATIONS
     * ================================================
     */

    const violationList =
        violations.map(v => ({
            ruleId:
                v.ruleId,

            description:
                v.description,

            severity:
                v.severity,

            wcagCategory:
                v.wcagCategory,

            wcagCriterion:
                v.wcagCriterion,

            wcagLevel:
                v.wcagLevel
        }));


    /*
     * ================================================
     * PROMPT
     * ================================================
     */

    const prompt = `
You are a senior WCAG 2.1 AA accessibility consultant.

Generate concise remediation guidance for each accessibility violation.

Requirements:

- Produce exactly one JSON object per rule.
- summary <= 40 words.
- whyItMatters <= 60 words.
- howToFix <= 80 words.
- bestPractice <= 50 words.
- Use plain English.
- Base the answer only on the supplied violation.
- Do not invent page-specific facts.
- Do not invent WCAG criteria.
- Preserve the supplied ruleId.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not use code fences.

Violations:

${JSON.stringify(
    violationList,
    null,
    2
)}

Return exactly:

[
    {
        "ruleId": "",
        "summary": "",
        "whyItMatters": "",
        "howToFix": "",
        "bestPractice": "",
        "wcagReference": ""
    }
]
`;


    /*
     * ================================================
     * CALL GEMINI
     * ================================================
     */

    const text =
        await callGemini(prompt);


    /*
     * ================================================
     * GEMINI UNAVAILABLE
     * ================================================
     *
     * IMPORTANT:
     * Return a predictable structure.
     *
     * This prevents the frontend from showing
     * completely empty guidance.
     * ================================================
     */

    if (!text) {

        return violations.map(v => ({

            ruleId:
                v.ruleId,

            summary:
                "AI guidance is temporarily unavailable for this violation.",

            whyItMatters:
                v.description ||
                "This accessibility issue may affect users of assistive technologies.",

            howToFix:
                v.wcagCriterion
                    ? `Review the violation and correct the affected element according to WCAG ${v.wcagCriterion}.`
                    : "Review the affected element and correct it according to the applicable WCAG requirement.",

            bestPractice:
                "Use semantic HTML and accessible native controls whenever possible.",

            wcagReference:
                v.wcagCriterion ||
                "Unknown",

            /*
             * Internal marker.
             *
             * guidancechain can use this to know that
             * Gemini did not generate this content.
             */
            _geminiUnavailable:
                true
        }));
    }


    /*
     * ================================================
     * PARSE JSON
     * ================================================
     */

    try {

        const parsed =
            JSON.parse(text);


        if (!Array.isArray(parsed)) {

            throw new Error(
                "Gemini guidance response was not an array."
            );
        }


        /*
         * Make sure every supplied rule has
         * a corresponding guidance object.
         */

        return violations.map(v => {

            const result =
                parsed.find(
                    item =>
                        item?.ruleId === v.ruleId
                );


            if (!result) {

                return {

                    ruleId:
                        v.ruleId,

                    summary:
                        "Guidance was not returned for this rule.",

                    whyItMatters:
                        v.description ||
                        "",

                    howToFix:
                        v.wcagCriterion
                            ? `Review the issue against WCAG ${v.wcagCriterion}.`
                            : "Review the affected element against the applicable WCAG requirement.",

                    bestPractice:
                        "Use semantic HTML and accessible native controls whenever possible.",

                    wcagReference:
                        v.wcagCriterion ||
                        "Unknown"
                };
            }


            return {

                ruleId:
                    v.ruleId,

                summary:
                    result.summary || "",

                whyItMatters:
                    result.whyItMatters || "",

                howToFix:
                    result.howToFix || "",

                bestPractice:
                    result.bestPractice || "",

                wcagReference:
                    result.wcagReference ||
                    v.wcagCriterion ||
                    "Unknown"
            };

        });

    } catch (err) {

        console.error(
            "Gemini Guidance Parse Error:",
            err.message
        );


        return violations.map(v => ({

            ruleId:
                v.ruleId,

            summary:
                "Unable to parse AI-generated guidance.",

            whyItMatters:
                v.description ||
                "",

            howToFix:
                v.wcagCriterion
                    ? `Review and correct the issue according to WCAG ${v.wcagCriterion}.`
                    : "Review the affected element against the applicable WCAG requirement.",

            bestPractice:
                "Use semantic HTML and accessible native controls whenever possible.",

            wcagReference:
                v.wcagCriterion ||
                "Unknown"
        }));
    }
}


/*
 * ============================================================
 * EVALUATE GUIDANCE
 * ============================================================
 */

async function evaluateGuidance(guidanceList) {

    if (
        !Array.isArray(guidanceList) ||
        guidanceList.length === 0
    ) {
        return [];
    }


    /*
     * ========================================================
     * IMPORTANT
     *
     * If guidance was already generated as a fallback
     * because Gemini quota was exhausted, DO NOT make
     * another Gemini request.
     *
     * This prevents:
     *
     * guidance request -> 429
     * evaluation request -> 429
     * evaluation request -> 429
     * ...
     * ========================================================
     */

    const geminiUnavailable =
        guidanceList.some(
            item =>
                item?._geminiUnavailable === true
        );


    if (geminiUnavailable) {

        console.log(
            "Skipping Gemini guidance evaluation because guidance generation was unavailable."
        );

        return guidanceList.map(g => ({

            ruleId:
                g.ruleId,

            overallScore:
                0,

            accuracy:
                0,

            clarity:
                0,

            actionability:
                0,

            wcagCompliance:
                0,

            feedback:
                "AI evaluation unavailable because Gemini guidance generation was unavailable."
        }));
    }


    /*
     * ================================================
     * EVALUATION PROMPT
     * ================================================
     */

    const prompt = `
You are acting as an LLM judge.

Evaluate the quality of each accessibility guidance.

Score each guidance from 1-5 for:

- accuracy
- clarity
- actionability
- wcagCompliance

Also provide:

- overallScore
- feedback

Requirements:

- Produce exactly one JSON object per rule.
- Preserve the supplied ruleId.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not use code fences.

Guidance:

${JSON.stringify(
    guidanceList,
    null,
    2
)}

Return:

[
    {
        "ruleId": "",
        "overallScore": 0,
        "accuracy": 0,
        "clarity": 0,
        "actionability": 0,
        "wcagCompliance": 0,
        "feedback": ""
    }
]
`;


    /*
     * ================================================
     * CALL GEMINI
     * ================================================
     */

    const text =
        await callGemini(prompt);


    /*
     * ================================================
     * GEMINI UNAVAILABLE
     * ================================================
     */

    if (!text) {

        return guidanceList.map(g => ({

            ruleId:
                g.ruleId,

            overallScore:
                0,

            accuracy:
                0,

            clarity:
                0,

            actionability:
                0,

            wcagCompliance:
                0,

            feedback:
                "AI evaluation is temporarily unavailable."
        }));
    }


    /*
     * ================================================
     * PARSE EVALUATION
     * ================================================
     */

    try {

        const parsed =
            JSON.parse(text);


        if (!Array.isArray(parsed)) {

            throw new Error(
                "Gemini evaluation response was not an array."
            );
        }


        return guidanceList.map(g => {

            const result =
                parsed.find(
                    item =>
                        item?.ruleId === g.ruleId
                );


            if (!result) {

                return {

                    ruleId:
                        g.ruleId,

                    overallScore:
                        0,

                    accuracy:
                        0,

                    clarity:
                        0,

                    actionability:
                        0,

                    wcagCompliance:
                        0,

                    feedback:
                        "Evaluation was not returned for this rule."
                };
            }


            return {

                ruleId:
                    g.ruleId,

                overallScore:
                    Number(
                        result.overallScore || 0
                    ),

                accuracy:
                    Number(
                        result.accuracy || 0
                    ),

                clarity:
                    Number(
                        result.clarity || 0
                    ),

                actionability:
                    Number(
                        result.actionability || 0
                    ),

                wcagCompliance:
                    Number(
                        result.wcagCompliance || 0
                    ),

                feedback:
                    result.feedback ||
                    ""
            };

        });

    } catch (err) {

        console.error(
            "Guidance Judge Parse Error:",
            err.message
        );


        return guidanceList.map(g => ({

            ruleId:
                g.ruleId,

            overallScore:
                0,

            accuracy:
                0,

            clarity:
                0,

            actionability:
                0,

            wcagCompliance:
                0,

            feedback:
                "Evaluation unavailable."
        }));
    }
}


/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

    generateGuidance,

    evaluateGuidance

};