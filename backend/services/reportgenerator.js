const PDFDocument = require("pdfkit");

function generateScanReport(scan, violations, res) {

    const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true
    });

    /*
     * ============================================
     * RESPONSE HEADERS
     * ============================================
     */

    const safeName = String(scan.url || "scan")
        .replace(/^https?:\/\//i, "")
        .replace(/[^a-z0-9.-]/gi, "_")
        .substring(0, 80);

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="accessguard-${safeName}-${scan.id}.pdf"`
    );

    doc.pipe(res);

    /*
     * ============================================
     * COLORS
     * ============================================
     */

    const cyan = "#06B6D4";
    const dark = "#111827";
    const gray = "#6B7280";
    const lightGray = "#F3F4F6";
    const red = "#DC2626";
    const orange = "#EA580C";
    const yellow = "#CA8A04";
    const green = "#16A34A";

    /*
     * ============================================
     * HELPER FUNCTIONS
     * ============================================
     */

    function title(text) {

        doc
            .fontSize(22)
            .fillColor(dark)
            .font("Helvetica-Bold")
            .text(text);

        doc.moveDown(0.5);
    }

    function sectionTitle(text) {

        if (doc.y > 720) {
            doc.addPage();
        }

        doc
            .moveDown(0.7)
            .fontSize(15)
            .fillColor(cyan)
            .font("Helvetica-Bold")
            .text(text);

        doc.moveDown(0.35);
    }

    function labelValue(label, value) {

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor(dark)
            .text(`${label}: `, {
                continued: true
            })
            .font("Helvetica")
            .fillColor(gray)
            .text(value == null ? "N/A" : String(value));

        doc.moveDown(0.15);
    }

    function parseJSON(value, fallback = null) {

        if (!value) {
            return fallback;
        }

        try {
            return typeof value === "string"
                ? JSON.parse(value)
                : value;
        } catch {
            return fallback;
        }
    }

    function severityColor(severity) {

        switch (
            String(severity || "").toLowerCase()
        ) {

            case "critical":
                return red;

            case "serious":
                return orange;

            case "moderate":
                return yellow;

            case "minor":
                return green;

            default:
                return gray;
        }
    }

    function issueBox(violation) {

        if (doc.y > 650) {
            doc.addPage();
        }

        const startY = doc.y;

        doc
            .roundedRect(
                45,
                startY,
                505,
                32,
                6
            )
            .fillColor(lightGray)
            .fill();

        doc
            .fontSize(13)
            .font("Helvetica-Bold")
            .fillColor(dark)
            .text(
                violation.rule_id || "Unknown Rule",
                58,
                startY + 8
            );

        doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor(
                severityColor(
                    violation.severity
                )
            )
            .text(
                String(
                    violation.severity || "Unknown"
                ).toUpperCase(),
                430,
                startY + 9
            );

        doc.y = startY + 42;
    }

    function writeLongText(label, value) {

        if (!value) {
            return;
        }

        if (doc.y > 690) {
            doc.addPage();
        }

        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor(dark)
            .text(label);

        doc
            .moveDown(0.2)
            .fontSize(9)
            .font("Helvetica")
            .fillColor(gray)
            .text(String(value), {
                width: 495,
                lineGap: 2
            });

        doc.moveDown(0.5);
    }

    /*
     * ============================================
     * REPORT HEADER
     * ============================================
     */

    doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .fillColor(cyan)
        .text("AccessGuard");

    doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(dark)
        .text("Accessibility Scan Report");

    doc.moveDown(1);

    labelValue(
        "Website",
        scan.url
    );

    labelValue(
        "Scan ID",
        scan.id
    );

    labelValue(
        "Scan Date",
        scan.scan_date
    );

    /*
     * ============================================
     * SCORE SUMMARY
     * ============================================
     */

    sectionTitle("Accessibility Overview");

    const scores = [
        [
            "Accessibility",
            scan.accessibility_score
        ],
        [
            "Performance",
            scan.performance_score
        ],
        [
            "Best Practices",
            scan.best_practices_score
        ],
        [
            "SEO",
            scan.seo_score
        ]
    ];

    scores.forEach(([name, score]) => {

        const value =
            score == null
                ? "N/A"
                : `${score}%`;

        doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .fillColor(dark)
            .text(name, {
                continued: true
            })
            .font("Helvetica")
            .fillColor(
                score >= 90
                    ? green
                    : score >= 70
                        ? yellow
                        : red
            )
            .text(`  ${value}`);

        doc.moveDown(0.3);
    });

    /*
     * ============================================
     * ISSUE SUMMARY
     * ============================================
     */

    sectionTitle("Issue Summary");

    const total = violations.length;

    const critical =
        violations.filter(
            v =>
                String(v.severity || "")
                    .toLowerCase() === "critical"
        ).length;

    const serious =
        violations.filter(
            v =>
                String(v.severity || "")
                    .toLowerCase() === "serious"
        ).length;

    const moderate =
        violations.filter(
            v =>
                String(v.severity || "")
                    .toLowerCase() === "moderate"
        ).length;

    const minor =
        violations.filter(
            v =>
                String(v.severity || "")
                    .toLowerCase() === "minor"
        ).length;

    labelValue("Total Issues", total);
    labelValue("Critical", critical);
    labelValue("Serious", serious);
    labelValue("Moderate", moderate);
    labelValue("Minor", minor);

    /*
     * ============================================
     * VIOLATIONS
     * ============================================
     */

    sectionTitle("Detailed Accessibility Findings");

    if (!violations.length) {

        doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor(green)
            .text(
                "No accessibility violations were detected."
            );

    } else {

        violations.forEach(
            (violation, index) => {

                issueBox(violation);

                labelValue(
                    "Issue",
                    `${index + 1} of ${violations.length}`
                );

                labelValue(
                    "Rule",
                    violation.rule_id
                );

                labelValue(
                    "Severity",
                    violation.severity
                );

                labelValue(
                    "WCAG Category",
                    violation.wcag_category
                );

                labelValue(
                    "WCAG Criterion",
                    violation.wcag_criterion
                );

                labelValue(
                    "WCAG Level",
                    violation.wcag_level
                );

                labelValue(
                    "Selector",
                    violation.selector
                );

                writeLongText(
                    "Description",
                    violation.description
                );

                /*
                 * ==================================
                 * AI FIX
                 * ==================================
                 */

                const aiFix =
                    parseJSON(
                        violation.ai_fix
                    );

                if (aiFix) {

                    sectionTitle(
                        "AI Generated Fix"
                    );

                    writeLongText(
                        "Explanation",
                        aiFix.explanation
                    );

                    writeLongText(
                        "Incorrect Code",
                        aiFix.incorrectHTML
                    );

                    writeLongText(
                        "Corrected Code",
                        aiFix.correctedHTML
                    );

                    writeLongText(
                        "ARIA Fix",
                        aiFix.ariaFix
                    );
                }

                /*
                 * ==================================
                 * VALIDATION
                 * ==================================
                 */

                const validation =
                    parseJSON(
                        violation.validation
                    );

                if (validation) {

                    sectionTitle(
                        "AI Fix Validation"
                    );

                    writeLongText(
                        "Validation Result",
                        validation.validation ||
                        validation.result ||
                        validation.status
                    );

                    writeLongText(
                        "Explanation",
                        validation.explanation
                    );
                }

                /*
                 * ==================================
                 * GUIDANCE
                 * ==================================
                 */

                const guidanceData =
                    parseJSON(
                        violation.guidance
                    );

                if (guidanceData) {

                    const guidance =
                        guidanceData.guidance ||
                        guidanceData;

                    const evaluation =
                        guidanceData.evaluation;

                    sectionTitle(
                        "AI Remediation Guidance"
                    );

                    writeLongText(
                        "Summary",
                        guidance.summary
                    );

                    writeLongText(
                        "Why It Matters",
                        guidance.whyItMatters
                    );

                    writeLongText(
                        "How To Fix",
                        guidance.howToFix
                    );

                    writeLongText(
                        "Best Practice",
                        guidance.bestPractice
                    );

                    writeLongText(
                        "WCAG Reference",
                        guidance.wcagReference
                    );

                    /*
                     * ==============================
                     * GUIDANCE EVALUATION
                     * ==============================
                     */

                    if (evaluation) {

                        sectionTitle(
                            "AI Guidance Evaluation"
                        );

                        labelValue(
                            "Overall Score",
                            evaluation.overallScore
                        );

                        labelValue(
                            "Accuracy",
                            evaluation.accuracy
                        );

                        labelValue(
                            "Clarity",
                            evaluation.clarity
                        );

                        labelValue(
                            "Actionability",
                            evaluation.actionability
                        );

                        labelValue(
                            "WCAG Compliance",
                            evaluation.wcagCompliance
                        );

                        writeLongText(
                            "Feedback",
                            evaluation.feedback
                        );
                    }
                }

                doc.moveDown(1);
            }
        );
    }

    /*
     * ============================================
     * FOOTER
     * ============================================
     */

    const range =
        doc.bufferedPageRange();

    for (
        let i = range.start;
        i < range.start + range.count;
        i++
    ) {

        doc.switchToPage(i);

        doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor(gray)
            .text(
                `AccessGuard • Scan ${scan.id} • Page ${i + 1} of ${range.count}`,
                45,
                805,
                {
                    align: "center",
                    width: 505
                }
            );
    }

    doc.end();
}

module.exports = {
    generateScanReport
};