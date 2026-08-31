import { motion } from "framer-motion";

const recentScans = [
  {
    website: "google.com",
    score: 98,
    violations: 4,
    scanTime: "Today",
  },
  {
    website: "amazon.com",
    score: 94,
    violations: 12,
    scanTime: "Today",
  },
  {
    website: "github.com",
    score: 96,
    violations: 7,
    scanTime: "Yesterday",
  },
  {
    website: "bbc.com",
    score: 89,
    violations: 21,
    scanTime: "Yesterday",
  },
];

const getScoreColor = (score) => {
  if (score >= 95) return "bg-emerald-500/20 text-emerald-400";
  if (score >= 85) return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
};

export default function RecentScansTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-white/10">
          <tr className="text-sm uppercase tracking-wider text-gray-400">
            <th className="pb-4">Website</th>
            <th className="pb-4">Score</th>
            <th className="pb-4">Violations</th>
            <th className="pb-4">Scan Time</th>
          </tr>
        </thead>

        <tbody>
          {recentScans.map((scan, index) => (
            <motion.tr
              key={index}
              whileHover={{ scale: 1.01 }}
              className="border-b border-white/5 transition-colors hover:bg-white/5"
            >
              <td className="py-5 font-medium text-white">
                {scan.website}
              </td>

              <td className="py-5">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(
                    scan.score
                  )}`}
                >
                  {scan.score}
                </span>
              </td>

              <td className="py-5 text-gray-300">
                {scan.violations}
              </td>

              <td className="py-5 text-gray-400">
                {scan.scanTime}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}