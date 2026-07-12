const fs = require("fs");

const report = JSON.parse(
    fs.readFileSync(
        "report.json",
        "utf8"
    )
);

let failed = false;

function gate(condition, message) {

    if (condition) {

        console.log("PASS:", message);

    } else {

        console.error("FAIL:", message);

        failed = true;

    }

}

gate(
    report.scores.accessibility >= 80,
    "Accessibility score >= 80"
);

gate(
    report.scores.performance >= 70,
    "Performance score >= 70"
);

gate(
    report.scores.bestPractices >= 80,
    "Best Practices score >= 80"
);

gate(
    report.scores.seo >= 70,
    "SEO score >= 70"
);

gate(
    report.aiFixes.length ===
    report.violations.length,
    "AI Fix coverage"
);

gate(
    report.guidance.length ===
    report.violations.length,
    "Guidance coverage"
);

gate(
    report.validations.length ===
    report.violations.length,
    "Validation coverage"
);

if (failed) {

    console.error("");

    console.error("QUALITY GATE FAILED");

    process.exit(1);

}

console.log("");

console.log("QUALITY GATE PASSED");