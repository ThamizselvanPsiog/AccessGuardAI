import {
  FiCheckCircle,
  FiLoader,
  FiCircle,
} from "react-icons/fi";

export default function ScanSteps({ progress }) {
  const steps = [
    { label: "Browser Initialized", start: 0, end: 15 },
    { label: "Opening Website", start: 15, end: 30 },
    { label: "Running Lighthouse", start: 30, end: 55 },
    { label: "Running Pa11y", start: 55, end: 75 },
    { label: "Generating AI Remediation", start: 75, end: 95 },
    { label: "Saving Report", start: 95, end: 100 },
    { label: "Scan Complete", start: 100, end: 101 },
  ];

  return (
    <div className="mt-8 space-y-4">
      {steps.map((step, index) => {
        let icon = (
          <FiCircle className="text-gray-500" size={20} />
        );

        let textColor = "text-gray-400";

        if (progress >= step.end) {
          icon = (
            <FiCheckCircle
              className="text-green-400"
              size={20}
            />
          );

          textColor = "text-white";
        } else if (
          progress >= step.start &&
          progress < step.end
        ) {
          icon = (
            <FiLoader
              className="animate-spin text-cyan-400"
              size={20}
            />
          );

          textColor = "text-cyan-300";
        }

        return (
          <div
            key={index}
            className="flex items-center gap-4"
          >
            {icon}

            <span className={textColor}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}