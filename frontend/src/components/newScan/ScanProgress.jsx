import { motion } from "framer-motion";
import {
  FiActivity,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

export default function ScanProgress() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-8
        backdrop-blur-xl
      "
    >

      <div className="flex items-center gap-4">

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-cyan-500/10
            text-cyan-400
          "
        >
          <FiActivity size={24} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Accessibility Scan in Progress
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Please wait while AccessGuardAI analyzes the website.
          </p>
        </div>

      </div>


      {/* Animated loading bar */}

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">

        <motion.div
          className="h-full w-1/2 rounded-full bg-cyan-400"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

      </div>


      {/* Current operations */}

      <div className="mt-8 space-y-4">

        <ScanStep
          label="Running Playwright accessibility analysis"
        />

        <ScanStep
          label="Running Lighthouse performance analysis"
        />

        <ScanStep
          label="Running Pa11y validation"
        />

        <ScanStep
          label="Generating AI remediation suggestions"
        />

        <ScanStep
          label="Validating fixes and generating guidance"
        />

        <ScanStep
          label="Saving scan report"
        />

      </div>


      <div
        className="
          mt-6
          rounded-xl
          border
          border-cyan-500/20
          bg-cyan-500/5
          p-4
          text-sm
          text-gray-300
        "
      >
        <div className="flex items-center gap-3">

          <FiLoader
            className="animate-spin text-cyan-400"
            size={18}
          />

          The scan may take a few moments depending on the
          website and the AI analysis.
        </div>
      </div>

    </motion.div>
  );
}


/* ================================================= */
/* Scan Step */
/* ================================================= */

function ScanStep({ label }) {
  return (
    <div className="flex items-center gap-3">

      <FiCheckCircle
        className="text-cyan-400"
        size={19}
      />

      <span className="text-sm text-gray-300">
        {label}
      </span>

    </div>
  );
}