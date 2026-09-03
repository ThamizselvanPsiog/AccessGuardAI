import { useEffect, useState } from "react";

import ScoreCards from "../../components/analytics/ScoreCards";
import SeverityChart from "../../components/analytics/SeverityChart";
import DetectionSources from "../../components/analytics/DetectionSources";
import TopAccessibilityRules from "../../components/analytics/TopAccessibilityRules";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Analytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchAnalytics = async () => {

            try {

                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("accessGuardToken");

                if (!token) {
                    setError(
                        "You are not authenticated."
                    );
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/analytics`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to load analytics."
                    );

                }

                setAnalytics(data);

            } catch (err) {

                console.error(
                    "Analytics loading error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load analytics."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchAnalytics();

    }, []);

    /*
     * ============================================
     * LOADING
     * ============================================
     */

    if (loading) {

        return (

            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

                    <p className="text-gray-400">
                        Loading accessibility analytics...
                    </p>

                </div>

            </div>

        );

    }

    /*
     * ============================================
     * ERROR
     * ============================================
     */

    if (error) {

        return (

            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">

                <h2 className="text-xl font-semibold text-red-400">
                    Unable to Load Analytics
                </h2>

                <p className="mt-2 text-gray-400">
                    {error}
                </p>

            </div>

        );

    }

    /*
     * ============================================
     * NO SCANS
     * ============================================
     */

    if (!analytics?.hasScan) {

        return (

            <div className="space-y-8">

                <div>

                    <h1 className="text-3xl font-bold text-white">
                        Accessibility Analytics
                    </h1>

                    <p className="mt-2 max-w-3xl text-gray-400">
                        Explore accessibility scores, issue severity,
                        and detection sources generated from your
                        accessibility scans.
                    </p>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">

                    <h2 className="text-2xl font-semibold text-white">
                        No Scan Data Yet
                    </h2>

                    <p className="mt-3 text-gray-400">
                        Run an accessibility scan first to see
                        your analytics.
                    </p>

                </div>

            </div>

        );

    }

    /*
     * ============================================
     * ANALYTICS DATA
     * ============================================
     */

    const scan = analytics.scan;

    return (

        <div className="space-y-8">

            {/* Page Header */}

            <div>

                <h1 className="text-3xl font-bold text-white">
                    Accessibility Analytics
                </h1>

                <p className="mt-2 max-w-3xl text-gray-400">
                    Explore accessibility scores, issue severity,
                    and detection sources generated from your
                    latest accessibility scan.
                </p>

                <p className="mt-3 text-sm text-cyan-400">
                    Latest scan: {scan.url}
                </p>

            </div>

            {/* Score Cards */}

            <ScoreCards
                scores={scan.scores}
            />

            {/* Charts */}

            <div className="grid gap-8 xl:grid-cols-2">

                <SeverityChart
                    data={analytics.severity}
                />

                <DetectionSources
                    data={analytics.detectionSources}
                />

            </div>

            {/* Top Rules */}

            <TopAccessibilityRules
                rules={analytics.topRules}
            />

        </div>

    );
}