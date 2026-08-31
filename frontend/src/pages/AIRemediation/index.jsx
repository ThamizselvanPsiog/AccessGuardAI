import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import ScanSummary from "../../components/aiRemediation/ScanSummary";

import IssueCard from "../../components/aiRemediation/IssueCard";


const API_BASE_URL =
    "http://localhost:5000/api";


export default function AIRemediation() {

    const { scanId } =
        useParams();


    const [scanData, setScanData] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    /*
     * ============================================================
     * FETCH STORED REMEDIATION
     * ============================================================
     *
     * IMPORTANT:
     *
     * This endpoint only reads data from the database.
     *
     * It does NOT generate Gemini guidance.
     *
     * Therefore refreshing this page does not consume
     * another Gemini request.
     * ============================================================
     */

    useEffect(() => {

        let cancelled = false;


        const fetchRemediation =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const token =
                        localStorage.getItem(
                            "accessGuardToken"
                        );


                    if (!token) {

                        throw new Error(
                            "You are not authenticated."
                        );
                    }


                    if (!scanId) {

                        throw new Error(
                            "No scan ID was provided."
                        );
                    }


                    const response =
                        await fetch(
                            `${API_BASE_URL}/scan/${scanId}/remediation`,
                            {
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "AI Remediation API response:",
                        data
                    );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load AI remediation data."
                        );
                    }


                    if (!cancelled) {

                        setScanData(data);
                    }

                } catch (err) {

                    if (cancelled) {
                        return;
                    }


                    console.error(
                        "AI Remediation loading error:",
                        err
                    );


                    setError(
                        err?.message ||
                        "Unable to load AI remediation."
                    );

                } finally {

                    if (!cancelled) {

                        setLoading(false);
                    }
                }
            };


        fetchRemediation();


        return () => {

            cancelled = true;
        };

    }, [scanId]);


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {

        return (

            <div
                className="
                    flex
                    min-h-[500px]
                    items-center
                    justify-center
                "
            >

                <div className="text-center">

                    <div
                        className="
                            mx-auto
                            mb-4
                            h-10
                            w-10
                            animate-spin
                            rounded-full
                            border-4
                            border-white/10
                            border-t-cyan-400
                        "
                    />

                    <p className="text-gray-400">
                        Loading AI remediation...
                    </p>

                </div>

            </div>
        );
    }


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (error) {

        return (

            <div
                className="
                    rounded-3xl
                    border
                    border-red-500/20
                    bg-red-500/5
                    p-8
                "
            >

                <h2
                    className="
                        text-xl
                        font-semibold
                        text-red-400
                    "
                >
                    Unable to Load AI Remediation
                </h2>

                <p className="mt-2 text-gray-400">
                    {error}
                </p>

            </div>
        );
    }


    /*
     * ============================================================
     * SAFETY CHECK
     * ============================================================
     */

    if (!scanData?.scan) {

        return (

            <div
                className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/5
                    p-8
                "
            >

                <h2
                    className="
                        text-xl
                        font-semibold
                        text-white
                    "
                >
                    Scan Not Found
                </h2>

                <p className="mt-2 text-gray-400">
                    The requested scan could not be found.
                </p>

            </div>
        );
    }


    /*
     * ============================================================
     * SCAN
     * ============================================================
     */

    const scan =
        scanData.scan;


    /*
     * ============================================================
     * REMEDIATION
     * ============================================================
     */

    const remediation =
        Array.isArray(
            scanData.remediation
        )
            ? scanData.remediation
            : [];


    /*
     * ============================================================
     * NORMALIZE REMEDIATION
     * ============================================================
     */

    const issues =
        remediation.map(item => {

            const ruleId =
                item.ruleId ||
                item.rule_id ||
                "unknown";


            return {

                ...item,

                ruleId,


                /*
                 * WCAG
                 */

                wcag:
                    item.wcagCriterion ||
                    item.wcag_criterion ||
                    "Unknown",

                wcagCategory:
                    item.wcagCategory ||
                    item.wcag_category ||
                    "Unknown",

                wcagLevel:
                    item.wcagLevel ||
                    item.wcag_level ||
                    "Unknown",


                /*
                 * AI FIX
                 */

                aiFix:
                    item.aiFix ||
                    null,


                /*
                 * VALIDATION
                 */

                validation:
                    item.validation ||
                    null,


                /*
                 * GUIDANCE
                 */

                guidance:
                    item.guidance ||
                    null,


                /*
                 * EVALUATION
                 */

                evaluation:
                    item.evaluation ||
                    null

            };

        });


    /*
     * ============================================================
     * BACKEND SUMMARY
     * ============================================================
     */

    const backendSummary =
        scanData.summary || {};


    const totalViolations =
        backendSummary.totalViolations ??
        issues.length;


    const criticalIssues =
        backendSummary.criticalIssues ??
        issues.filter(
            issue =>
                String(
                    issue.severity || ""
                ).toLowerCase() ===
                "critical"
        ).length;


    const seriousIssues =
        backendSummary.seriousIssues ??
        issues.filter(
            issue =>
                String(
                    issue.severity || ""
                ).toLowerCase() ===
                "serious"
        ).length;


    const moderateIssues =
        backendSummary.moderateIssues ??
        issues.filter(
            issue =>
                String(
                    issue.severity || ""
                ).toLowerCase() ===
                "moderate"
        ).length;


    const minorIssues =
        backendSummary.minorIssues ??
        issues.filter(
            issue =>
                String(
                    issue.severity || ""
                ).toLowerCase() ===
                "minor"
        ).length;


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <div className="space-y-8">

            {/* ================================================== */}
            {/* PAGE HEADER */}
            {/* ================================================== */}

            <div>

                <h1
                    className="
                        text-3xl
                        font-bold
                        text-white
                    "
                >
                    AI Accessibility Remediation
                </h1>


                <p
                    className="
                        mt-2
                        max-w-3xl
                        text-gray-400
                    "
                >
                    AI-generated explanations, fixes,
                    validation results, and remediation
                    guidance for the detected accessibility
                    issues.
                </p>


                <p
                    className="
                        mt-3
                        text-sm
                        text-cyan-400
                    "
                >
                    Scan: {scan.url}
                </p>


                <p
                    className="
                        mt-1
                        text-xs
                        text-gray-500
                    "
                >
                    Scan ID: {scan.id}
                </p>

            </div>


            {/* ================================================== */}
            {/* SUMMARY */}
            {/* ================================================== */}

            <ScanSummary
                scan={scan}
                totalViolations={
                    totalViolations
                }
                criticalIssues={
                    criticalIssues
                }
                seriousIssues={
                    seriousIssues
                }
                moderateIssues={
                    moderateIssues
                }
                minorIssues={
                    minorIssues
                }
                issues={issues}
            />


            {/* ================================================== */}
            {/* NO VIOLATIONS */}
            {/* ================================================== */}

            {issues.length === 0 && (

                <div
                    className="
                        rounded-3xl
                        border
                        border-green-500/20
                        bg-green-500/5
                        p-10
                        text-center
                    "
                >

                    <h2
                        className="
                            text-2xl
                            font-semibold
                            text-green-400
                        "
                    >
                        No Accessibility Violations Found
                    </h2>


                    <p
                        className="
                            mt-3
                            text-gray-400
                        "
                    >
                        The scan did not detect any
                        accessibility violations requiring
                        AI remediation.
                    </p>

                </div>
            )}


            {/* ================================================== */}
            {/* REMEDIATION ISSUES */}
            {/* ================================================== */}

            {issues.map(
                (issue, index) => (

                    <IssueCard
                        key={
                            `${issue.ruleId}-${issue.id || index}`
                        }
                        issue={issue}
                    />

                )
            )}

        </div>
    );
}