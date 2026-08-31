import { motion } from "framer-motion";

import {
    FiShield,
    FiAlertTriangle,
    FiCheckCircle,
    FiAward,
} from "react-icons/fi";

export default function ScanSummary({
    scan,
    totalViolations = 0,
    issues = [],
}) {
    /*
     * ============================================
     * CALCULATE SUMMARY DATA
     * ============================================
     */

    const accessibilityScore =
        typeof scan?.scores?.accessibility === "number"
            ? Math.round(scan.scores.accessibility)
            : "--";

    const criticalIssues = issues.filter(
        (issue) =>
            String(issue.severity || "").toLowerCase() ===
            "critical"
    ).length;

    const seriousIssues = issues.filter(
        (issue) =>
            String(issue.severity || "").toLowerCase() ===
            "serious"
    ).length;

    const aiGuidedIssues = issues.filter(
        (issue) => issue.guidance
    ).length;

    /*
     * ============================================
     * ACCESSIBILITY SCORE STATUS
     * ============================================
     */

    const getScoreStatus = (score) => {
        if (typeof score !== "number") {
            return "Score unavailable";
        }

        if (score >= 90) {
            return "Excellent";
        }

        if (score >= 75) {
            return "Good";
        }

        if (score >= 50) {
            return "Needs Improvement";
        }

        return "Poor";
    };

    const scoreStatus = getScoreStatus(
        typeof accessibilityScore === "number"
            ? accessibilityScore
            : null
    );

    /*
     * ============================================
     * SUMMARY CARDS
     * ============================================
     */

    const cards = [
        {
            title: "Accessibility Score",
            value:
                typeof accessibilityScore === "number"
                    ? `${accessibilityScore}%`
                    : "--",
            subtitle: scoreStatus,
            icon: <FiShield size={26} />,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
        {
            title: "WCAG Standard",
            value: "2.1 AA",
            subtitle: "Target Standard",
            icon: <FiAward size={26} />,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
        },
        {
            title: "Total Violations",
            value: totalViolations,
            subtitle: "Issues Detected",
            icon: <FiAlertTriangle size={26} />,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        },
        {
            title: "Critical Issues",
            value: criticalIssues,
            subtitle:
                criticalIssues > 0
                    ? "Immediate Action"
                    : "No Critical Issues",
            icon: <FiAlertTriangle size={26} />,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
    ];

    /*
     * ============================================
     * OVERALL ASSESSMENT MESSAGE
     * ============================================
     */

    const getAssessment = () => {
        if (totalViolations === 0) {
            return {
                title: "Excellent Accessibility Result",
                message:
                    "No accessibility violations were detected during this scan. Your website currently meets the checks performed by the accessibility engines.",
            };
        }

        if (criticalIssues > 0) {
            return {
                title: "Immediate Attention Recommended",
                message:
                    `The scan detected ${totalViolations} accessibility violation${
                        totalViolations === 1 ? "" : "s"
                    }, including ${criticalIssues} critical issue${
                        criticalIssues === 1 ? "" : "s"
                    }. Review the AI-generated remediation recommendations below and prioritize the critical violations first.`,
            };
        }

        if (seriousIssues > 0) {
            return {
                title: "Accessibility Improvements Recommended",
                message:
                    `The scan detected ${totalViolations} accessibility violation${
                        totalViolations === 1 ? "" : "s"
                    }, including ${seriousIssues} serious issue${
                        seriousIssues === 1 ? "" : "s"
                    }. The AI remediation recommendations below provide actionable guidance for addressing these issues.`,
            };
        }

        return {
            title: "Minor Accessibility Improvements Recommended",
            message:
                `The scan detected ${totalViolations} accessibility violation${
                    totalViolations === 1 ? "" : "s"
                }. Most issues do not appear to be critical, but addressing the recommendations below can further improve accessibility compliance.`,
        };
    };

    const assessment = getAssessment();

    /*
     * ============================================
     * RENDER
     * ============================================
     */

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}

            <div>
                <h2 className="text-2xl font-semibold text-white">
                    AI Scan Summary
                </h2>

                <p className="mt-2 text-gray-400">
                    Overall accessibility assessment generated
                    from the selected scan.
                </p>

                {scan?.url && (
                    <p className="mt-2 text-sm text-cyan-400 break-all">
                        {scan.url}
                    </p>
                )}
            </div>

            {/* Summary Cards */}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <motion.div
                        key={card.title}
                        whileHover={{
                            y: -6,
                            scale: 1.02,
                        }}
                        className="
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/5
                            p-6
                            backdrop-blur-xl
                            shadow-[0_0_25px_rgba(6,182,212,0.05)]
                        "
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    {card.title}
                                </p>

                                <h3
                                    className={`
                                        mt-3
                                        text-4xl
                                        font-bold
                                        ${card.color}
                                    `}
                                >
                                    {card.value}
                                </h3>

                                <p className="mt-2 text-sm text-gray-400">
                                    {card.subtitle}
                                </p>
                            </div>

                            <div
                                className={`
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    ${card.bg}
                                    ${card.color}
                                `}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Remediation Statistics */}

            <div
                className="
                    grid
                    gap-4
                    md:grid-cols-3
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-5
                    "
                >
                    <p className="text-sm text-gray-400">
                        AI Guidance Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-cyan-400">
                        {aiGuidedIssues}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Violations with AI remediation guidance
                    </p>
                </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-5
                    "
                >
                    <p className="text-sm text-gray-400">
                        Serious Issues
                    </p>

                    <p className="mt-2 text-2xl font-bold text-orange-400">
                        {seriousIssues}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Issues requiring attention
                    </p>
                </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-5
                    "
                >
                    <p className="text-sm text-gray-400">
                        Scan Date
                    </p>

                    <p className="mt-2 text-lg font-semibold text-white">
                        {scan?.scanDate
                            ? new Date(
                                  scan.scanDate
                              ).toLocaleString()
                            : "--"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Selected accessibility scan
                    </p>
                </div>
            </div>

            {/* Overall Assessment */}

            <div
                className="
                    flex
                    items-start
                    gap-4
                    rounded-3xl
                    border
                    border-green-500/20
                    bg-green-500/5
                    p-6
                "
            >
                <FiCheckCircle
                    size={28}
                    className="mt-1 shrink-0 text-green-400"
                />

                <div>
                    <h3 className="text-lg font-semibold text-green-400">
                        {assessment.title}
                    </h3>

                    <p className="mt-2 leading-7 text-gray-300">
                        {assessment.message}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}