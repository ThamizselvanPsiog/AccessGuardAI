import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

export default function AppAlert({
  show,
  message,
  type = "error",
  onClose,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.95,
          }}
          transition={{ duration: 0.2 }}
          className="
            fixed
            right-6
            top-6
            z-[9999]
            w-[360px]
            max-w-[calc(100vw-3rem)]
            rounded-2xl
            border
            border-white/10
            bg-slate-900/95
            p-4
            shadow-[0_0_35px_rgba(0,0,0,0.35)]
            backdrop-blur-xl
          "
        >
          <div className="flex items-start gap-3">

            {/* Icon */}

            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  type === "success"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }
              `}
            >
              {type === "success" ? (
                <FiCheckCircle size={20} />
              ) : (
                <FiAlertTriangle size={20} />
              )}
            </div>

            {/* Message */}

            <div className="flex-1">

              <h3 className="font-semibold text-white">
                {type === "success"
                  ? "Success"
                  : "Something went wrong"}
              </h3>

              <p className="mt-1 text-sm leading-5 text-gray-400">
                {message}
              </p>

            </div>

            {/* Close */}

            <button
              type="button"
              onClick={onClose}
              className="
                text-gray-500
                transition
                hover:text-white
              "
            >
              <FiX size={18} />
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}