import { motion } from "framer-motion";
import { FiGlobe } from "react-icons/fi";
import { useState } from "react";

export default function ScanForm({
  onStartScan,
  isScanning,
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleScan = () => {
    setError("");

    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setError(
        "Please enter a valid website URL."
      );
      return;
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      setError(
        "Only HTTP and HTTPS URLs are supported."
      );
      return;
    }

    onStartScan(url.trim());
  };

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

      <h2 className="mb-6 text-2xl font-semibold text-white">
        Scan Website
      </h2>


      {/* URL Input */}

      <div className="relative">

        <FiGlobe
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-xl
            text-gray-400
          "
        />

        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          disabled={isScanning}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/5
            py-4
            pl-12
            pr-4
            text-white
            placeholder:text-gray-500
            outline-none
            transition
            focus:border-cyan-400
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />

      </div>


      {/* URL Error */}

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}


      {/* Info Box */}

      <div
        className="
          mt-6
          rounded-2xl
          border
          border-cyan-500/20
          bg-cyan-500/5
          p-5
        "
      >

        <h3 className="mb-3 font-semibold text-cyan-400">
          Supported Scan Features
        </h3>

        <ul className="space-y-2 text-sm text-gray-300">
          <li>✔ Lighthouse Accessibility Audit</li>
          <li>✔ Playwright Browser Automation</li>
          <li>✔ Pa11y Accessibility Validation</li>
          <li>✔ AI-powered Remediation Suggestions</li>
        </ul>

      </div>


      {/* Button */}

      <motion.button
        whileHover={!isScanning ? { scale: 1.02 } : {}}
        whileTap={!isScanning ? { scale: 0.98 } : {}}
        disabled={isScanning}
        onClick={handleScan}
        className="
          mt-8
          w-full
          rounded-xl
          bg-cyan-500
          py-4
          text-lg
          font-semibold
          text-black
          transition
          hover:bg-cyan-400
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isScanning
          ? "Scanning..."
          : "Start Accessibility Scan"}
      </motion.button>

    </motion.div>
  );
}