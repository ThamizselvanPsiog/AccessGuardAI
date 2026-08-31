require("dotenv").config();

const { ChatGroq } = require("@langchain/groq");

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b"
});

async function generateFix(violation) {

    const prompt = `
You are a WCAG 2.1 AA accessibility expert.

Violation:
Rule: ${violation.ruleId}
Description: ${violation.description}
WCAG: ${violation.wcagCriterion}

Return ONLY valid JSON in exactly this format:

{
    "explanation": "",
    "incorrectHTML": "",
    "correctedHTML": "",
    "ariaFix": ""
}

Rules:
- explanation: briefly explain the problem.
- incorrectHTML: show the problematic HTML.
- correctedHTML: show the corrected HTML.
- ariaFix: provide the ARIA fix only if needed; otherwise use "".
- Do not use markdown.
- Do not use code fences.
- Do not add any other fields.
`;

    const response = await model.invoke(prompt);

    let content = String(response.content)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    /*
     * Handle accidental extra text around JSON.
     */
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
        content = content.substring(start, end + 1);
    }

    const result = JSON.parse(content);

    /*
     * Always return the exact structure expected
     * by the frontend/database.
     */
    return {
        explanation: result.explanation || "",
        incorrectHTML: result.incorrectHTML || "",
        correctedHTML: result.correctedHTML || "",
        ariaFix: result.ariaFix || ""
    };
}

module.exports = {
    generateFix
};