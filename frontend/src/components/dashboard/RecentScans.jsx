import RecentScansTable from "../tables/RecentScansTable";

export default function RecentScans() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Recent Scans
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Latest accessibility scans performed.
          </p>
        </div>

        <button className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300">
          View All →
        </button>
      </div>

      <RecentScansTable />
    </div>
  );
}