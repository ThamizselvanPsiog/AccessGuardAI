function deduplicateviolations(violations) {

    const unique = new Map();

    violations.forEach(issue => {

        const rule =
            issue.ruleId ||
            issue.code ||
            issue.id ||
            "unknown";

        const selector =
            issue.selector ||
            issue.target ||
            "unknown";

        const key = `${rule}|${selector}`;

        if (!unique.has(key)) {

            unique.set(key, {
                ...issue,
                detectedBy: [issue.source]
            });

        } else {

            const existing = unique.get(key);

            if (!existing.detectedBy.includes(issue.source)) {
                existing.detectedBy.push(issue.source);
            }

            unique.set(key, existing);
        }
    });

    console.log(
        "Before:", violations.length,
        "After:", unique.size
    );

    return [...unique.values()];
}

module.exports = {
    deduplicateviolations
};