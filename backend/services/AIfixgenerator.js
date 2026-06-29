require("dotenv").config();

const { ChatGroq } =
    require("@langchain/groq");

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile"
});

async function generateFix(violation) {

    const prompt = `
You are a WCAG 2.1 AA accessibility expert.

Violation:
Rule: ${violation.ruleId}
Description: ${violation.description}
WCAG: ${violation.wcagCriterion}

Generate:

1. Explanation
2. Incorrect HTML
3. Corrected HTML
4. ARIA fix if needed

Return valid JSON only.
Do not use markdown.
Do not use code fences.
Do not include explanations outside JSON.
`;

    const response =
        await model.invoke(prompt);

    return JSON.parse(response.content);
}

module.exports = {
    generateFix
};