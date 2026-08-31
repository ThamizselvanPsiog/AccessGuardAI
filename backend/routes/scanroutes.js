const express = require("express");
const Database = require("better-sqlite3");

const router = express.Router();

const scanwebsite =
    require("../scanners/playwrightscanner");

const runlighthouse =
    require("../scanners/lighthousescanner");

const runpa11y =
    require("../scanners/pa11yscanner");

const {
    normalizeAxeViolations,
    normalizePa11yIssues
} = require("../services/normalizer");

const {
    deduplicateviolations
} = require("../services/deduplicator");

const {
    mapWCAG
} = require("../services/wcagmapper");

const {
    saveScan,
    saveViolations,
    getUserScans,
    getScanById,
    getViolationsByScanId
} = require("../services/databaseservice");

const {
    processViolations
} = require("../services/accessibilitychain");

const {
    validateFixes
} = require("../services/validationchain");

const {
    processGuidance
} = require("../services/guidancechain");

const authenticateToken =
    require("../middleware/authmiddleware");

const {
    generateScanReport
} = require("../services/reportgenerator");

const db = new Database("./backend/database/accessguard.db");


/*
 * ============================================
 * GET /api/scans
 *
 * Get scans belonging to authenticated user
 * ============================================
 */

router.get(
    "/scan",
    authenticateToken,
    async (req, res) => {

        try {

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user."
                });

            }

            const scans = getUserScans(userId);

            res.json({
                success: true,
                scans
            });

        } catch (error) {

            console.error(
                "Get scans error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to retrieve scans."
            });
        }
    }
);

/*
 * ============================================
 * GET /api/dashboard
 *
 * Get aggregated dashboard data for the
 * authenticated user.
 * ============================================
 */

router.get(
    "/dashboard",
    authenticateToken,
    async (req, res) => {

        try {

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user."
                });

            }

            /*
             * ========================================
             * TOTAL SCANS
             * ========================================
             */

            const totalScansRow = db.prepare(`
                SELECT COUNT(*) AS total
                FROM scans
                WHERE user_id = ?
            `).get(userId);

            const totalScans =
                Number(totalScansRow?.total || 0);


            /*
             * ========================================
             * TOTAL ISSUES
             * ========================================
             */

            const totalIssuesRow = db.prepare(`
                SELECT COUNT(*) AS total
                FROM violations v
                INNER JOIN scans s
                    ON v.scan_id = s.id
                WHERE s.user_id = ?
            `).get(userId);

            const totalIssues =
                Number(totalIssuesRow?.total || 0);


            /*
             * ========================================
             * AI REMEDIATION COVERAGE
             * ========================================
             *
             * Count violations that have an AI fix.
             */

            const aiFixesRow = db.prepare(`
                SELECT COUNT(*) AS total
                FROM violations v
                INNER JOIN scans s
                    ON v.scan_id = s.id
                WHERE s.user_id = ?
                AND v.ai_fix IS NOT NULL
                AND v.ai_fix != ''
                AND v.ai_fix != 'null'
            `).get(userId);

            const aiFixes =
                Number(aiFixesRow?.total || 0);


            const aiCoverage =
                totalIssues > 0
                    ? Math.round(
                        (aiFixes / totalIssues) * 100
                    )
                    : 0;


            /*
             * ========================================
             * LATEST SCAN
             * ========================================
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
             * ========================================
             * PREVIOUS SCAN
             * ========================================
             */

            const previousScan = db.prepare(`
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
                LIMIT 1 OFFSET 1
            `).get(userId);


            /*
             * ========================================
             * ACCESSIBILITY SCORE TREND
             * ========================================
             *
             * Return scans in chronological order.
             */

            const trend = db.prepare(`
                SELECT
                    id,
                    url,
                    accessibility_score,
                    scan_date
                FROM scans
                WHERE user_id = ?
                ORDER BY scan_date ASC, id ASC
            `).all(userId);


            const scoreTrend = trend.map(
                (scan, index) => ({

                    scanNumber:
                        index + 1,

                    scanId:
                        scan.id,

                    score:
                        scan.accessibility_score ?? 0,

                    url:
                        scan.url,

                    date:
                        scan.scan_date

                })
            );


            /*
             * ========================================
             * SEVERITY DISTRIBUTION
             * ========================================
             */

            const severityRows = db.prepare(`
                SELECT
                    LOWER(COALESCE(v.severity, 'unknown'))
                        AS severity,
                    COUNT(*) AS total
                FROM violations v
                INNER JOIN scans s
                    ON v.scan_id = s.id
                WHERE s.user_id = ?
                GROUP BY LOWER(COALESCE(v.severity, 'unknown'))
            `).all(userId);


            const severityMap = {

                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0

            };


            severityRows.forEach(row => {

                const severity =
                    String(
                        row.severity || ""
                    ).toLowerCase();

                if (
                    Object.prototype.hasOwnProperty.call(
                        severityMap,
                        severity
                    )
                ) {

                    severityMap[severity] =
                        Number(row.total || 0);

                }

            });


            const severity = [

                {
                    name: "Critical",
                    value: severityMap.critical
                },

                {
                    name: "Serious",
                    value: severityMap.serious
                },

                {
                    name: "Moderate",
                    value: severityMap.moderate
                },

                {
                    name: "Minor",
                    value: severityMap.minor
                }

            ];


            /*
             * ========================================
             * MOST COMMON ACCESSIBILITY RULE
             * ========================================
             */

            const topRule = db.prepare(`
                SELECT
                    v.rule_id,
                    v.description,
                    v.wcag_criterion,
                    COUNT(*) AS occurrence_count
                FROM violations v
                INNER JOIN scans s
                    ON v.scan_id = s.id
                WHERE s.user_id = ?
                GROUP BY
                    v.rule_id,
                    v.description,
                    v.wcag_criterion
                ORDER BY occurrence_count DESC
                LIMIT 1
            `).get(userId);


            /*
             * ========================================
             * CRITICAL + SERIOUS ISSUES
             * ========================================
             */

            const highPriorityRow = db.prepare(`
                SELECT COUNT(*) AS total
                FROM violations v
                INNER JOIN scans s
                    ON v.scan_id = s.id
                WHERE s.user_id = ?
                AND LOWER(v.severity) IN (
                    'critical',
                    'serious'
                )
            `).get(userId);


            const highPriorityIssues =
                Number(
                    highPriorityRow?.total || 0
                );


            /*
             * ========================================
             * LATEST SCAN ISSUE COUNT
             * ========================================
             */

            let latestScanIssues = 0;

            if (latestScan) {

                const latestIssuesRow =
                    db.prepare(`
                        SELECT COUNT(*) AS total
                        FROM violations
                        WHERE scan_id = ?
                    `).get(latestScan.id);

                latestScanIssues =
                    Number(
                        latestIssuesRow?.total || 0
                    );

            }


            /*
             * ========================================
             * PREVIOUS SCAN ISSUE COUNT
             * ========================================
             */

            let previousScanIssues = 0;

            if (previousScan) {

                const previousIssuesRow =
                    db.prepare(`
                        SELECT COUNT(*) AS total
                        FROM violations
                        WHERE scan_id = ?
                    `).get(previousScan.id);

                previousScanIssues =
                    Number(
                        previousIssuesRow?.total || 0
                    );

            }


            /*
             * ========================================
             * SCORE IMPROVEMENT
             * ========================================
             */

            let scoreImprovement = 0;

            if (
                latestScan &&
                previousScan &&
                latestScan.accessibility_score != null &&
                previousScan.accessibility_score != null
            ) {

                scoreImprovement =
                    Number(
                        latestScan.accessibility_score
                    ) -
                    Number(
                        previousScan.accessibility_score
                    );

            }


            /*
             * ========================================
             * ISSUE CHANGE
             * ========================================
             */

            let issueChange = 0;

            if (previousScan) {

                issueChange =
                    latestScanIssues -
                    previousScanIssues;

            }


            /*
             * ========================================
             * RESPONSE
             * ========================================
             */

            res.json({

                success: true,

                hasScan:
                    totalScans > 0,

                overview: {

                    totalScans,

                    totalIssues,

                    aiFixes,

                    aiCoverage,

                    highPriorityIssues

                },

                latestScan:
                    latestScan
                        ? {

                            id:
                                latestScan.id,

                            url:
                                latestScan.url,

                            scanDate:
                                latestScan.scan_date,

                            scores: {

                                accessibility:
                                    latestScan.accessibility_score,

                                performance:
                                    latestScan.performance_score,

                                bestPractices:
                                    latestScan.best_practices_score,

                                seo:
                                    latestScan.seo_score

                            },

                            issueCount:
                                latestScanIssues

                        }
                        : null,

                previousScan:
                    previousScan
                        ? {

                            id:
                                previousScan.id,

                            url:
                                previousScan.url,

                            scanDate:
                                previousScan.scan_date,

                            accessibilityScore:
                                previousScan.accessibility_score,

                            issueCount:
                                previousScanIssues

                        }
                        : null,

                comparison: {

                    scoreImprovement,

                    issueChange

                },

                scoreTrend,

                severity,

                topRule:
                    topRule
                        ? {

                            ruleId:
                                topRule.rule_id,

                            description:
                                topRule.description,

                            wcagCriterion:
                                topRule.wcag_criterion,

                            occurrences:
                                Number(
                                    topRule.occurrence_count
                                )

                        }
                        : null

            });

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to load dashboard."

            });

        }

    }
);


/*
 * ============================================
 * GET /api/scans/:id
 *
 * Get one scan belonging to authenticated user
 * ============================================
 */

router.get(
    "/scan/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user."
                });

            }

            const scanId =
                Number(req.params.id);

            if (!Number.isInteger(scanId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid scan ID."
                });

            }

            const scan =
                getScanById(
                    scanId,
                    userId
                );

            if (!scan) {

                return res.status(404).json({
                    success: false,
                    message: "Scan not found."
                });

            }

            const violations =
                getViolationsByScanId(
                    scanId
                );

            res.json({

                success: true,

                scan: {
                    id: scan.id,
                    url: scan.url,
                    scanDate: scan.scan_date,

                    scores: {
                        accessibility:
                            scan.accessibility_score,

                        performance:
                            scan.performance_score,

                        bestPractices:
                            scan.best_practices_score,

                        seo:
                            scan.seo_score
                    },

                    violations
                }

            });

        } catch (error) {

            console.error(
                "Get scan error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to retrieve scan."
            });
        }
    }
);


/*
 * ============================================
 * GET /api/scan/:scanId/report
 *
 * Generate and download PDF report
 * ============================================
 */

router.get(
    "/scan/:scanId/report",
    authenticateToken,
    async (req, res) => {

        try {

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid authenticated user."
                });

            }

            const scanId =
                Number(req.params.scanId);

            if (!Number.isInteger(scanId)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid scan ID."
                });

            }

            /*
             * ================================
             * GET SCAN
             *
             * This verifies ownership.
             * ================================
             */

            const scan =
                getScanById(
                    scanId,
                    userId
                );

            if (!scan) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Scan not found."
                });

            }

            /*
             * ================================
             * GET VIOLATIONS
             * ================================
             */

            const violations =
                db.prepare(`
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
                    ORDER BY
                        CASE severity
                            WHEN 'Critical' THEN 1
                            WHEN 'Serious' THEN 2
                            WHEN 'Moderate' THEN 3
                            WHEN 'Minor' THEN 4
                            ELSE 5
                        END,
                        id ASC
                `).all(scanId);

            /*
             * ================================
             * GENERATE PDF
             * ================================
             */

            generateScanReport(
                scan,
                violations,
                res
            );

        } catch (error) {

            console.error(
                "PDF Report Error:",
                error
            );

            /*
             * If PDF generation has not started,
             * return JSON error.
             */

            if (!res.headersSent) {

                return res.status(500).json({
                    success: false,
                    message:
                        error.message ||
                        "Unable to generate PDF report."
                });

            }

        }

    }
);


/*
 * ============================================
 * GET /api/scan/:scanId/remediation
 *
 * Get AI remediation information for a scan
 *
 * Includes:
 * - Scan information
 * - Scores
 * - Violations
 * - AI fixes
 * - Validation results
 * - AI guidance
 * - Guidance evaluation
 *
 * Requires authenticated user.
 * ============================================
 */

router.get(
    "/scan/:scanId/remediation",
    authenticateToken,
    async (req, res) => {

        try {

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user."
                });

            }


            /*
             * ========================================
             * VALIDATE SCAN ID
             * ========================================
             */

            const scanId =
                Number(req.params.scanId);

            if (!Number.isInteger(scanId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid scan ID."
                });

            }


            /*
             * ========================================
             * GET SCAN
             *
             * This also verifies that the scan
             * belongs to the authenticated user.
             * ========================================
             */

            const scan =
                getScanById(
                    scanId,
                    userId
                );

            if (!scan) {

                return res.status(404).json({
                    success: false,
                    message: "Scan not found."
                });

            }


            /*
             * ========================================
             * GET VIOLATIONS + AI DATA
             *
             * We intentionally query these fields
             * here because the existing
             * getViolationsByScanId() function
             * does not currently return:
             *
             * ai_fix
             * validation
             * guidance
             * ========================================
             */

            const violationRows =
                db.prepare(`
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
                    ORDER BY
                        CASE severity
                            WHEN 'Critical' THEN 1
                            WHEN 'Serious' THEN 2
                            WHEN 'Moderate' THEN 3
                            WHEN 'Minor' THEN 4
                            ELSE 5
                        END,
                        id ASC
                `).all(scanId);


            /*
             * ========================================
             * CONVERT DATABASE ROWS
             * ========================================
             */

            const remediation =
                violationRows.map(
                    (violation) => {

                        let aiFix = null;
                        let validation = null;
                        let guidance = null;
                        let evaluation = null;


                        /*
                         * AI FIX
                         */

                        try {

                            if (violation.ai_fix) {

                                aiFix =
                                    JSON.parse(
                                        violation.ai_fix
                                    );

                            }

                        } catch (error) {

                            console.error(
                                `Unable to parse ai_fix for violation ${violation.id}:`,
                                error.message
                            );

                        }


                        /*
                         * VALIDATION
                         */

                        try {

                            if (violation.validation) {

                                validation =
                                    JSON.parse(
                                        violation.validation
                                    );

                            }

                        } catch (error) {

                            console.error(
                                `Unable to parse validation for violation ${violation.id}:`,
                                error.message
                            );

                        }


                        /*
                         * GUIDANCE + EVALUATION
                         */

                        try {

                            if (violation.guidance) {

                                const parsedGuidance =
                                    JSON.parse(
                                        violation.guidance
                                    );


                                guidance =
                                    parsedGuidance.guidance ||
                                    null;


                                evaluation =
                                    parsedGuidance.evaluation ||
                                    null;

                            }

                        } catch (error) {

                            console.error(
                                `Unable to parse guidance for violation ${violation.id}:`,
                                error.message
                            );

                        }


                        /*
                         * RETURN FRONTEND-FRIENDLY OBJECT
                         */

                        return {

                            id:
                                violation.id,

                            source:
                                violation.source,

                            ruleId:
                                violation.rule_id,

                            severity:
                                violation.severity,

                            selector:
                                violation.selector,

                            description:
                                violation.description,

                            detectedBy:
                                safeJsonParse(
                                    violation.detected_by,
                                    []
                                ),

                            wcagCategory:
                                violation.wcag_category,

                            wcagCriterion:
                                violation.wcag_criterion,

                            wcagLevel:
                                violation.wcag_level,

                            aiFix,

                            validation,

                            guidance,

                            evaluation

                        };

                    }
                );


            /*
             * ========================================
             * SUMMARY
             * ========================================
             */

            const totalViolations =
                remediation.length;


            const criticalIssues =
                remediation.filter(
                    item =>
                        String(
                            item.severity || ""
                        ).toLowerCase() ===
                        "critical"
                ).length;


            const seriousIssues =
                remediation.filter(
                    item =>
                        String(
                            item.severity || ""
                        ).toLowerCase() ===
                        "serious"
                ).length;


            const moderateIssues =
                remediation.filter(
                    item =>
                        String(
                            item.severity || ""
                        ).toLowerCase() ===
                        "moderate"
                ).length;


            const minorIssues =
                remediation.filter(
                    item =>
                        String(
                            item.severity || ""
                        ).toLowerCase() ===
                        "minor"
                ).length;


            /*
             * ========================================
             * RESPONSE
             * ========================================
             */

            const response = {

                success: true,

                scan: {

                    id:
                        scan.id,

                    url:
                        scan.url,

                    scanDate:
                        scan.scan_date,

                    scores: {

                        accessibility:
                            scan.accessibility_score,

                        performance:
                            scan.performance_score,

                        bestPractices:
                            scan.best_practices_score,

                        seo:
                            scan.seo_score

                    }

                },

                summary: {

                    totalViolations,

                    criticalIssues,

                    seriousIssues,

                    moderateIssues,

                    minorIssues

                },

                remediation

            };


            console.log(
                "AI Remediation generated for Scan ID:",
                scanId
            );

            console.log(
                "Remediation violations:",
                remediation.length
            );


            res.json(response);


        } catch (error) {

            console.error(
                "AI Remediation Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to load AI remediation."

            });

        }

    }
);


/*
 * ============================================
 * POST /api/scan
 * ============================================
 */

router.post(
    "/scan",
    authenticateToken,
    async (req, res) => {

        try {

            const { url } = req.body;


            /*
             * ========================================
             * Validate URL
             * ========================================
             */

            if (!url || !url.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "URL is required"
                });

            }


            /*
             * ========================================
             * Authenticated User
             * ========================================
             */

            const userId = req.user.id;

            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user."
                });

            }


            const scanUrl = url.trim();


            /*
             * ========================================
             * PLAYWRIGHT / AXE
             * ========================================
             */

            console.log(
                `Starting Axe scan for ${scanUrl}`
            );

            const axeresult =
                await scanwebsite(scanUrl);


            /*
             * ========================================
             * LIGHTHOUSE
             * ========================================
             */

            console.log(
                `Starting Lighthouse scan for ${scanUrl}`
            );

            const lighthouseresults =
                await runlighthouse(scanUrl);


            /*
             * ========================================
             * PA11Y
             * ========================================
             */

            console.log(
                `Starting Pa11y scan for ${scanUrl}`
            );

            const pa11yresults =
                await runpa11y(scanUrl);


            /*
             * ========================================
             * NORMALIZE VIOLATIONS
             * ========================================
             */

            const normalizedViolations = [

                ...normalizeAxeViolations(
                    axeresult?.violations || []
                ),

                ...normalizePa11yIssues(
                    pa11yresults?.issues || []
                )

            ];


            /*
             * ========================================
             * RAW SOURCE COUNTS
             * ========================================
             */

            const axeCount =
                normalizedViolations.filter(
                    v => v.source === "axe"
                ).length;


            const pa11yCount =
                normalizedViolations.filter(
                    v => v.source === "pa11y"
                ).length;


            /*
             * ========================================
             * DEDUPLICATION
             * ========================================
             */

            const deduplicatedviolations =
                deduplicateviolations(
                    normalizedViolations
                );


            /*
             * ========================================
             * WCAG MAPPING
             * ========================================
             */

            const mappedViolations =
                mapWCAG(
                    deduplicatedviolations
                );


            /*
             * ========================================
             * AI FIX GENERATION
             * ========================================
             */

            let aiFixes = [];

            try {

                aiFixes =
                    await processViolations(
                        mappedViolations
                    );

            } catch (err) {

                console.error(
                    "AI Fix Generation Failed:",
                    err.message
                );

                aiFixes = [];

            }


            /*
             * ========================================
             * VALIDATION
             * ========================================
             */

            let validations = [];

            try {

                validations =
                    await validateFixes(
                        mappedViolations,
                        aiFixes
                    );

            } catch (err) {

                console.error(
                    "Validation Failed:",
                    err.message
                );

                validations = [];

            }


            /*
             * ========================================
             * GUIDANCE
             * ========================================
             */

            let guidance = [];

            try {

                guidance =
                    await processGuidance(
                        mappedViolations
                    );

            } catch (err) {

                console.error(
                    "Guidance generation failed:",
                    err.message
                );

                guidance = [];

            }


            /*
             * ========================================
             * SAVE SCAN
             *
             * IMPORTANT:
             * Scan now belongs to authenticated user.
             * ========================================
             */

            const scanId = saveScan(
                userId,
                scanUrl,
                {
                    accessibility:
                        lighthouseresults.accessibility,

                    performance:
                        lighthouseresults.performance,

                    bestPractices:
                        lighthouseresults.bestPractices,

                    seo:
                        lighthouseresults.seo
                }
            );


            /*
             * ========================================
             * SAVE VIOLATIONS
             * ========================================
             */

            saveViolations(
                scanId,
                mappedViolations,
                aiFixes,
                validations,
                guidance
            );


            /*
             * ========================================
             * LOGGING
             * ========================================
             */

            console.log(
                "All scanners completed."
            );

            console.log(
                "User ID:",
                userId
            );

            console.log(
                "Scan ID:",
                scanId
            );

            console.log(
                "Violations:",
                mappedViolations.length
            );

            console.log(
                "AI Fixes:",
                aiFixes.length
            );

            console.log(
                "Validations:",
                validations.length
            );

            console.log(
                "Guidance:",
                guidance.length
            );


            /*
             * ========================================
             * RESPONSE
             * ========================================
             */

            const response = {

                success: true,

                scanId,

                url: scanUrl,

                scores: {

                    accessibility:
                        lighthouseresults.accessibility,

                    performance:
                        lighthouseresults.performance,

                    bestPractices:
                        lighthouseresults.bestPractices,

                    seo:
                        lighthouseresults.seo

                },

                violations:
                    mappedViolations,

                aiFixes,

                validations,

                guidance,

                summary: {

                    totalViolations:
                        mappedViolations.length,

                    rawViolations:
                        normalizedViolations.length,

                    duplicatesRemoved:
                        normalizedViolations.length -
                        deduplicatedviolations.length,

                    axeViolations:
                        axeCount,

                    pa11yViolations:
                        pa11yCount

                }

            };


            console.log(
                "Response Size:",
                JSON.stringify(response).length,
                "bytes"
            );


            res.json(response);


        } catch (error) {

            console.error(
                "Scan Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Scan failed."

            });

        }

    }
);


/*
 * ============================================
 * SAFE JSON PARSER
 * ============================================
 */

function safeJsonParse(
    value,
    fallback
) {

    try {

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {

        return fallback;

    }

}


module.exports = router;