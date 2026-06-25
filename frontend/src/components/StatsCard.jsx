const COLOR_MAP = {
  blue: { bg: "rgba(59, 130, 246, 0.08)", color: "var(--primary-500)", border: "rgba(59, 130, 246, 0.15)" },
  yellow: { bg: "rgba(245, 158, 11, 0.08)", color: "var(--warning-500)", border: "rgba(245, 158, 11, 0.15)" },
  green: { bg: "rgba(34, 197, 94, 0.08)", color: "var(--success-500)", border: "rgba(34, 197, 94, 0.15)" },
  red: { bg: "rgba(239, 68, 68, 0.08)", color: "var(--danger-500)", border: "rgba(239, 68, 68, 0.15)" },
  purple: { bg: "rgba(124, 58, 237, 0.08)", color: "#7c3aed", border: "rgba(124, 58, 237, 0.15)" },
};

export default function StatsCard({ title, value, icon, color = "blue" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="card card-interactive" style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "20px", 
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative gradient corner indicator */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "4px",
        height: "100%",
        background: c.color,
        opacity: 0.8
      }} />

      <div style={{
        width: "52px",
        height: "52px",
        borderRadius: "12px",
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)"
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "6px",
        }}>
          {title}
        </p>
        <p style={{
          fontSize: "30px",
          fontWeight: "850",
          color: "var(--text-primary)",
          lineHeight: 1,
          letterSpacing: "-0.02em"
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
