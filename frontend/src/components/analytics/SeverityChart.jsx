import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = [
    "#EF4444",
    "#F97316",
    "#FACC15",
    "#22C55E",
];

export default function SeverityChart({ data = [] }) {

    const totalIssues = data.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
    );

    return (
        <div
            className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                backdrop-blur-xl
                shadow-[0_0_30px_rgba(6,182,212,0.05)]
            "
        >

            <h2 className="mb-8 text-xl font-semibold text-white">
                Severity Distribution
            </h2>

            <ResponsiveContainer
                width="100%"
                height={340}
            >

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={115}
                        paddingAngle={3}
                        animationDuration={1200}
                    >

                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}

                    </Pie>

                    <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FFFFFF"
                        fontSize="40"
                        fontWeight="700"
                    >
                        {totalIssues}
                    </text>

                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#94A3B8"
                        fontSize="15"
                    >
                        Accessibility Issues
                    </text>

                    <Tooltip
                        contentStyle={{
                            background: "#111827",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "14px",
                            color: "#FFFFFF",
                        }}
                        labelStyle={{
                            color: "#FFFFFF",
                        }}
                    />

                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{
                            color: "#E5E7EB",
                            paddingTop: "20px",
                            fontSize: "14px",
                        }}
                    />

                </PieChart>

            </ResponsiveContainer>

        </div>
    );
}