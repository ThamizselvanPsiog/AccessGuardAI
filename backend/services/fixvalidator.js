const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

async function validateFix(violation, fix) {

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext();

    try {

        const page = await context.newPage();

        const correctedHTML =
            fix?.correctedHTML || "";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Accessibility Validation</title>
</head>
<body>
${correctedHTML}
</body>
</html>
`;

        await page.setContent(html, {
            waitUntil: "domcontentloaded"
        });

        const results = await new AxeBuilder({
            page
        }).analyze();

        const matchingViolation =
            results.violations.find(
                v => v.id === violation.ruleId
            );

        return {

            status:
                matchingViolation
                    ? "FAIL"
                    : "PASS",

            remainingViolations:
                results.violations.length,

            violationStillExists:
                Boolean(matchingViolation)

        };

    } finally {

        await context.close();
        await browser.close();

    }
}

module.exports = {
    validateFix
};