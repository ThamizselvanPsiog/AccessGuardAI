import { motion } from "framer-motion";

export default function ScoreCard({
  title,
  value,
  color,
}) {

    const getStatus = (score) => {
    if (score >= 95) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Average";

    return "Needs Improvement";
  };
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all"
    >
      <p className="text-gray-400">
        {title}
      </p>

      <h2
        className={`mt-3 text-4xl font-bold ${color}`}
      >
        {value}%
      </h2>

      <p className="mt-3 text-sm text-gray-400">
        {getStatus(value)}
      </p>
    </motion.div>
  );
}