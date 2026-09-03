import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ScanForm from "../../components/newScan/ScanForm";
import ScanProgress from "../../components/newScan/ScanProgress";

export default function NewScan() {
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  /* ================================================= */
  /* START SCAN */
  /* ================================================= */

  const startScan = async (url) => {
    setIsScanning(true);
    setScanResult(null);
    setScanError("");

    try {
      const token = localStorage.getItem("accessGuardToken");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/scan`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            url,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Scan failed. Please try again."
        );
      }

      console.log("Scan result:", data);

      /*
       * Store the complete scan response.
       */
      setScanResult(data);

      /*
       * Store the latest scan ID so the sidebar
       * can use it for all scan-specific pages.
       */
      const newScanId =
        data?.scanId ??
        data?.scan?.id ??
        data?.id ??
        null;
      
      if (newScanId) {
      
        localStorage.setItem(
          "activeScanId",
          String(newScanId)
        );
      
        /*
         * Notify the Sidebar immediately.
         */
        window.dispatchEvent(
          new Event("activeScanChanged")
        );
      
        console.log(
          "Active Scan ID updated:",
          newScanId
        );
      }
    } catch (error) {
      console.error("Scan error:", error);

      setScanError(
        error.message ||
          "Unable to complete the accessibility scan."
      );
    } finally {
      setIsScanning(false);
    }
  };

  /*
   * =================================================
   * EXTRACT SCAN ID
   * =================================================
   *
   * Depending on the backend response structure,
   * the scan ID may be returned as:
   *
   * data.scanId
   * data.scan.id
   * data.id
   *
   * We support all three.
   */

  const scanId =
    scanResult?.scanId ??
    scanResult?.scan?.id ??
    scanResult?.id ??
    null;

  return (
    <div className="space-y-8">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          New Accessibility Scan
        </h1>

        <p className="mt-2 max-w-3xl text-gray-400">
          Scan any publicly accessible website using Playwright,
          Lighthouse, and Pa11y to identify accessibility issues
          and receive AI-powered remediation suggestions.
        </p>
      </div>


      {/* ================================================= */}
      {/* SCAN FORM */}
      {/* ================================================= */}

      <ScanForm
        onStartScan={startScan}
        isScanning={isScanning}
      />


      {/* ================================================= */}
      {/* SCAN PROGRESS */}
      {/* ================================================= */}

      {isScanning && <ScanProgress />}


      {/* ================================================= */}
      {/* SCAN ERROR */}
      {/* ================================================= */}

      {scanError && !isScanning && (
        <div
          className="
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            p-5
          "
        >
          <h3 className="font-semibold text-red-400">
            Scan Failed
          </h3>

          <p className="mt-2 text-sm text-gray-300">
            {scanError}
          </p>
        </div>
      )}


      {/* ================================================= */}
      {/* SCAN RESULT */}
      {/* ================================================= */}

      {scanResult && !isScanning && (
        <div
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/5
            p-8
          "
        >

          {/* ================================================= */}
          {/* SUCCESS HEADER */}
          {/* ================================================= */}

          <h2 className="text-2xl font-semibold text-green-400">
            Scan Completed Successfully
          </h2>

          <p className="mt-2 text-gray-300">
            Accessibility analysis for:
          </p>

          <p className="mt-1 break-all font-medium text-white">
            {scanResult.url}
          </p>


          {/* ================================================= */}
          {/* SCORE CARDS */}
          {/* ================================================= */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ScoreCard
              label="Accessibility"
              value={scanResult.scores?.accessibility}
            />

            <ScoreCard
              label="Performance"
              value={scanResult.scores?.performance}
            />

            <ScoreCard
              label="Best Practices"
              value={scanResult.scores?.bestPractices}
            />

            <ScoreCard
              label="SEO"
              value={scanResult.scores?.seo}
            />

          </div>


          {/* ================================================= */}
          {/* SCAN SUMMARY */}
          {/* ================================================= */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
            "
          >

            <h3 className="font-semibold text-white">
              Scan Summary
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryItem
                label="Total Violations"
                value={
                  scanResult.summary?.totalViolations ?? 0
                }
              />

              <SummaryItem
                label="Raw Violations"
                value={
                  scanResult.summary?.rawViolations ?? 0
                }
              />

              <SummaryItem
                label="Duplicates Removed"
                value={
                  scanResult.summary?.duplicatesRemoved ?? 0
                }
              />

              <SummaryItem
                label="AI Fixes"
                value={
                  scanResult.aiFixes?.length ?? 0
                }
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* ACCESSIBILITY VIOLATIONS */}
          {/* ================================================= */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-xl font-semibold text-white">
                  Accessibility Violations
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Issues detected during the accessibility scan.
                </p>
              </div>

              <div
                className="
                  w-fit
                  rounded-full
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-400
                "
              >
                {scanResult.violations?.length ?? 0} Issues
              </div>

            </div>


            {/* ================================================= */}
            {/* VIOLATION LIST */}
            {/* ================================================= */}

            <div className="mt-6 space-y-4">

              {scanResult.violations?.length > 0 ? (

                scanResult.violations.map(
                  (violation, index) => (
                    <ViolationCard
                      key={
                        violation.id ??
                        `${violation.ruleId}-${index}`
                      }
                      violation={violation}
                    />
                  )
                )

              ) : (

                <div
                  className="
                    rounded-xl
                    border
                    border-green-500/20
                    bg-green-500/5
                    p-5
                  "
                >

                  <p className="font-medium text-green-400">
                    No accessibility violations found.
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    The scanned website passed the accessibility
                    checks.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* ================================================= */}
          {/* REPORT ACTIONS */}
          {/* ================================================= */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-4
              border-t
              border-white/10
              pt-6
              sm:flex-row
              sm:justify-end
            "
          >

            {/* VIEW ANALYTICS */}

            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="
                rounded-xl
                border
                border-cyan-400/30
                bg-cyan-400/10
                px-6
                py-3
                font-medium
                text-cyan-400
                transition
                hover:bg-cyan-400/20
                hover:border-cyan-400/50
              "
            >
              View Analytics →
            </button>


            {/* VIEW AI REMEDIATION */}

            <button
              type="button"
              disabled={!scanId}
              onClick={() => {
                if (!scanId) {
                  console.error(
                    "Cannot navigate to AI Remediation. Scan ID is missing.",
                    scanResult
                  );

                  return;
                }

                console.log(
                  "Navigating to AI Remediation for Scan ID:",
                  scanId
                );

                navigate(`/ai/${scanId}`);
              }}
              className={`
                rounded-xl
                border
                px-6
                py-3
                font-medium
                transition
                ${
                  scanId
                    ? `
                      border-green-400/30
                      bg-green-400/10
                      text-green-400
                      hover:bg-green-400/20
                      hover:border-green-400/50
                    `
                    : `
                      cursor-not-allowed
                      border-gray-500/20
                      bg-gray-500/10
                      text-gray-500
                    `
                }
              `}
            >
              {scanId
                ? "View AI Remediation →"
                : "AI Remediation Unavailable"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}


/* ================================================= */
/* SCORE CARD */
/* ================================================= */

function ScoreCard({ label, value }) {
  return (
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
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {typeof value === "number"
          ? Math.round(value)
          : "--"}
        {typeof value === "number" && "%"}
      </p>
    </div>
  );
}


/* ================================================= */
/* SUMMARY ITEM */
/* ================================================= */

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}


/* ================================================= */
/* VIOLATION CARD */
/* ================================================= */

function ViolationCard({ violation }) {

  const severity = violation.severity
    ? violation.severity.toLowerCase()
    : "unknown";


  /* ----------------------------------------------- */
  /* Severity Styles */
  /* ----------------------------------------------- */

  const severityStyles = {
    critical:
      "bg-red-500/20 text-red-400 border-red-500/20",

    serious:
      "bg-orange-500/20 text-orange-400 border-orange-500/20",

    moderate:
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",

    minor:
      "bg-green-500/20 text-green-400 border-green-500/20",

    unknown:
      "bg-gray-500/20 text-gray-400 border-gray-500/20",
  };


  const severityClass =
    severityStyles[severity] ||
    severityStyles.unknown;


  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-black/10
        p-6
        transition
        hover:border-white/20
      "
    >

      {/* ================================================= */}
      {/* VIOLATION HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <p className="text-lg font-semibold text-white">
            {violation.ruleId || "Unknown Rule"}
          </p>

          {violation.description && (
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {violation.description}
            </p>
          )}

        </div>


        {/* Severity */}

        <span
          className={`
            w-fit
            rounded-full
            border
            px-3
            py-1
            text-sm
            font-medium
            capitalize
            ${severityClass}
          `}
        >
          {severity}
        </span>

      </div>


      {/* ================================================= */}
      {/* VIOLATION DETAILS */}
      {/* ================================================= */}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">

        <DetailItem
          label="Detected By"
          value={
            Array.isArray(violation.detectedBy)
              ? violation.detectedBy.join(", ")
              : violation.detectedBy || "Unknown"
          }
        />

        <DetailItem
          label="WCAG Criterion"
          value={
            violation.wcagCriterion ||
            "Not available"
          }
        />

        <DetailItem
          label="WCAG Level"
          value={
            violation.wcagLevel ||
            "Not available"
          }
        />

        <DetailItem
          label="WCAG Category"
          value={
            violation.wcagCategory ||
            "Not available"
          }
        />

      </div>


      {/* ================================================= */}
      {/* SELECTOR */}
      {/* ================================================= */}

      {violation.selector && (
        <div className="mt-5">

          <p className="text-sm text-gray-400">
            Selector
          </p>

          <code
            className="
              mt-2
              block
              overflow-x-auto
              rounded-xl
              border
              border-white/10
              bg-black/20
              p-3
              text-sm
              text-cyan-300
            "
          >
            {violation.selector}
          </code>

        </div>
      )}

    </div>
  );
}


/* ================================================= */
/* DETAIL ITEM */
/* ================================================= */

function DetailItem({ label, value }) {
  return (
    <div>

      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {value}
      </p>

    </div>
  );
}