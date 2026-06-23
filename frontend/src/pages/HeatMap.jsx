import { useEffect, useState } from "react";
import API from "../api/axios";
import HeatMapView from "../components/HeatMapView";

const PRIORITY_COLORS = {
  Low: { bg: "#f1f5f9", color: "#475569" },
  Medium: { bg: "#fef3c7", color: "#92400e" },
  High: { bg: "#fff7ed", color: "#c2410c" },
  Critical: { bg: "#fef2f2", color: "#dc2626" },
};

export default function HeatMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | emergency | category

  useEffect(() => {
    API.get("/api/complaints/heatmap")
      .then(({ data }) => setComplaints(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === "emergency") return c.isEmergency;
    if (filter === "pending") return c.status === "Pending";
    if (filter === "critical") return c.priority === "Critical" || c.effectivePriority === "Critical";
    return true;
  });

  const totalOnMap = filtered.filter((c) => c.location?.coordinates?.length === 2).length;
  const emergencyCount = complaints.filter((c) => c.isEmergency).length;
  const uniqueCategories = [...new Set(complaints.map((c) => c.category))];

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>🗺️ Complaint Heat Map</h1>
        <p>
          Visualize complaint clusters across the city. Click markers for details.
          Red markers indicate emergencies.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        {[
          { label: "Total Mapped", value: complaints.filter(c => c.location?.coordinates?.length === 2).length, color: "#2563eb" },
          { label: "Emergencies", value: emergencyCount, color: "#dc2626" },
          { label: "Categories", value: uniqueCategories.length, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 18px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {[
          { key: "all", label: "All Complaints" },
          { key: "emergency", label: "🚨 Emergencies Only" },
          { key: "pending", label: "⏳ Pending Only" },
          { key: "critical", label: "🔴 Critical Priority" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-secondary"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[
          { color: "#3b82f6", label: "Regular Complaint" },
          { color: "#ef4444", label: "Emergency" },
        ].map((l) => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color, display: "inline-block" }} />
            {l.label}
          </span>
        ))}
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
          Showing {totalOnMap} of {complaints.length} complaints
        </span>
      </div>

      {/* Map */}
      {loading ? (
        <div className="skeleton" style={{ height: "500px", borderRadius: "16px" }} />
      ) : (
        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}>
          <HeatMapView complaints={filtered} />
        </div>
      )}

      {/* Category breakdown */}
      {!loading && uniqueCategories.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "14px" }}>
            📊 Category Breakdown (Mapped Complaints)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {uniqueCategories.map((cat) => {
              const count = complaints.filter((c) => c.category === cat).length;
              return (
                <span
                  key={cat}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "var(--bg-surface-alt)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {cat} ({count})
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
