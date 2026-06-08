const lighthouse = require("lighthouse").default;
const { launch } = require("chrome-launcher");

async function runLighthouse(url) {

    const chrome = await launch({
        chromeFlags: ["--headless"]
    });

    const result = await lighthouse(url, {
        port: chrome.port,
        output: "json",
        logLevel: "error"
    });

    await chrome.kill();

    return {
        accessibility:
            result.lhr.categories.accessibility.score * 100,

        performance:
            result.lhr.categories.performance.score * 100,

        bestPractices:
            result.lhr.categories["best-practices"].score * 100,

        seo:
            result.lhr.categories.seo.score * 100
    };
}

module.exports = runLighthouse;