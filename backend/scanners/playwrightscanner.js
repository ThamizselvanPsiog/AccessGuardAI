const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

async function scanweb(url) {

    let browser;

    try{
        browser = await chromium.launch({
            headless: true
        });
    
        const context = await browser.newContext();
    
        const page = await context.newPage();
    
        await page.goto(url, {
            waitUntil: "load",
            timeout: 60000
        });
        
        const title = await page.title();
    
        const accessibilityResults =
            await new AxeBuilder({ page }).analyze();
    
    
        return {
            url,
            title: title,
            violations: accessibilityResults.violations,
            passes: accessibilityResults.passes.length,
            incomplete: accessibilityResults.incomplete.length
        };
    }
    catch(error){
        throw new Error(
            `Unable to load website: ${error.message}`
        );
    }
    finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
}

module.exports = scanweb;