const lighthouse = require("lighthouse").default;
const { launch } = require("chrome-launcher");

async function runLighthouse(url) {
    let chrome;

    try {
        chrome = await launch({
            chromeFlags: [
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--disable-extensions",
                "--disable-background-networking"
            ]
        });

        const result = await lighthouse(url, {
            port: chrome.port,
            output: "json",
            logLevel: "error",

            settings: {
                maxWaitForLoad: 120000
            }
        });

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

    } catch (error) {
        console.error("Lighthouse Error:", error);
        throw error;
    } finally {
        if (chrome) {
            try {
                // Give Windows time to release temp files
                await new Promise(resolve =>
                    setTimeout(resolve, 2000)
                );

                await chrome.kill();
            } catch (cleanupError) {
                console.error(
                    "Chrome cleanup error:",
                    cleanupError.message
                );
            }
        }
    }
}

module.exports = runLighthouse;