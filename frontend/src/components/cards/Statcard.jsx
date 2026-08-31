import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-cyan-400",
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="
        group
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        shadow-[0_0_30px_rgba(34,211,238,0.05)]
        transition-all
        duration-300
        hover:border-cyan-400/20
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {value}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-cyan-500/10
          "
        >
          <Icon className={`${iconColor}`} size={28} />
        </div>

      </div>
    </motion.div>
  );
}