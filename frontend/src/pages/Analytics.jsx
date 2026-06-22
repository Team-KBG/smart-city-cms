import { useEffect, useState } from "react";
import API from "../api/axios";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/analytics")
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Smart Analytics Dashboard</h1>
      <p className="mt-2 text-slate-500">
        Insights on complaint trends, resolution times, and department performance.
      </p>

      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500">Loading analytics...</p>
        ) : (
          <AnalyticsCharts analytics={analytics} />
        )}
      </div>
    </div>
  );
}
