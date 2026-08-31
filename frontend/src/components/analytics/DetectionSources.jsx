import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
} from "recharts";

export default function DetectionSources({ data = [] }) {

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <h2 className="mb-6 text-xl font-semibold text-white">
                Detection Sources
            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart data={data}>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                    />

                    <XAxis
                        dataKey="engine"
                        stroke="#CBD5E1"
                    />

                    <YAxis
                        stroke="#CBD5E1"
                    />

                    <Tooltip />

                    <Bar
                        dataKey="issues"
                        fill="#06b6d4"
                        radius={[10, 10, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
}