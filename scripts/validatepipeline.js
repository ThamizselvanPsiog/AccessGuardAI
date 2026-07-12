const fs = require("fs");

const report =
    JSON.parse(
        fs.readFileSync(
            "report.json",
            "utf8"
        )
    );

let failed = false;

function check(condition, message) {

    if (condition) {

        console.log("PASS:", message);

    } else {

        console.error("FAIL:", message);

        failed = true;

    }

}

check(
    report.scores &&
    report.scores.accessibility !== undefined,
    "Accessibility score exists"
);

check(
    report.violations &&
    report.violations.length > 0,
    "Violations detected"
);

check(
    report.aiFixes &&
    report.aiFixes.length === report.violations.length,
    "AI fixes generated"
);

check(
    report.validations &&
    report.validations.length === report.violations.length,
    "Validation results complete"
);

check(
    report.guidance &&
    report.guidance.length === report.violations.length,
    "Guidance generated"
);

check(
    report.summary &&
    report.summary.totalViolations ===
    report.violations.length,
    "Summary matches violations"
);

if (failed) {

    process.exit(1);

}

console.log("");

console.log("Pipeline validation successful.");