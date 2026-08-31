import TrendChart from "../charts/TrendChart";
import SeverityChart from "../charts/SeverityChart";

export default function DashboardCharts({
  scoreTrend,
  severity,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">

      <div className="lg:col-span-2">
        <TrendChart
          data={scoreTrend}
        />
      </div>

      <div>
        <SeverityChart
          data={severity}
        />
      </div>

    </div>
  );
}