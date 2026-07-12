require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateGuidance(violations) {

    if (!violations.length) {
        return [];
    }

    const violationList = violations.map(v => ({

        ruleId: v.ruleId,

        description: v.description,

        severity: v.severity,

        wcagCategory: v.wcagCategory,

        wcagCriterion: v.wcagCriterion,

        wcagLevel: v.wcagLevel

    }));

    const prompt = `
You are a senior WCAG 2.1 AA accessibility consultant.

Generate concise remediation guidance for each accessibility violation.

Requirements:
- Produce one JSON object per rule.
- summary <= 40 words.
- whyItMatters <= 60 words.
- howToFix <= 80 words.
- bestPractice <= 50 words.
- Use plain English.
- Return ONLY a JSON array.

Violations:

${JSON.stringify(violationList, null, 2)}

Return:

[
    {
        "ruleId":"",
        "summary":"",
        "whyItMatters":"",
        "howToFix":"",
        "bestPractice":"",
        "wcagReference":""
    }
]
`;

    const response =
        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt

        });

    const text =
        String(response.text)
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

    try {

        return JSON.parse(text);

    } catch(err){

        console.error(
            "Gemini Guidance Parse Error:",
            err.message
        );

        return violations.map(v => ({

            ruleId: v.ruleId,

            summary: "Unable to generate guidance.",

            whyItMatters: "",

            howToFix: "",

            bestPractice: "",

            wcagReference:
                v.wcagCriterion || "Unknown"

        }));

    }

}

async function evaluateGuidance(guidanceList) {

    if (!guidanceList.length) {
        return [];
    }

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

Return ONLY valid JSON.

Example:

[
    {
        "ruleId":"image-alt",
        "overallScore":4.8,
        "accuracy":5,
        "clarity":5,
        "actionability":4,
        "wcagCompliance":5,
        "feedback":"Excellent guidance."
    }
]

Guidance:

${JSON.stringify(guidanceList, null, 2)}
`;

    const response =
        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt

        });

    const text =
        String(response.text)
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

    try {

        return JSON.parse(text);

    } catch(err){

        console.error(
            "Guidance Judge Parse Error:",
            err.message
        );

        return guidanceList.map(g => ({

            ruleId: g.ruleId,

            overallScore: 0,

            accuracy: 0,

            clarity: 0,

            actionability: 0,

            wcagCompliance: 0,

            feedback: "Evaluation unavailable."

        }));

    }

}

module.exports = {

    generateGuidance,

    evaluateGuidance

};