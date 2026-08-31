import {
  FiShield,
  FiSearch,
  FiAlertTriangle,
  FiCpu,
} from "react-icons/fi";

import StatCard from "../cards/StatCard";

export default function DashboardCards({
  overview,
  latestScan,
  comparison,
}) {
  const latestScore =
    latestScan?.scores?.accessibility ?? 0;

  const totalScans =
    overview?.totalScans ?? 0;

  const totalIssues =
    overview?.totalIssues ?? 0;

  const aiCoverage =
    overview?.aiCoverage ?? 0;

  /*
   * ============================================
   * SCORE SUBTITLE
   * ============================================
   */

  const scoreChange =
    comparison?.scoreImprovement ?? 0;

  let scoreSubtitle =
    "Latest accessibility score";

  if (scoreChange > 0) {
    scoreSubtitle =
      `Improved by ${scoreChange} points`;
  }

  if (scoreChange < 0) {
    scoreSubtitle =
      `Decreased by ${Math.abs(
        scoreChange
      )} points`;
  }

  /*
   * ============================================
   * AI COVERAGE SUBTITLE
   * ============================================
   */

  const aiFixes =
    overview?.aiFixes ?? 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Accessibility Score"
        value={`${latestScore}%`}
        subtitle={scoreSubtitle}
        icon={FiShield}
        iconColor="text-cyan-400"
      />

      <StatCard
        title="Total Scans"
        value={totalScans}
        subtitle="Completed accessibility scans"
        icon={FiSearch}
        iconColor="text-violet-400"
      />

      <StatCard
        title="Total Issues"
        value={totalIssues}
        subtitle="Detected across all scans"
        icon={FiAlertTriangle}
        iconColor="text-orange-400"
      />

      <StatCard
        title="AI Remediation Coverage"
        value={`${aiCoverage}%`}
        subtitle={`${aiFixes} issues have AI fixes`}
        icon={FiCpu}
        iconColor="text-emerald-400"
      />

    </div>
  );
}