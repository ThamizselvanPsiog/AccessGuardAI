import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
];

/*
 * ============================================
 * TOOLTIP
 * ============================================
 */

function CustomTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const item =
    payload[0]?.payload;

  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-slate-950/95
        px-4
        py-3
        shadow-xl
      "
    >

      <p className="font-semibold text-white">
        {item.name}
      </p>

      <p className="mt-1 text-sm text-gray-400">
        {item.value} issues
      </p>

    </div>
  );
}

export default function SeverityChart({
  data = [],
}) {
  const severityData =
    Array.isArray(data)
      ? data
      : [];

  const totalIssues =
    severityData.reduce(
      (sum, item) =>
        sum +
        Number(
          item.value || 0
        ),
      0
    );

  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      "
    >

      <h3 className="text-xl font-semibold text-white">
        Issue Severity
      </h3>

      <p className="mt-1 mb-6 text-sm text-gray-400">
        Severity distribution across all scans.
      </p>

      {totalIssues === 0 ? (

        <div className="flex h-80 items-center justify-center">

          <p className="text-gray-500">
            No accessibility issues detected.
          </p>

        </div>

      ) : (

        <div className="h-80">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                animationDuration={1000}
              >

                {severityData.map(
                  (entry, index) => (

                    <Cell
                      key={entry.name}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              {/* Center total */}

              <text
                x="50%"
                y="42%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontSize="32"
                fontWeight="700"
              >
                {totalIssues}
              </text>

              <text
                x="50%"
                y="52%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94A3B8"
                fontSize="13"
              >
                Issues
              </text>

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{
                  color: "#E5E7EB",
                  fontSize: "13px",
                }}
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}