const wcagMappings = require("./wcagmappings");

function mapWCAG(violations) {

    return violations.map(v => {

        const mapping =
            wcagMappings[v.ruleId];

        return {
            ...v,

            wcagCategory:
                mapping?.category ||
                "Unknown",

            wcagCriterion:
                mapping?.criterion ||
                "Unknown",

            wcagLevel:
                mapping?.level ||
                "Unknown"
        };
    });
}

module.exports = {
    mapWCAG
};