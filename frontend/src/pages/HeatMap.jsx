import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import HeatMapView from "../components/HeatMapView";

// Category emoji quick-lookup
const CAT_EMOJI = {
  "Road Damage": "🛣️", "Water Supply": "💧", Electricity: "⚡",
  "Garbage Collection": "🗑️", "Street Lights": "💡", "Public Safety": "🚔",
  Sewage: "🚰", "Noise Pollution": "🔊", "Air Pollution": "💨",
  "Illegal Construction": "🏗️", "Animal Menace": "🐕", Encroachment: "⛔",
  Fire: "🔥", "Gas Leakage": "☁️", Accident: "🚑",
};

const FILTERS = [
  { key: "all",       label: "All",        icon: "🗺️" },
  { key: "emergency", label: "Emergency",  icon: "🚨" },
  { key: "pending",   label: "Pending",    icon: "⏳" },
  { key: "resolved",  label: "Resolved",   icon: "✅" },
  { key: "critical",  label: "Critical",   icon: "🔴" },
];

const LEGEND_ITEMS = [
  { color: "#dc2626", label: "Emergency",   symbol: "🚨" },
  { color: "#ea580c", label: "Critical Priority", symbol: "⚡" },
  { color: "#d97706", label: "High Priority",     symbol: "↑" },
  { color: "#2563eb", label: "Pending",           symbol: "…" },
  { color: "#16a34a", label: "Resolved",          symbol: "✓" },
  { color: "#6366f1", label: "Other",             symbol: "•" },
];

export default function HeatMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showRadius, setShowRadius] = useState(false);
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    API.get("/api/complaints/heatmap")
      .then(({ data }) => {
        setComplaints(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        console.error("Heatmap load error:", err);
        setError("Failed to load complaint data. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Complaints that have valid coordinates
  const mappableComplaints = useMemo(() =>
    complaints.filter(
      (c) =>
        Array.isArray(c.location?.coordinates) &&
        c.location.coordinates.length === 2 &&
        !isNaN(c.location.coordinates[0]) &&
        !isNaN(c.location.coordinates[1]) &&
        c.location.coordinates[0] !== 0 &&
        c.location.coordinates[1] !== 0
    ),
    [complaints]
  );

  // Apply status/type filter
  const filtered = useMemo(() => {
    let list = mappableComplaints;

    // Status/type filter
    if (filter === "emergency") {
      // Emergency = isEmergency flag OR emergency category
      list = list.filter((c) => c.isEmergency || ["Fire", "Gas Leakage", "Accident"].includes(c.category));
    } else if (filter === "pending") {
      list = list.filter((c) => c.status === "Pending");
    } else if (filter === "resolved") {
      list = list.filter((c) => c.status === "Resolved");
    } else if (filter === "critical") {
      // Check BOTH priority fields — auto-escalated complaints use effectivePriority
      list = list.filter(
        (c) => c.priority === "Critical" || c.effectivePriority === "Critical"
      );
    }

    // Category filter (independent from status filter)
    if (catFilter !== "all") {
      list = list.filter((c) => c.category === catFilter);
    }

    return list;
  }, [mappableComplaints, filter, catFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: complaints.length,
    mapped: mappableComplaints.length,
    unmapped: complaints.length - mappableComplaints.length,
    emergencies: complaints.filter((c) => c.isEmergency).length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  }), [complaints, mappableComplaints]);

  // Category breakdown (from mappable only)
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    mappableComplaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [mappableComplaints]);

  const uniqueCategories = categoryBreakdown.map(([cat]) => cat);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
            🗺️ Complaint Heat Map
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Visualize complaint hotspots. Click any marker to see details. Clusters show dense areas.
          </p>
        </div>

        {/* Radius toggle */}
        <label style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 14px", borderRadius: "10px",
          border: "1.5px solid var(--border-color)",
          background: "var(--bg-surface-alt)",
          cursor: "pointer", fontSize: "12px", fontWeight: "600",
          color: "var(--text-secondary)",
        }}>
          <input
            type="checkbox"
            checked={showRadius}
            onChange={(e) => setShowRadius(e.target.checked)}
            style={{ accentColor: "#2563eb" }}
          />
          Show 100m Detection Radius
        </label>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Total", value: stats.total, color: "#475569" },
          { label: "On Map", value: stats.mapped, color: "#2563eb" },
          { label: "No GPS", value: stats.unmapped, color: "#94a3b8" },
          { label: "🚨 Emergency", value: stats.emergencies, color: "#dc2626" },
          { label: "⏳ Pending", value: stats.pending, color: "#d97706" },
          { label: "✅ Resolved", value: stats.resolved, color: "#16a34a" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", marginTop: "4px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginRight: "4px" }}>Status:</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-secondary"}`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Category filter (if data loaded) */}
      {uniqueCategories.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginRight: "4px" }}>Category:</span>
          <button
            onClick={() => setCatFilter("all")}
            className={`btn btn-sm ${catFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`btn btn-sm ${catFilter === cat ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "11px" }}
            >
              {CAT_EMOJI[cat] || "📌"} {cat}
            </button>
          ))}
        </div>
      )}

      {/* Legend + showing count */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {LEGEND_ITEMS.map((l) => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>
              <span style={{
                width: "16px", height: "16px", borderRadius: "50%",
                background: l.color, display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "8px", color: "white", fontWeight: "900",
                flexShrink: 0,
              }}>
                {l.symbol}
              </span>
              {l.label}
            </span>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
          Showing {filtered.length} of {mappableComplaints.length} mapped complaints
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "12px" }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Map */}
      {loading ? (
        <div className="skeleton" style={{ height: "520px", borderRadius: "16px" }} />
      ) : (
        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}>
          <HeatMapView complaints={filtered} showRadius={showRadius} />
        </div>
      )}

      {/* Category Breakdown Card */}
      {!loading && categoryBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
              📊 Category Breakdown (Mapped Complaints)
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {mappableComplaints.length} complaints with location
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categoryBreakdown.map(([cat, count]) => {
              const pct = Math.round((count / mappableComplaints.length) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>
                      {CAT_EMOJI[cat] || "📌"} {cat}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "var(--bg-surface-alt)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "3px",
                      background: "var(--primary-600)",
                      width: `${pct}%`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip about GPS */}
          {stats.unmapped > 0 && (
            <div className="alert alert-warning" style={{ marginTop: "14px" }}>
              <span>💡</span>
              <span>
                <strong>{stats.unmapped} complaint{stats.unmapped !== 1 ? "s" : ""}</strong> have no GPS data and are not shown on the map.
                Citizens should allow location access when submitting complaints.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
