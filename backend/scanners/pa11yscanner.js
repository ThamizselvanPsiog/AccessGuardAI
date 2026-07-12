const pa11y = require("pa11y");

async function runPa11y(url) {

    const results = await pa11y(url, {

        chromeLaunchConfig: {

            executablePath: process.env.CHROME_BIN,

            args: [

                "--headless",

                "--no-sandbox",

                "--disable-setuid-sandbox",

                "--disable-dev-shm-usage",

                "--disable-gpu"

            ]

        }

    });

    return {

        issues: results.issues

    };

}

module.exports = runPa11y;