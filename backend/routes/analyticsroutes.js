const express = require("express");

const router = express.Router();

const db = require("../database/db");

const authenticateToken = require("../middleware/authmiddleware");

/*
 * ============================================
 * GET ANALYTICS
 * ============================================
 *
 * Returns analytics for the logged-in user's
 * latest accessibility scan.
 *
 * Requires:
 *
 * Authorization: Bearer <JWT>
 *
 */

router.get("/", authenticateToken, async (req, res) => {
    try {

        const userId = req.user.id;

        console.log("Analytics request for User ID:", userId);

        /*
         * ============================================
         * FIND LATEST SCAN
         * ============================================
         */

        const latestScan = db.prepare(`
            SELECT
                id,
                url,
                accessibility_score,
                performance_score,
                best_practices_score,
                seo_score,
                scan_date
            FROM scans
            WHERE user_id = ?
            ORDER BY scan_date DESC, id DESC
            LIMIT 1
        `).get(userId);

        /*
         * No scans yet
         */

        if (!latestScan) {
            return res.json({
                success: true,
                hasScan: false,
                scan: null,
                severity: [],
                detectionSources: [],
                topRules: []
            });
        }

        const scanId = latestScan.id;

        /*
         * ============================================
         * SEVERITY DISTRIBUTION
         * ============================================
         */

        const severityRows = db.prepare(`
            SELECT
                severity,
                COUNT(*) AS count
            FROM violations
            WHERE scan_id = ?
            GROUP BY severity
        `).all(scanId);

        const severityOrder = [
            "Critical",
            "Serious",
            "Moderate",
            "Minor"
        ];

        const severity = severityOrder.map(level => {

            const row = severityRows.find(
                item =>
                    String(item.severity || "").toLowerCase() ===
                    level.toLowerCase()
            );

            return {
                name: level,
                value: row ? row.count : 0
            };
        });

        /*
         * ============================================
         * DETECTION SOURCES
         * ============================================
         */

        const sourceRows = db.prepare(`
            SELECT
                source,
                COUNT(*) AS count
            FROM violations
            WHERE scan_id = ?
            GROUP BY source
        `).all(scanId);

        const detectionSources = [
            {
                engine: "Axe",
                issues: 0
            },
            {
                engine: "Pa11y",
                issues: 0
            }
        ];

        sourceRows.forEach(row => {

            const source =
                String(row.source || "").toLowerCase();

            if (source === "axe") {
                detectionSources[0].issues = row.count;
            }

            if (source === "pa11y") {
                detectionSources[1].issues = row.count;
            }

        });

        /*
         * ============================================
         * TOP ACCESSIBILITY RULES
         * ============================================
         */

        const ruleRows = db.prepare(`
            SELECT
                rule_id,
                severity,
                COUNT(*) AS count
            FROM violations
            WHERE scan_id = ?
            GROUP BY rule_id, severity
            ORDER BY count DESC
            LIMIT 10
        `).all(scanId);

        const topRules = ruleRows.map(row => ({
            rule: row.rule_id,
            severity: row.severity,
            count: row.count
        }));

        /*
         * ============================================
         * TOTAL ISSUES
         * ============================================
         */

        const totalIssues = db.prepare(`
            SELECT COUNT(*) AS count
            FROM violations
            WHERE scan_id = ?
        `).get(scanId);

        /*
         * ============================================
         * RESPONSE
         * ============================================
         */

        const response = {
            success: true,

            hasScan: true,

            scan: {
                id: latestScan.id,
                url: latestScan.url,
                scanDate: latestScan.scan_date,

                scores: {
                    accessibility:
                        latestScan.accessibility_score,

                    performance:
                        latestScan.performance_score,

                    bestPractices:
                        latestScan.best_practices_score,

                    seo:
                        latestScan.seo_score
                }
            },

            totalIssues: totalIssues.count,

            severity,

            detectionSources,

            topRules
        };

        console.log(
            "Analytics generated for Scan ID:",
            scanId
        );

        res.json(response);

    } catch (error) {

        console.error(
            "Analytics Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load analytics."
        });

    }
});

module.exports = router;