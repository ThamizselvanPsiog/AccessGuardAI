import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/*
 * ============================================
 * FORMAT DATE
 * ============================================
 */

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

/*
 * ============================================
 * CUSTOM TOOLTIP
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
        p-4
        shadow-xl
      "
    >

      <p className="font-semibold text-white">
        Scan #{item.scanNumber}
      </p>

      <p className="mt-1 max-w-[240px] truncate text-sm text-gray-400">
        {item.url}
      </p>

      <p className="mt-2 text-sm text-gray-400">
        {formatDate(item.date)}
      </p>

      <p className="mt-3 text-lg font-bold text-cyan-400">
        {item.score}%
      </p>

    </div>
  );
}

export default function TrendChart({
  data = [],
}) {
  /*
   * Show latest 10 scans to prevent
   * the chart from becoming overcrowded.
   */

  const chartData =
    Array.isArray(data)
      ? data.slice(-10)
      : [];

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
        Accessibility Score Trend
      </h3>

      <p className="mt-1 mb-6 text-sm text-gray-400">
        Accessibility score across your recent scans.
      </p>

      {chartData.length === 0 ? (

        <div className="flex h-80 items-center justify-center">

          <p className="text-gray-500">
            No trend data available.
          </p>

        </div>

      ) : (

        <div className="h-80">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={chartData}
            >

              <CartesianGrid
                stroke="#334155"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="scanNumber"
                stroke="#94A3B8"
                tickFormatter={
                  value =>
                    `#${value}`
                }
              />

              <YAxis
                stroke="#94A3B8"
                domain={[0, 100]}
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#22D3EE"
                strokeWidth={3}
                dot={{
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}