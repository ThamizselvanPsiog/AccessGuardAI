import { motion } from "framer-motion";

import {
    FiAlertTriangle,
    FiBookOpen,
    FiCheckCircle,
    FiCode,
    FiInfo,
    FiTool,
    FiShield,
    FiXCircle,
} from "react-icons/fi";

/*
 * ============================================
 * SEVERITY COLORS
 * ============================================
 */

const severityColors = {
    Critical:
        "bg-red-500/20 text-red-400 border-red-500/20",

    Serious:
        "bg-orange-500/20 text-orange-400 border-orange-500/20",

    Moderate:
        "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",

    Minor:
        "bg-green-500/20 text-green-400 border-green-500/20",
};

/*
 * ============================================
 * RULE TITLES
 * ============================================
 */

const ruleTitles = {
    "color-contrast": "Color Contrast Issues",
    "image-alt": "Missing Alternative Text",
    "heading-order": "Incorrect Heading Order",
    label: "Missing Form Labels",
    region: "Missing Landmark Region",
    "landmark-one-main": "Missing Main Landmark",
    "link-name": "Unnamed Links",
    "button-name": "Unnamed Buttons",
    "html-has-lang": "Missing Language Declaration",
    "document-title": "Missing Document Title",
};

/*
 * ============================================
 * MAIN COMPONENT
 * ============================================
 */

export default function IssueCard({ issue }) {
    if (!issue) {
        return null;
    }

    const guidance =
        issue.guidance &&
        typeof issue.guidance === "object"
            ? issue.guidance
            : {};

    const aiFix =
        issue.aiFix &&
        typeof issue.aiFix === "object"
            ? issue.aiFix
            : {};

    const validation =
        issue.validation &&
        typeof issue.validation === "object"
            ? issue.validation
            : {};

    const evaluation =
        issue.evaluation &&
        typeof issue.evaluation === "object"
            ? issue.evaluation
            : {};

    const severity =
        issue.severity || "Unknown";

    const severityClass =
        severityColors[severity] ||
        "bg-gray-500/20 text-gray-400 border-gray-500/20";

    const ruleId =
        issue.ruleId ||
        issue.rule_id ||
        "Unknown Rule";

    const title =
        ruleTitles[ruleId] ||
        ruleId;

    /*
     * ============================================
     * VALIDATION STATUS
     * ============================================
     */

    const validationStatus =
        validation.status ||
        validation.result ||
        validation.validationStatus ||
        validation.validation_status ||
        "";

    const normalizedValidationStatus =
        String(validationStatus)
            .trim()
            .toUpperCase();

    const isValidationSuccess =
        [
            "VALID",
            "PASS",
            "PASSED",
            "SUCCESS",
            "SUCCESSFUL",
        ].includes(
            normalizedValidationStatus
        );

    const isValidationError =
        [
            "ERROR",
            "INVALID",
            "FAIL",
            "FAILED",
        ].includes(
            normalizedValidationStatus
        );

    /*
     * ============================================
     * GUIDANCE VALUES
     * ============================================
     */

    const guidanceSummary =
        guidance.summary ||
        guidance.description ||
        guidance.explanation ||
        guidance.guidance ||
        guidance.recommendation;

    const guidanceWhy =
        guidance.whyItMatters ||
        guidance.why_it_matters ||
        guidance.impact ||
        guidance.why ||
        guidance.importance;

    const guidanceFix =
        guidance.howToFix ||
        guidance.how_to_fix ||
        guidance.fix ||
        guidance.instructions ||
        guidance.remediationSteps ||
        guidance.remediation_steps ||
        guidance.steps;

    const guidanceBestPractice =
        guidance.bestPractice ||
        guidance.best_practice ||
        guidance.recommendedPractice ||
        guidance.recommended_practice;

    const guidanceWcag =
        guidance.wcagReference ||
        guidance.wcag_reference ||
        guidance.wcag ||
        guidance.wcagCriterion ||
        guidance.wcag_criterion ||
        issue.wcag;

    /*
     * ============================================
     * RENDER
     * ============================================
     */

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            whileHover={{
                y: -4,
            }}
            transition={{
                duration: 0.25,
            }}
            className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                backdrop-blur-xl
                shadow-[0_0_25px_rgba(6,182,212,0.05)]
            "
        >

            {/* ============================================
                HEADER
            ============================================ */}

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    md:flex-row
                    md:items-start
                    md:justify-between
                "
            >
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        {title}
                    </h2>

                    <div
                        className="
                            mt-3
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        "
                    >
                        <span
                            className="
                                rounded-full
                                border
                                border-cyan-500/20
                                bg-cyan-500/10
                                px-3
                                py-1
                                text-xs
                                text-cyan-300
                            "
                        >
                            {ruleId}
                        </span>

                        <span className="text-sm text-gray-400">
                            WCAG {issue.wcag || "Unknown"}
                        </span>

                        {issue.wcagCategory && (
                            <span className="text-sm text-gray-500">
                                {issue.wcagCategory}
                            </span>
                        )}

                        {issue.wcagLevel && (
                            <span className="text-sm text-gray-500">
                                Level {issue.wcagLevel}
                            </span>
                        )}
                    </div>
                </div>

                <span
                    className={`
                        inline-flex
                        w-fit
                        items-center
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        ${severityClass}
                    `}
                >
                    {severity}
                </span>
            </div>

            {/* ============================================
                DETECTION DETAILS
            ============================================ */}

            {(issue.selector ||
                issue.source) && (
                <div
                    className="
                        mt-6
                        rounded-2xl
                        border
                        border-white/10
                        bg-black/10
                        p-5
                    "
                >
                    {issue.selector && (
                        <div>
                            <p
                                className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-gray-500
                                "
                            >
                                Selector
                            </p>

                            <p
                                className="
                                    mt-2
                                    break-all
                                    font-mono
                                    text-sm
                                    text-cyan-300
                                "
                            >
                                {issue.selector}
                            </p>
                        </div>
                    )}

                    {issue.source && (
                        <div
                            className={
                                issue.selector
                                    ? "mt-4"
                                    : ""
                            }
                        >
                            <p
                                className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-gray-500
                                "
                            >
                                Detection Source
                            </p>

                            <p className="mt-1 text-sm text-gray-300">
                                {issue.source}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================
                AI REMEDIATION GUIDANCE
            ============================================ */}

            <div className="mt-8">

                <div className="mb-5 flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-500/10
                            text-cyan-400
                        "
                    >
                        <FiBookOpen size={20} />
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            AI Remediation Guidance
                        </h3>

                        <p className="text-sm text-gray-500">
                            Generated by the accessibility guidance engine
                        </p>
                    </div>
                </div>

                <div className="space-y-5">

                    <Section
                        icon={<FiInfo />}
                        title="Summary"
                        text={
                            guidanceSummary ||
                            "Guidance unavailable."
                        }
                    />

                    <Section
                        icon={<FiAlertTriangle />}
                        title="Why It Matters"
                        text={
                            guidanceWhy ||
                            "No explanation is available."
                        }
                    />

                    <Section
                        icon={<FiTool />}
                        title="How to Fix"
                        text={
                            guidanceFix ||
                            "No remediation instructions are available."
                        }
                    />

                    <Section
                        icon={<FiBookOpen />}
                        title="Best Practice"
                        text={
                            guidanceBestPractice ||
                            "No best-practice recommendation is available."
                        }
                    />

                    <Section
                        icon={<FiCode />}
                        title="WCAG Reference"
                        text={
                            guidanceWcag ||
                            "No WCAG reference is available."
                        }
                    />
                </div>
            </div>

            {/* ============================================
                AI GENERATED FIX
            ============================================ */}

            <div
                className="
                    mt-8
                    rounded-3xl
                    border
                    border-violet-500/20
                    bg-violet-500/5
                    p-6
                "
            >
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-500/10
                            text-violet-400
                        "
                    >
                        <FiCode size={20} />
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            AI-Generated Fix
                        </h3>

                        <p className="text-sm text-gray-500">
                            Suggested HTML remediation generated by AI
                        </p>
                    </div>
                </div>

                {aiFix.explanation && (
                    <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-300">
                            Explanation
                        </p>

                        <p className="mt-2 whitespace-pre-line leading-7 text-gray-400">
                            {aiFix.explanation}
                        </p>
                    </div>
                )}

                {aiFix.incorrectHTML && (
                    <CodeBlock
                        title="Incorrect HTML"
                        code={aiFix.incorrectHTML}
                        type="error"
                    />
                )}

                {aiFix.correctedHTML && (
                    <CodeBlock
                        title="Corrected HTML"
                        code={aiFix.correctedHTML}
                        type="success"
                    />
                )}

                {aiFix.ariaFix && (
                    <CodeBlock
                        title="ARIA Fix"
                        code={aiFix.ariaFix}
                        type="info"
                    />
                )}

                {!aiFix.explanation &&
                    !aiFix.incorrectHTML &&
                    !aiFix.correctedHTML &&
                    !aiFix.ariaFix && (
                        <p className="mt-6 text-sm text-gray-500">
                            No AI-generated fix is available for this issue.
                        </p>
                    )}
            </div>

            {/* ============================================
                FIX VALIDATION
            ============================================ */}

            <div
                className="
                    mt-8
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/5
                    p-6
                "
            >
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-500/10
                            text-cyan-400
                        "
                    >
                        <FiShield size={20} />
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            Fix Validation
                        </h3>

                        <p className="text-sm text-gray-500">
                            Validation result for the AI-generated fix
                        </p>
                    </div>
                </div>

                <div className="mt-6">

                    {validationStatus ? (
                        <div
                            className={`
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                p-4
                                ${
                                    isValidationSuccess
                                        ? "border-green-500/20 bg-green-500/5"
                                        : isValidationError
                                        ? "border-red-500/20 bg-red-500/5"
                                        : "border-yellow-500/20 bg-yellow-500/5"
                                }
                            `}
                        >
                            {isValidationSuccess ? (
                                <FiCheckCircle
                                    size={22}
                                    className="text-green-400"
                                />
                            ) : isValidationError ? (
                                <FiXCircle
                                    size={22}
                                    className="text-red-400"
                                />
                            ) : (
                                <FiAlertTriangle
                                    size={22}
                                    className="text-yellow-400"
                                />
                            )}

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {validationStatus}
                                </p>

                                {validation.message && (
                                    <p className="mt-1 text-sm text-gray-400">
                                        {validation.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No validation result is available.
                        </p>
                    )}

                    <ValidationDetails
                        validation={validation}
                    />
                </div>
            </div>

            {/* ============================================
                AI GUIDANCE EVALUATION
            ============================================ */}

            <div
                className="
                    mt-8
                    rounded-3xl
                    border
                    border-cyan-500/20
                    bg-cyan-500/5
                    p-6
                "
            >
                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-500/10
                            text-cyan-400
                        "
                    >
                        <FiCheckCircle size={20} />
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            AI Guidance Evaluation
                        </h3>

                        <p className="text-sm text-gray-500">
                            Quality assessment of the generated guidance
                        </p>
                    </div>
                </div>

                {evaluation.overallScore !==
                    undefined &&
                evaluation.overallScore !==
                    null ? (
                    <>
                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-cyan-500/20
                                bg-black/10
                                p-5
                            "
                        >
                            <div>
                                <p className="text-sm text-gray-400">
                                    Overall Score
                                </p>

                                <p className="mt-2 text-4xl font-bold text-cyan-400">
                                    {evaluation.overallScore}/5
                                </p>
                            </div>

                            <FiCheckCircle
                                size={32}
                                className="text-green-400"
                            />
                        </div>

                        <div
                            className="
                                mt-5
                                grid
                                gap-4
                                sm:grid-cols-2
                                lg:grid-cols-4
                            "
                        >
                            <EvaluationScore
                                label="Accuracy"
                                value={evaluation.accuracy}
                            />

                            <EvaluationScore
                                label="Clarity"
                                value={evaluation.clarity}
                            />

                            <EvaluationScore
                                label="Actionability"
                                value={evaluation.actionability}
                            />

                            <EvaluationScore
                                label="WCAG Compliance"
                                value={
                                    evaluation.wcagCompliance
                                }
                            />
                        </div>

                        {evaluation.feedback && (
                            <div className="mt-5">
                                <p className="text-sm font-semibold text-gray-300">
                                    Evaluator Feedback
                                </p>

                                <p className="mt-2 whitespace-pre-line leading-7 text-gray-400">
                                    {evaluation.feedback}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="mt-6 text-sm text-gray-500">
                        No AI evaluation is available.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

/*
 * ============================================
 * TEXT SECTION
 * ============================================
 */

function Section({
    icon,
    title,
    text,
}) {
    return (
        <div
            className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-5
                flex
                gap-4
            "
        >
            <div className="mt-1 text-cyan-400">
                {icon}
            </div>

            <div className="min-w-0">
                <h3 className="font-semibold text-white">
                    {title}
                </h3>

                <p className="mt-2 whitespace-pre-line leading-7 text-gray-300">
                    {text}
                </p>
            </div>
        </div>
    );
}

/*
 * ============================================
 * CODE BLOCK
 * ============================================
 */

function CodeBlock({
    title,
    code,
    type = "info",
}) {
    const borderColor =
        type === "error"
            ? "border-red-500/20"
            : type === "success"
            ? "border-green-500/20"
            : "border-cyan-500/20";

    const titleColor =
        type === "error"
            ? "text-red-400"
            : type === "success"
            ? "text-green-400"
            : "text-cyan-400";

    return (
        <div
            className={`
                mt-5
                overflow-hidden
                rounded-2xl
                border
                ${borderColor}
                bg-black/20
            `}
        >
            <div
                className="
                    border-b
                    border-white/10
                    px-4
                    py-3
                "
            >
                <p
                    className={`
                        text-sm
                        font-semibold
                        ${titleColor}
                    `}
                >
                    {title}
                </p>
            </div>

            <pre
                className="
                    overflow-x-auto
                    p-5
                    text-sm
                    leading-7
                    text-gray-300
                "
            >
                <code>{code}</code>
            </pre>
        </div>
    );
}

/*
 * ============================================
 * VALIDATION DETAILS
 * ============================================
 */

function ValidationDetails({
    validation,
}) {
    if (
        !validation ||
        typeof validation !== "object"
    ) {
        return null;
    }

    const excludedKeys = new Set([
        "status",
        "result",
        "validationStatus",
        "validation_status",
        "message",
    ]);

    const entries = Object.entries(
        validation
    ).filter(
        ([key, value]) =>
            !excludedKeys.has(key) &&
            value !== null &&
            value !== undefined &&
            value !== ""
    );

    if (!entries.length) {
        return null;
    }

    return (
        <div
            className="
                mt-5
                grid
                gap-4
                sm:grid-cols-2
            "
        >
            {entries.map(
                ([key, value]) => (
                    <div
                        key={key}
                        className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-4
                        "
                    >
                        <p
                            className="
                                text-xs
                                uppercase
                                tracking-wider
                                text-gray-500
                            "
                        >
                            {formatLabel(key)}
                        </p>

                        <p className="mt-2 break-words text-sm text-gray-300 whitespace-pre-line">
                            {formatValue(value)}
                        </p>
                    </div>
                )
            )}
        </div>
    );
}

/*
 * ============================================
 * EVALUATION SCORE
 * ============================================
 */

function EvaluationScore({
    label,
    value,
}) {
    return (
        <div
            className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-4
            "
        >
            <p className="text-sm text-gray-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
                {value !== undefined &&
                value !== null
                    ? `${value}/5`
                    : "—"}
            </p>
        </div>
    );
}

/*
 * ============================================
 * HELPERS
 * ============================================
 */

function formatLabel(value) {
    return String(value)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/^./, (char) =>
            char.toUpperCase()
        );
}

function formatValue(value) {
    if (
        typeof value === "object" &&
        value !== null
    ) {
        return JSON.stringify(
            value,
            null,
            2
        );
    }

    return String(value);
}