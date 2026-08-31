import { motion } from "framer-motion";

import {
  FiActivity,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";

export default function DashboardInsights({
  latestScan,
  previousScan,
  comparison,
  overview,
  topRule,
}) {
  const scoreChange =
    comparison?.scoreImprovement ?? 0;

  const issueChange =
    comparison?.issueChange ?? 0;

  const highPriorityIssues =
    overview?.highPriorityIssues ?? 0;

  return (
    <div className="grid gap-6 xl:grid-cols-3">

      {/* ====================================== */}
      {/* ACCESSIBILITY HEALTH */}
      {/* ====================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
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
          p-6
          backdrop-blur-xl
          xl:col-span-2
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/10
              text-cyan-400
            "
          >
            <FiActivity size={21} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-white">
              Accessibility Health
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Latest scan compared with your previous scan.
            </p>

          </div>

        </div>


        {/* Latest Scan */}

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

          <p className="text-sm text-gray-400">
            Latest Scan
          </p>

          <p
            className="
              mt-2
              break-all
              font-medium
              text-white
            "
          >
            {latestScan?.url ||
              "Unknown website"}
          </p>


          {/* Scores */}

          <div
            className="
              mt-5
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <Score
              label="Accessibility"
              value={
                latestScan?.scores
                  ?.accessibility
              }
            />

            <Score
              label="Performance"
              value={
                latestScan?.scores
                  ?.performance
              }
            />

            <Score
              label="Best Practices"
              value={
                latestScan?.scores
                  ?.bestPractices
              }
            />

            <Score
              label="SEO"
              value={
                latestScan?.scores?.seo
              }
            />

          </div>

        </div>


        {/* Comparison */}

        <div
          className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
          "
        >

          <ComparisonCard
            title="Accessibility Score Change"
            value={scoreChange}
            suffix=" points"
            positiveIsGood
          />

          <ComparisonCard
            title="Issue Count Change"
            value={issueChange}
            suffix=" issues"
            positiveIsGood={false}
          />

        </div>


        {!previousScan && (

          <p className="mt-5 text-sm text-gray-500">
            Complete another scan to unlock
            comparison insights.
          </p>

        )}

      </motion.div>


      {/* ====================================== */}
      {/* NEEDS ATTENTION */}
      {/* ====================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
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
          p-6
          backdrop-blur-xl
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-orange-500/10
              text-orange-400
            "
          >
            <FiTarget size={21} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-white">
              Needs Attention
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Highest-priority accessibility risks.
            </p>

          </div>

        </div>


        {/* Priority Issues */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            p-5
          "
        >

          <div className="flex items-center gap-3">

            <FiAlertTriangle
              className="text-red-400"
              size={21}
            />

            <div>

              <p className="text-sm text-gray-400">
                Critical + Serious Issues
              </p>

              <p className="mt-1 text-3xl font-bold text-red-400">
                {highPriorityIssues}
              </p>

            </div>

          </div>

        </div>


        {/* Most Common Rule */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-white/10
            bg-black/10
            p-5
          "
        >

          <p className="text-sm text-gray-400">
            Most Common Rule
          </p>

          {topRule ? (

            <>
              <p
                className="
                  mt-2
                  break-words
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {topRule.ruleId}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Found{" "}
                <span className="font-semibold text-orange-400">
                  {topRule.occurrences}
                </span>{" "}
                times across your scans.
              </p>

              {topRule.wcagCriterion && (

                <p className="mt-3 text-sm text-cyan-400">
                  WCAG{" "}
                  {topRule.wcagCriterion}
                </p>

              )}

            </>

          ) : (

            <div className="mt-3 flex items-center gap-2 text-green-400">

              <FiCheckCircle />

              <span className="text-sm">
                No recurring accessibility issue.
              </span>

            </div>

          )}

        </div>

      </motion.div>

    </div>
  );
}


/*
 * ============================================
 * SCORE
 * ============================================
 */

function Score({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-white">
        {value ?? "--"}%
      </p>

    </div>
  );
}


/*
 * ============================================
 * COMPARISON CARD
 * ============================================
 */

function ComparisonCard({
  title,
  value,
  suffix,
  positiveIsGood,
}) {
  const number =
    Number(value || 0);

  const isPositive =
    number > 0;

  const isNegative =
    number < 0;

  /*
   * Determine whether the change is beneficial.
   *
   * Score:
   * higher = better
   *
   * Issues:
   * lower = better
   */

  let isGood = null;

  if (number !== 0) {

    isGood =
      positiveIsGood
        ? isPositive
        : isNegative;

  }

  let color =
    "text-gray-400";

  if (isGood === true) {
    color =
      "text-green-400";
  }

  if (isGood === false) {
    color =
      "text-red-400";
  }

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
        {title}
      </p>

      <div
        className={`
          mt-3
          flex
          items-center
          gap-2
          text-2xl
          font-bold
          ${color}
        `}
      >

        {isPositive && (
          <FiArrowUp />
        )}

        {isNegative && (
          <FiArrowDown />
        )}

        <span>
          {number > 0
            ? "+"
            : ""}
          {number}
          {suffix}
        </span>

      </div>

    </div>
  );
}