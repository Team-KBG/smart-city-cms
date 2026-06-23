const COLOR_MAP = {
  blue: { bg: "#dbeafe", color: "#1e40af", icon_bg: "#bfdbfe" },
  yellow: { bg: "#fef3c7", color: "#92400e", icon_bg: "#fde68a" },
  green: { bg: "#dcfce7", color: "#14532d", icon_bg: "#bbf7d0" },
  red: { bg: "#fee2e2", color: "#991b1b", icon_bg: "#fecaca" },
  purple: { bg: "#ede9fe", color: "#5b21b6", icon_bg: "#ddd6fe" },
};

export default function StatsCard({ title, value, icon, color = "blue" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
      <div style={{
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: c.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "4px",
        }}>
          {title}
        </p>
        <p style={{
          fontSize: "28px",
          fontWeight: "800",
          color: c.color,
          lineHeight: 1,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
