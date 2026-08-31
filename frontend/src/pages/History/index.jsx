import ScanHistory from "../../components/history/ScanHistory";

export default function History() {
  return (
    <div className="space-y-8">

      {/* Page Introduction */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          Scan History
        </h1>

        <p className="mt-2 max-w-3xl text-gray-400">
          View and review accessibility reports from your previous
          website scans.
        </p>
      </div>

      {/* History */}

      <ScanHistory />

    </div>
  );
}