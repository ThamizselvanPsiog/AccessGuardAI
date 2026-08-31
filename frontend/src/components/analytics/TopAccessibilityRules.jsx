import { motion } from "framer-motion";

const severityColor = {
    Critical: "bg-red-500/20 text-red-400",
    Serious: "bg-orange-500/20 text-orange-400",
    Moderate: "bg-yellow-500/20 text-yellow-400",
    Minor: "bg-green-500/20 text-green-400",
};

export default function TopAccessibilityRules({ rules = [] }) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >

            <h2 className="mb-6 text-xl font-semibold text-white">
                Top Accessibility Rules
            </h2>

            {rules.length === 0 ? (

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-400">
                    No accessibility violations found.
                </div>

            ) : (

                <div className="overflow-hidden rounded-2xl border border-white/10">

                    <table className="w-full">

                        <thead className="bg-white/5">

                            <tr>

                                <th className="px-6 py-4 text-left text-gray-300">
                                    Rule
                                </th>

                                <th className="text-left text-gray-300">
                                    Severity
                                </th>

                                <th className="text-center text-gray-300">
                                    Count
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {rules.map((item, index) => {

                                const severity =
                                    item.severity || "Moderate";

                                const severityClass =
                                    severityColor[severity] ||
                                    "bg-gray-500/20 text-gray-400";

                                return (

                                    <tr
                                        key={`${item.rule}-${index}`}
                                        className="border-t border-white/5 transition hover:bg-white/5"
                                    >

                                        <td className="px-6 py-5 font-medium text-white">
                                            {item.rule}
                                        </td>

                                        <td>

                                            <span
                                                className={`rounded-full px-3 py-1 text-sm ${severityClass}`}
                                            >
                                                {severity}
                                            </span>

                                        </td>

                                        <td className="text-center font-semibold text-cyan-400">
                                            {item.count}
                                        </td>

                                    </tr>

                                );
                            })}

                        </tbody>

                    </table>

                </div>

            )}

        </motion.div>
    );
}