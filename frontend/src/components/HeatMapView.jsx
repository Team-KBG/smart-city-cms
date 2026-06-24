import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useMemo } from "react";

// ── Leaflet icon fix (required with bundlers like Vite) ──────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom SVG markers (no external URLs — 100% reliable) ───────────────────

function makeSvgIcon(color, label = "") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
      <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 30 12 30S28 21 28 12C28 5.37 22.63 0 16 0z"
        fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="12" r="7" fill="white" opacity="0.9"/>
      <text x="16" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

// Pre-built icons by complaint type
const ICONS = {
  emergency: makeSvgIcon("#dc2626", "🚨"),
  critical:  makeSvgIcon("#ea580c", "⚡"),
  high:      makeSvgIcon("#d97706", "↑"),
  resolved:  makeSvgIcon("#16a34a", "✓"),
  pending:   makeSvgIcon("#2563eb", "…"),
  default:   makeSvgIcon("#6366f1", "•"),
};

function getIcon(c) {
  if (c.isEmergency)                                  return ICONS.emergency;
  if (c.status === "Resolved")                        return ICONS.resolved;
  if (c.priority === "Critical")                      return ICONS.critical;
  if (c.priority === "High")                          return ICONS.high;
  if (c.status === "Pending")                         return ICONS.pending;
  return ICONS.default;
}

// Category emoji map for popup
const CAT_EMOJI = {
  "Road Damage": "🛣️",
  "Water Supply": "💧",
  Electricity: "⚡",
  "Garbage Collection": "🗑️",
  "Street Lights": "💡",
  "Public Safety": "🚔",
  Sewage: "🚰",
  "Noise Pollution": "🔊",
  "Air Pollution": "💨",
  "Illegal Construction": "🏗️",
  "Animal Menace": "🐕",
  Encroachment: "⛔",
  Fire: "🔥",
  "Gas Leakage": "☁️",
  Accident: "🚑",
};

// ── FitBounds helper ─────────────────────────────────────────────────────────
function FitBounds({ complaints }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length === 0) return;
    const points = complaints.map((c) => [c.location.coordinates[1], c.location.coordinates[0]]);
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      try { map.fitBounds(points, { padding: [50, 50], maxZoom: 16 }); }
      catch { /* ignore */ }
    }
  }, [complaints.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ── Status badge styles ──────────────────────────────────────────────────────
const STATUS_STYLE = {
  Pending:     { bg: "#fef3c7", color: "#92400e" },
  Assigned:    { bg: "#dbeafe", color: "#1e40af" },
  "In Progress": { bg: "#ede9fe", color: "#5b21b6" },
  Resolved:    { bg: "#dcfce7", color: "#14532d" },
  Reopened:    { bg: "#ffedd5", color: "#9a3412" },
};

const PRIORITY_COLOR = {
  Low:      "#6b7280",
  Medium:   "#d97706",
  High:     "#ea580c",
  Critical: "#dc2626",
};

// ── Main component ───────────────────────────────────────────────────────────
export default function HeatMapView({ complaints, showRadius = false }) {
  const defaultCenter = [28.6139, 77.209]; // New Delhi

  const validComplaints = useMemo(() =>
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

  const center = useMemo(() => {
    if (validComplaints.length === 0) return defaultCenter;
    // Use average center for better initial view
    const avgLat = validComplaints.reduce((s, c) => s + c.location.coordinates[1], 0) / validComplaints.length;
    const avgLng = validComplaints.reduce((s, c) => s + c.location.coordinates[0], 0) / validComplaints.length;
    return [avgLat, avgLng];
  }, [validComplaints]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100%", height: "520px", position: "relative" }}>
      {validComplaints.length === 0 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(248,250,252,0.92)",
          borderRadius: "16px",
          gap: "12px",
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: "48px" }}>📍</span>
          <p style={{ fontWeight: "700", fontSize: "16px", color: "#334155" }}>No location data</p>
          <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", maxWidth: "280px" }}>
            Complaints need GPS coordinates to appear on the map. Share your location when submitting.
          </p>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={validComplaints.length === 0 ? 11 : 13}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {validComplaints.length > 0 && <FitBounds complaints={validComplaints} />}

        {/* Cluster group — groups nearby markers automatically */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          disableClusteringAtZoom={17}
        >
          {validComplaints.map((c) => {
            const lat = c.location.coordinates[1];
            const lng = c.location.coordinates[0];
            const statusStyle = STATUS_STYLE[c.status] || { bg: "#f1f5f9", color: "#334155" };
            const catEmoji = CAT_EMOJI[c.category] || "📌";
            const pColor = PRIORITY_COLOR[c.priority] || "#6b7280";

            return (
              <Marker
                key={c._id}
                position={[lat, lng]}
                icon={getIcon(c)}
              >
                <Popup
                  maxWidth={300}
                  minWidth={220}
                  closeButton={true}
                >
                  <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "13px", padding: "2px 0" }}>
                    {/* Emergency banner */}
                    {c.isEmergency && (
                      <div style={{
                        background: "#fef2f2", color: "#dc2626",
                        fontWeight: "700", fontSize: "11px",
                        padding: "4px 10px", borderRadius: "6px",
                        marginBottom: "8px", textAlign: "center",
                        border: "1px solid #fca5a5", letterSpacing: "0.04em",
                      }}>
                        🚨 EMERGENCY COMPLAINT
                      </div>
                    )}

                    {/* Title */}
                    <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px", marginBottom: "6px", lineHeight: 1.3 }}>
                      {catEmoji} {c.title}
                    </p>

                    {/* Complaint ID */}
                    <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", fontFamily: "monospace", fontWeight: "600" }}>
                      {c.complaintId}
                    </p>

                    {/* Category + Department */}
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span style={{ padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                        {c.category}
                      </span>
                      {c.department && (
                        <span style={{ padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                          {c.department}
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    {c.address && (
                      <p style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
                        📍 {c.address}
                      </p>
                    )}

                    {/* Status + Priority + Supports */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "700",
                        background: statusStyle.bg, color: statusStyle.color,
                      }}>
                        {c.status}
                      </span>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "700",
                        background: "#fff",
                        color: pColor,
                        border: `1px solid ${pColor}`,
                      }}>
                        {c.priority}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto", fontWeight: "600" }}>
                        👍 {c.supportCount || 0}
                      </span>
                    </div>
                  </div>
                </Popup>

                {/* Optional: show 100m detection radius */}
                {showRadius && (
                  <Circle
                    center={[lat, lng]}
                    radius={100}
                    pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1, dashArray: "4" }}
                  />
                )}
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
