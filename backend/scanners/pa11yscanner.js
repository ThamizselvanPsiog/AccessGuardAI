const pa11y = require("pa11y");

async function runPa11y(url) {

    const results = await pa11y(url);

    return {
        issues: results.issues
    };

}

module.exports = runPa11y;