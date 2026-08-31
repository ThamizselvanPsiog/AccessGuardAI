const db = require("../database/db");


/*
 * ============================================
 * SAVE SCAN
 * ============================================
 */

function saveScan(userId, url, scores) {

    const stmt = db.prepare(`
        INSERT INTO scans (
            user_id,
            url,
            accessibility_score,
            performance_score,
            best_practices_score,
            seo_score
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        userId,
        url,
        scores.accessibility,
        scores.performance,
        scores.bestPractices,
        scores.seo
    );

    return result.lastInsertRowid;
}


/*
 * ============================================
 * SAVE VIOLATIONS
 * ============================================
 */

function saveViolations(
    scanId,
    violations,
    aiFixes = [],
    validations = [],
    guidance = []

) {

    const stmt = db.prepare(`
        INSERT INTO violations (
            scan_id,
            source,
            rule_id,
            severity,
            selector,
            description,
            detected_by,
            wcag_category,
            wcag_criterion,
            wcag_level,
            ai_fix,
            validation,
            guidance
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const aiFixMap = {};
    const validationMap = {};
    const guidanceMap = {};

    aiFixes.forEach(item => {
        aiFixMap[item.ruleId] = item.fix;
    });

    validations.forEach(item => {
        validationMap[item.ruleId] =
            item.validation;
    });

    guidance.forEach(item => {
        guidanceMap[item.ruleId] = {
            guidance: item.guidance,
            evaluation: item.evaluation
        };
    });

    violations.forEach(v => {

        stmt.run(
            scanId,
            v.source,
            v.ruleId,
            v.severity,
            v.selector,
            v.description,
            JSON.stringify(v.detectedBy || []),
            v.wcagCategory,
            v.wcagCriterion,
            v.wcagLevel,
            JSON.stringify(
                aiFixMap[v.ruleId] || null
            ),
            JSON.stringify(
                validationMap[v.ruleId] || null
            ),
            JSON.stringify(
                guidanceMap[v.ruleId] || null
            )
        );

    });
}

/*
 * ============================================
 * GET ALL SCANS FOR USER
 * ============================================
 */

function getUserScans(userId) {

    const stmt = db.prepare(`
        SELECT
            s.id,
            s.user_id,
            s.url,
            s.accessibility_score,
            s.performance_score,
            s.best_practices_score,
            s.seo_score,
            s.scan_date,

            (
                SELECT COUNT(*)
                FROM violations v
                WHERE v.scan_id = s.id
            ) AS issue_count

        FROM scans s

        WHERE s.user_id = ?

        ORDER BY s.scan_date DESC
    `);

    return stmt.all(userId);
}


/*
 * ============================================
 * GET SINGLE SCAN FOR USER
 * ============================================
 */

function getScanById(scanId, userId) {

    const stmt = db.prepare(`
        SELECT
            id,
            user_id,
            url,
            accessibility_score,
            performance_score,
            best_practices_score,
            seo_score,
            scan_date
        FROM scans
        WHERE id = ?
        AND user_id = ?
    `);

    return stmt.get(scanId, userId);
}


/*
 * ============================================
 * GET VIOLATIONS FOR SCAN
 * ============================================
 */

function getViolationsByScanId(scanId) {

    const stmt = db.prepare(`
        SELECT
            id,
            scan_id,
            source,
            rule_id,
            severity,
            selector,
            description,
            detected_by,
            wcag_category,
            wcag_criterion,
            wcag_level,
            ai_fix,
            validation,
            guidance
        FROM violations
        WHERE scan_id = ?
        ORDER BY id ASC
    `);

    return stmt.all(scanId);
}


module.exports = {
    saveScan,
    saveViolations,
    getUserScans,
    getScanById,
    getViolationsByScanId
};