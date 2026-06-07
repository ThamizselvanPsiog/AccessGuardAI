const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

async function scanweb(url) {

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    try {

    await page.goto(url, {
        waitUntil: "load",
        timeout: 60000
    });

    } catch (error) {

    throw new Error(
        `Unable to load website: ${error.message}`
    );

    }
    
    const title = await page.title();

    const accessibilityResults =
        await new AxeBuilder({ page }).analyze();

    await browser.close();

    return {
        url,
        title: title,
        violations: accessibilityResults.violations,
        passes: accessibilityResults.passes.length,
        incomplete: accessibilityResults.incomplete.length
    };
}

module.exports = scanweb;