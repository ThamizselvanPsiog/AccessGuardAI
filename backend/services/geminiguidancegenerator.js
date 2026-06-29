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
- Produce one JSON object for each rule.
- Keep each field concise.
- summary: maximum 40 words.
- whyItMatters: maximum 60 words.
- howToFix: maximum 80 words.
- bestPractice: maximum 50 words.
- Use plain English suitable for web developers.
- Do not repeat the violation description.
- Use the provided WCAG information where applicable.
- Return the same number of objects as the number of violations provided.

Violations:

${JSON.stringify(violationList, null, 2)}

Return ONLY a valid JSON array.

Example:

[
  {
    "ruleId": "image-alt",
    "summary": "",
    "whyItMatters": "",
    "howToFix": "",
    "bestPractice": "",
    "wcagReference": ""
  }
]

Do NOT include:
- Markdown
- Triple backticks
- Explanations
- Additional text
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

    }
    catch(err){

        console.error(
            "Gemini JSON Parse Error:",
            err.message
        );

        console.error(text);

        return violations.map(v => ({

            ruleId: v.ruleId,

            summary:
                "Unable to generate guidance.",

            whyItMatters: "",

            howToFix: "",

            bestPractice: "",

            wcagReference:
                v.wcagCriterion || "Unknown"

        }));

    }

}

module.exports = {
    generateGuidance
};