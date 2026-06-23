const STATUS_CONFIG = {
  Pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  Assigned: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", dot: "#3b82f6" },
  "In Progress": { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd", dot: "#8b5cf6" },
  Resolved: { bg: "#dcfce7", color: "#14532d", border: "#86efac", dot: "#22c55e" },
  Reopened: { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa", dot: "#f97316" },
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
