import { useEffect, useState } from "react";

import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import DashboardInsights from "../../components/dashboard/DashboardInsights";

const API_BASE_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================
   * FETCH DASHBOARD DATA
   * ============================================
   */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessGuardToken");

        if (!token) {
          throw new Error(
            "You are not authenticated."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/dashboard`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        console.log(
          "Dashboard API response:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load dashboard."
          );
        }

        setDashboard(data);
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /*
   * ============================================
   * LOADING
   * ============================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
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
            Loading dashboard...
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
      <div
        className="
          rounded-3xl
          border
          border-red-500/20
          bg-red-500/5
          p-8
        "
      >
        <h2 className="text-xl font-semibold text-red-400">
          Unable to Load Dashboard
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

  if (!dashboard?.hasScan) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Accessibility Dashboard
          </h1>

          <p className="mt-2 max-w-3xl text-gray-400">
            Monitor accessibility health, scan
            performance, issue trends, and AI
            remediation coverage.
          </p>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-12
            text-center
            backdrop-blur-xl
          "
        >
          <h2 className="text-2xl font-semibold text-white">
            No Scan Data Yet
          </h2>

          <p className="mt-3 text-gray-400">
            Run your first accessibility scan to
            populate the dashboard.
          </p>
        </div>

      </div>
    );
  }

  /*
   * ============================================
   * DASHBOARD
   * ============================================
   */

  return (
    <div className="space-y-8">

      {/* Page Header */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          Accessibility Dashboard
        </h1>

        <p className="mt-2 max-w-3xl text-gray-400">
          Monitor accessibility health, scan
          performance, issue trends, and AI
          remediation coverage across your scans.
        </p>

        {dashboard.latestScan?.url && (
          <p className="mt-3 text-sm text-cyan-400">
            Latest scan:{" "}
            {dashboard.latestScan.url}
          </p>
        )}
      </div>

      {/* KPI Cards */}

      <DashboardCards
        overview={dashboard.overview}
        latestScan={dashboard.latestScan}
        comparison={dashboard.comparison}
      />

      {/* Charts */}

      <DashboardCharts
        scoreTrend={dashboard.scoreTrend}
        severity={dashboard.severity}
      />

      {/* Insights */}

      <DashboardInsights
        latestScan={dashboard.latestScan}
        previousScan={dashboard.previousScan}
        comparison={dashboard.comparison}
        overview={dashboard.overview}
        topRule={dashboard.topRule}
      />

    </div>
  );
}