const STATUS_CONFIG = {
  Pending: { bg: "rgba(245, 158, 11, 0.08)", color: "#d97706", border: "rgba(245, 158, 11, 0.25)", dot: "#f59e0b" },
  Assigned: { bg: "rgba(59, 130, 246, 0.08)", color: "#2563eb", border: "rgba(59, 130, 246, 0.25)", dot: "#3b82f6" },
  "In Progress": { bg: "rgba(124, 58, 237, 0.08)", color: "#8b5cf6", border: "rgba(124, 58, 237, 0.25)", dot: "#8b5cf6" },
  Resolved: { bg: "rgba(34, 197, 94, 0.08)", color: "#16a34a", border: "rgba(34, 197, 94, 0.25)", dot: "#22c55e" },
  Reopened: { bg: "rgba(249, 115, 22, 0.08)", color: "#ea580c", border: "rgba(249, 115, 22, 0.25)", dot: "#f97316" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", dot: "#94a3b8" };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.02em",
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: config.dot,
        flexShrink: 0,
      }} />
      {status}
    </span>
  );
}
