const db = require("../database/db");

function saveScan(url, scores) {

    const stmt = db.prepare(`
        INSERT INTO scans (
            url,
            accessibility_score,
            performance_score,
            best_practices_score,
            seo_score
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        url,
        scores.accessibility,
        scores.performance,
        scores.bestPractices,
        scores.seo
    );

    return result.lastInsertRowid;
}

function saveViolations(scanId, violations) {

    const stmt = db.prepare(`
        INSERT INTO violations (
            scan_id,
            source,
            rule_id,
            severity,
            selector,
            description,
            detected_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    violations.forEach(v => {
        stmt.run(
            scanId,
            v.source,
            v.ruleId,
            v.severity,
            v.selector,
            v.description,
            JSON.stringify(v.detectedBy || [])
        );
    });
}

module.exports = {
    saveScan,
    saveViolations
};