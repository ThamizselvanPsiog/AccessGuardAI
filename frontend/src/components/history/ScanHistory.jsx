import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDownload,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

import { jsPDF } from "jspdf";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||"http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Score Color
|--------------------------------------------------------------------------
*/

function getScoreColor(score) {
  const numericScore = Number(score);

  if (numericScore >= 90) return "text-green-400";
  if (numericScore >= 70) return "text-yellow-400";

  return "text-red-400";
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDate(dateValue) {
  if (!dateValue) return "Unknown";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleString();
}

/*
|--------------------------------------------------------------------------
| Safely Parse JSON
|--------------------------------------------------------------------------
*/

function parseJSON(value, fallback = null) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/*
|--------------------------------------------------------------------------
| Get First Available Value
|--------------------------------------------------------------------------
|
| Allows the PDF to work with both:
|
| snake_case:
| accessibility_score
|
| and camelCase:
| accessibilityScore
|
|--------------------------------------------------------------------------
*/

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Convert Value To PDF-Friendly Text
|--------------------------------------------------------------------------
*/

function valueToText(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/*
|--------------------------------------------------------------------------
| Add Wrapped Text To PDF
|--------------------------------------------------------------------------
*/

function addWrappedText(
  doc,
  text,
  x,
  y,
  maxWidth,
  lineHeight = 5
) {
  const safeText = valueToText(text);

  if (!safeText) {
    return y;
  }

  const lines = doc.splitTextToSize(
    safeText,
    maxWidth
  );

  lines.forEach((line) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, x, y);
    y += lineHeight;
  });

  return y;
}

/*
|--------------------------------------------------------------------------
| Add Section Heading
|--------------------------------------------------------------------------
*/

function addSectionHeading(
  doc,
  title,
  y
) {
  if (y > 265) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text(title, 20, y);

  return y + 8;
}

/*
|--------------------------------------------------------------------------
| Normalize Scan
|--------------------------------------------------------------------------
|
| The backend may return either snake_case or camelCase.
|--------------------------------------------------------------------------
*/

function normalizeScan(scan = {}) {
    const scores = scan.scores || {};

    return {
        id: firstValue(
            scan.id,
            scan.scanId
        ),

        url: firstValue(
            scan.url,
            scan.website
        ),

        accessibility_score: firstValue(
            scan.accessibility_score,
            scan.accessibilityScore,
            scan.accessibility,
            scores.accessibility
        ),

        performance_score: firstValue(
            scan.performance_score,
            scan.performanceScore,
            scan.performance,
            scores.performance
        ),

        best_practices_score: firstValue(
            scan.best_practices_score,
            scan.bestPracticesScore,
            scan.bestPractices,
            scores.bestPractices
        ),

        seo_score: firstValue(
            scan.seo_score,
            scan.seoScore,
            scan.seo,
            scores.seo
        ),

        scan_date: firstValue(
            scan.scan_date,
            scan.scanDate,
            scan.created_at,
            scan.createdAt
        ),
    };
}

/*
|--------------------------------------------------------------------------
| Normalize Violation
|--------------------------------------------------------------------------
*/

function normalizeViolation(
  violation = {}
) {
  /*
  |--------------------------------------------------------------------------
  | AI Fix
  |--------------------------------------------------------------------------
  */

  let aiFix = firstValue(
    violation.ai_fix,
    violation.aiFix,
    violation.fix
  );

  aiFix = parseJSON(aiFix);

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  let validation = firstValue(
    violation.validation
  );

  validation = parseJSON(validation);

  /*
  |--------------------------------------------------------------------------
  | Guidance
  |--------------------------------------------------------------------------
  */

  let guidanceData = firstValue(
    violation.guidance,
    violation.guidanceData
  );

  guidanceData = parseJSON(
    guidanceData
  );

  /*
  |--------------------------------------------------------------------------
  | Some backend responses may return:
  |
  | guidance: {
  |   guidance: {...},
  |   evaluation: {...}
  | }
  |
  |--------------------------------------------------------------------------
  */

  if (
    guidanceData &&
    guidanceData.guidance
  ) {
    const nestedGuidance =
      parseJSON(
        guidanceData.guidance
      );

    guidanceData = {
      ...(nestedGuidance || {}),
      evaluation:
        firstValue(
          guidanceData.evaluation,
          nestedGuidance?.evaluation
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | If guidance itself is already the actual object
  |--------------------------------------------------------------------------
  */

  return {
    id: firstValue(
      violation.id
    ),

    scan_id: firstValue(
      violation.scan_id,
      violation.scanId
    ),

    source: firstValue(
      violation.source,
      violation.detectedBy
    ),

    rule_id: firstValue(
      violation.rule_id,
      violation.ruleId
    ),

    severity: firstValue(
      violation.severity
    ),

    selector: firstValue(
      violation.selector
    ),

    description: firstValue(
      violation.description
    ),

    detected_by: firstValue(
      violation.detected_by,
      violation.detectedBy
    ),

    wcag_category: firstValue(
      violation.wcag_category,
      violation.wcagCategory
    ),

    wcag_criterion: firstValue(
      violation.wcag_criterion,
      violation.wcagCriterion
    ),

    wcag_level: firstValue(
      violation.wcag_level,
      violation.wcagLevel
    ),

    ai_fix: aiFix,

    validation: validation,

    guidance: guidanceData,
  };
}

/*
|--------------------------------------------------------------------------
| Extract Violations From API Response
|--------------------------------------------------------------------------
*/

function extractViolations(data) {
  /*
  |--------------------------------------------------------------------------
  | 1. Direct violations array
  |--------------------------------------------------------------------------
  */

  if (
    Array.isArray(data?.violations)
  ) {
    return data.violations.map(
      normalizeViolation
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Remediation array
  |--------------------------------------------------------------------------
  */

  if (
    Array.isArray(data?.remediation)
  ) {
    return data.remediation.map(
      normalizeViolation
    );
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Generate PDF Report
|--------------------------------------------------------------------------
*/

function generatePDFReport(
  rawScan,
  rawViolations
) {
  const scan =
    normalizeScan(rawScan);

  const violations =
    rawViolations.map(
      normalizeViolation
    );

  const doc = new jsPDF();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const contentWidth =
    pageWidth - 40;

  let y = 20;

  /*
  |--------------------------------------------------------------------------
  | Report Header
  |--------------------------------------------------------------------------
  */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(22);

  doc.text(
    "AccessGuard",
    20,
    y
  );

  y += 10;

  doc.setFontSize(16);

  doc.text(
    "Accessibility Scan Report",
    20,
    y
  );

  y += 8;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "Generated from AccessGuard Scan History",
    20,
    y
  );

  y += 12;

  /*
  |--------------------------------------------------------------------------
  | Scan Information
  |--------------------------------------------------------------------------
  */

  y = addSectionHeading(
    doc,
    "Scan Information",
    y
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  y = addWrappedText(
    doc,
    `Website: ${
      scan.url || "Unknown"
    }`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `Scan ID: ${
      scan.id ?? "Unknown"
    }`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `Scan Date: ${
      formatDate(
        scan.scan_date
      )
    }`,
    20,
    y,
    contentWidth
  );

  y += 5;

  /*
  |--------------------------------------------------------------------------
  | Accessibility Summary
  |--------------------------------------------------------------------------
  */

  y = addSectionHeading(
    doc,
    "Accessibility Summary",
    y
  );

  y = addWrappedText(
    doc,
    `Accessibility Score: ${
      scan.accessibility_score ??
      "N/A"
    }%`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `Performance Score: ${
      scan.performance_score ??
      "N/A"
    }%`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `Best Practices Score: ${
      scan.best_practices_score ??
      "N/A"
    }%`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `SEO Score: ${
      scan.seo_score ??
      "N/A"
    }%`,
    20,
    y,
    contentWidth
  );

  y = addWrappedText(
    doc,
    `Total Accessibility Issues: ${
      violations.length
    }`,
    20,
    y,
    contentWidth
  );

  y += 8;

  /*
  |--------------------------------------------------------------------------
  | No Violations
  |--------------------------------------------------------------------------
  */

  if (!violations.length) {
    y = addSectionHeading(
      doc,
      "Accessibility Result",
      y
    );

    y = addWrappedText(
      doc,
      "No accessibility violations were detected during this scan.",
      20,
      y,
      contentWidth
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Violations
  |--------------------------------------------------------------------------
  */

  violations.forEach(
    (violation, index) => {
      /*
      |--------------------------------------------------------------------------
      | Each violation starts on a new page
      |--------------------------------------------------------------------------
      */

      doc.addPage();

      y = 20;

      /*
      |--------------------------------------------------------------------------
      | Violation Information
      |--------------------------------------------------------------------------
      */

      y = addSectionHeading(
        doc,
        `Issue ${
          index + 1
        }: ${
          violation.rule_id ||
          "Unknown Rule"
        }`,
        y
      );

      y = addWrappedText(
        doc,
        `Severity: ${
          violation.severity ||
          "Unknown"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `Source: ${
          valueToText(
            violation.source
          ) || "Unknown"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `Selector: ${
          violation.selector ||
          "N/A"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `Description: ${
          violation.description ||
          "N/A"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `WCAG Category: ${
          violation.wcag_category ||
          "N/A"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `WCAG Criterion: ${
          violation.wcag_criterion ||
          "N/A"
        }`,
        20,
        y,
        contentWidth
      );

      y = addWrappedText(
        doc,
        `WCAG Level: ${
          violation.wcag_level ||
          "N/A"
        }`,
        20,
        y,
        contentWidth
      );

      y += 5;

      /*
      |--------------------------------------------------------------------------
      | AI Generated Fix
      |--------------------------------------------------------------------------
      */

      if (violation.ai_fix) {
        const aiFix =
          violation.ai_fix;

        y = addSectionHeading(
          doc,
          "AI Generated Fix",
          y
        );

        y = addWrappedText(
          doc,
          `Explanation: ${
            firstValue(
              aiFix.explanation,
              aiFix.Explanation
            ) ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        y += 3;

        y = addWrappedText(
          doc,
          "Incorrect HTML:",
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          firstValue(
            aiFix.incorrectHTML,
            aiFix.incorrectHtml,
            aiFix.incorrect_html
          ) || "N/A",
          20,
          y,
          contentWidth
        );

        y += 3;

        y = addWrappedText(
          doc,
          "Corrected HTML:",
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          firstValue(
            aiFix.correctedHTML,
            aiFix.correctedHtml,
            aiFix.corrected_html
          ) || "N/A",
          20,
          y,
          contentWidth
        );

        y += 3;

        y = addWrappedText(
          doc,
          "ARIA Fix:",
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          firstValue(
            aiFix.ariaFix,
            aiFix.aria_fix,
            aiFix.aria
          ) ||
            "Not required",
          20,
          y,
          contentWidth
        );

        y += 5;
      }

      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */

      if (violation.validation) {
        y = addSectionHeading(
          doc,
          "AI Fix Validation",
          y
        );

        y = addWrappedText(
          doc,
          valueToText(
            violation.validation
          ),
          20,
          y,
          contentWidth
        );

        y += 5;
      }

      /*
      |--------------------------------------------------------------------------
      | AI Guidance
      |--------------------------------------------------------------------------
      */

      if (violation.guidance) {
        const guidance =
          violation.guidance;

        y = addSectionHeading(
          doc,
          "AI Remediation Guidance",
          y
        );

        y = addWrappedText(
          doc,
          `Summary: ${
            guidance.summary ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          `Why It Matters: ${
            guidance.whyItMatters ||
            guidance.why_it_matters ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          `How To Fix: ${
            guidance.howToFix ||
            guidance.how_to_fix ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          `Best Practice: ${
            guidance.bestPractice ||
            guidance.best_practice ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        y = addWrappedText(
          doc,
          `WCAG Reference: ${
            guidance.wcagReference ||
            guidance.wcag_reference ||
            violation.wcag_criterion ||
            "N/A"
          }`,
          20,
          y,
          contentWidth
        );

        /*
        |--------------------------------------------------------------------------
        | Guidance Evaluation
        |--------------------------------------------------------------------------
        */

        const evaluation =
          firstValue(
            guidance.evaluation,
            guidance.guidanceEvaluation
          );

        if (evaluation) {
          y += 5;

          y = addSectionHeading(
            doc,
            "AI Guidance Evaluation",
            y
          );

          /*
          | Show evaluation in a cleaner format
          */

          if (
            typeof evaluation ===
              "object" &&
            evaluation !== null
          ) {
            y = addWrappedText(
              doc,
              `Overall Score: ${
                evaluation.overallScore ??
                evaluation.overall_score ??
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );

            y = addWrappedText(
              doc,
              `Accuracy: ${
                evaluation.accuracy ??
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );

            y = addWrappedText(
              doc,
              `Clarity: ${
                evaluation.clarity ??
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );

            y = addWrappedText(
              doc,
              `Actionability: ${
                evaluation.actionability ??
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );

            y = addWrappedText(
              doc,
              `WCAG Compliance: ${
                evaluation.wcagCompliance ??
                evaluation.wcag_compliance ??
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );

            y = addWrappedText(
              doc,
              `Feedback: ${
                evaluation.feedback ||
                "N/A"
              }`,
              20,
              y,
              contentWidth
            );
          } else {
            y = addWrappedText(
              doc,
              valueToText(
                evaluation
              ),
              20,
              y,
              contentWidth
            );
          }
        }
      }
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Footer
  |--------------------------------------------------------------------------
  */

  const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    const pageHeight =
      doc.internal.pageSize.getHeight();

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      `AccessGuard • Page ${page} of ${pageCount}`,
      20,
      pageHeight - 10
    );
  }

  /*
  |--------------------------------------------------------------------------
  | File Name
  |--------------------------------------------------------------------------
  */

  const safeWebsite =
    String(
      scan.url || "scan"
    )
      .replace(
        /^https?:\/\//,
        ""
      )
      .replace(
        /[^a-z0-9]/gi,
        "_"
      )
      .substring(
        0,
        50
      );

  const scanNumber =
    scan.id ?? "unknown";

  doc.save(
    `AccessGuard_${safeWebsite}_Scan_${scanNumber}.pdf`
  );
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function ScanHistory() {
  const [scans, setScans] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloadingId, setDownloadingId] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Scan History
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchScans =
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

          const response =
            await fetch(
              `${API_BASE_URL}/scan`,
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
            "Scan History API response:",
            data
          );

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Unable to load scan history."
            );
          }

          setScans(
            Array.isArray(
              data.scans
            )
              ? data.scans
              : []
          );
        } catch (err) {
          console.error(
            "Scan history loading error:",
            err
          );

          setError(
            err.message ||
              "Unable to load scan history."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchScans();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Download Report
  |--------------------------------------------------------------------------
  */

  const handleDownloadReport =
    async (scanId) => {
      try {
        setDownloadingId(
          scanId
        );

        const token =
          localStorage.getItem(
            "accessGuardToken"
          );

        if (!token) {
          throw new Error(
            "You are not authenticated."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Complete Scan Report Data
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            `${API_BASE_URL}/scan/${scanId}/remediation`,
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
          "Complete report data:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to retrieve scan report."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Scan
        |--------------------------------------------------------------------------
        */

        if (!data.scan) {
          throw new Error(
            "Scan information was not returned by the server."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Extract Violations
        |--------------------------------------------------------------------------
        */

        const violations =
          extractViolations(
            data
          );

        console.log(
          "Normalized report violations:",
          violations
        );

        /*
        |--------------------------------------------------------------------------
        | Generate Local PDF
        |--------------------------------------------------------------------------
        */

        generatePDFReport(
          data.scan,
          violations
        );
      } catch (err) {
        console.error(
          "PDF report generation error:",
          err
        );

        alert(
          err.message ||
            "Unable to generate PDF report."
        );
      } finally {
        setDownloadingId(
          null
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          min-h-[400px]
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
            Loading scan history...
          </p>
        </div>
      </motion.div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          rounded-3xl
          border
          border-red-500/20
          bg-red-500/5
          p-8
        "
      >
        <div className="flex items-start gap-4">
          <FiAlertTriangle
            className="mt-1 text-red-400"
            size={24}
          />

          <div>
            <h2 className="text-xl font-semibold text-red-400">
              Unable to Load Scan History
            </h2>

            <p className="mt-2 text-gray-400">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-400/20
                bg-red-400/5
                px-4
                py-2
                text-sm
                font-medium
                text-red-400
                transition
                hover:bg-red-400/10
              "
            >
              <FiRefreshCw
                size={15}
              />

              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!scans.length) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-12
          text-center
        "
      >
        <FiFileText
          className="mx-auto text-cyan-400"
          size={42}
        />

        <h2 className="mt-5 text-2xl font-semibold text-white">
          No Scan History
        </h2>

        <p className="mt-2 text-gray-400">
          Your completed accessibility scans
          will appear here.
        </p>
      </motion.div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-[0_0_30px_rgba(6,182,212,0.05)]
      "
    >
      {/* Header */}

      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-xl font-semibold text-white">
          Scan History
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Review your previous accessibility
          scans and download detailed PDF
          reports.
        </p>
      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr
              className="
                border-b
                border-white/10
                bg-white/5
                text-left
              "
            >
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Website
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Accessibility Score
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Issues
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Date
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {scans.map(
              (scan) => (
                <motion.tr
                  key={scan.id}
                  whileHover={{
                    backgroundColor:
                      "rgba(255,255,255,0.04)",
                  }}
                  className="
                    border-b
                    border-white/10
                    last:border-b-0
                  "
                >
                  {/* Website */}

                  <td className="px-6 py-5">
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
                        "
                      >
                        <FiFileText
                          className="text-cyan-400"
                          size={18}
                        />
                      </div>

                      <div>
                        <span className="font-medium text-white">
                          {scan.url}
                        </span>

                        <p className="mt-1 text-xs text-gray-500">
                          Scan #{scan.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}

                  <td className="px-6 py-5">
                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        scan.accessibility_score ??
                          0
                      )}`}
                    >
                      {scan.accessibility_score ??
                        0}
                      %
                    </span>
                  </td>

                  {/* Issues */}

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiAlertTriangle
                        className="text-orange-400"
                        size={16}
                      />

                      {scan.issue_count ??
                        0}
                    </div>
                  </td>

                  {/* Status */}

                  <td className="px-6 py-5">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-green-500/10
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        text-green-400
                      "
                    >
                      <FiCheckCircle
                        size={15}
                      />

                      Completed
                    </span>
                  </td>

                  {/* Date */}

                  <td className="px-6 py-5">
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-gray-400
                      "
                    >
                      <FiClock
                        size={15}
                      />

                      {formatDate(
                        scan.scan_date
                      )}
                    </div>
                  </td>

                  {/* PDF */}

                  <td className="px-6 py-5">
                    <button
                      disabled={
                        downloadingId ===
                        scan.id
                      }
                      onClick={() =>
                        handleDownloadReport(
                          scan.id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-cyan-400/20
                        bg-cyan-400/5
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-cyan-400
                        transition
                        hover:border-cyan-400/40
                        hover:bg-cyan-400/10
                        hover:text-cyan-300
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {downloadingId ===
                      scan.id ? (
                        <>
                          <FiRefreshCw
                            className="animate-spin"
                            size={16}
                          />

                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload
                            size={16}
                          />

                          Download PDF
                        </>
                      )}
                    </button>
                  </td>
                </motion.tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="space-y-4 p-4 md:hidden">
        {scans.map(
          (scan) => (
            <motion.div
              key={scan.id}
              whileTap={{
                scale: 0.99,
              }}
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-5
              "
            >
              {/* Website + Score */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FiFileText
                      className="text-cyan-400"
                      size={17}
                    />

                    <h3 className="font-semibold text-white">
                      {scan.url}
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Scan #{scan.id}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {formatDate(
                      scan.scan_date
                    )}
                  </p>
                </div>

                <span
                  className={`text-xl font-bold ${getScoreColor(
                    scan.accessibility_score ??
                      0
                  )}`}
                >
                  {scan.accessibility_score ??
                    0}
                  %
                </span>
              </div>

              {/* Issues + Status */}

              <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <FiAlertTriangle
                    className="text-orange-400"
                    size={15}
                  />

                  {scan.issue_count ??
                    0}{" "}
                  issues
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-green-400
                  "
                >
                  <FiCheckCircle />

                  Completed
                </span>
              </div>

              {/* PDF */}

              <button
                disabled={
                  downloadingId ===
                  scan.id
                }
                onClick={() =>
                  handleDownloadReport(
                    scan.id
                  )
                }
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/5
                  py-2.5
                  text-sm
                  font-medium
                  text-cyan-400
                  transition
                  hover:border-cyan-400/40
                  hover:bg-cyan-400/10
                  hover:text-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {downloadingId ===
                scan.id ? (
                  <>
                    <FiRefreshCw
                      className="animate-spin"
                      size={16}
                    />

                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FiDownload
                      size={16}
                    />

                    Download PDF Report
                  </>
                )}
              </button>
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}