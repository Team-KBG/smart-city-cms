import { useEffect, useState } from "react";
import API from "../api/axios";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = () => {
    setLoading(true);
    setError("");
    API.get("/api/analytics")
      .then(({ data }) => setAnalytics(data.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
            Smart Analytics Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Real-time insights on complaint trends, resolution times, and department performance.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="btn btn-secondary"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "16px" }} />
            ))}
          </div>
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
            <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
            <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <AnalyticsCharts analytics={analytics} />
      )}
    </div>
  );
}
