import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";

const STATUS_ORDER = ["Pending", "Assigned", "In Progress", "Resolved"];

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get("id") || "");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supporting, setSupporting] = useState(false);
  const toast = useToast();

  // Auto-track if ID is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      trackComplaint(idFromUrl);
    }
  }, []);

  const trackComplaint = async (id) => {
    const targetId = (id || complaintId).trim();
    if (!targetId) return;

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const { data } = await API.get(`/api/complaints/track/${targetId}`);
      setComplaint(data.data);
    } catch {
      setError("Complaint not found. Please check your Complaint ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    await trackComplaint();
  };

  const handleSupport = async () => {
    if (!complaint) return;
    setSupporting(true);
    try {
      const { data } = await API.post(`/api/complaints/${complaint._id}/support`);
      setComplaint(data.data);
      toast.success("You have supported this complaint! 👍");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to support complaint");
    } finally {
      setSupporting(false);
    }
  };

  const currentStatusIdx = complaint ? STATUS_ORDER.indexOf(complaint.status) : -1;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>Track Complaint</h1>
        <p>Enter your unique Complaint ID to view status and updates.</p>
      </div>

      <form onSubmit={handleTrack} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          placeholder="e.g. CMP-20250622-1234"
          required
          style={{ flex: 1, fontFamily: "monospace" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} /> Searching...</>
          ) : "🔍 Track"}
        </button>
      </form>

      {error && (
        <div className="alert alert-error animate-fade-in">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {complaint && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header Card */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Complaint ID
                </p>
                <p style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "17px", color: "var(--primary-600)" }}>
                  {complaint.complaintId}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <StatusBadge status={complaint.status} />
                {complaint.isEmergency && (
                  <span style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    animation: "pulse-glow 2s infinite",
                  }}>
                    🚨 EMERGENCY
                  </span>
                )}
              </div>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
              {complaint.title}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {complaint.description}
            </p>

            {/* Status Progress Bar */}
            {complaint.status !== "Reopened" && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                  Progress
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {STATUS_ORDER.map((status, idx) => {
                    const isCompleted = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    return (
                      <div key={status} style={{ display: "flex", alignItems: "center", flex: idx < STATUS_ORDER.length - 1 ? 1 : "none" }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: isCompleted ? "var(--primary-600)" : "var(--border-color)",
                          color: isCompleted ? "white" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "700",
                          flexShrink: 0,
                          boxShadow: isCurrent ? "0 0 0 3px rgba(59,130,246,0.25)" : "none",
                          transition: "all 0.3s ease",
                        }}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        {idx < STATUS_ORDER.length - 1 && (
                          <div style={{
                            flex: 1,
                            height: "3px",
                            background: isCompleted && idx < currentStatusIdx ? "var(--primary-600)" : "var(--border-color)",
                            margin: "0 4px",
                            borderRadius: "2px",
                            transition: "background 0.3s ease",
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  {STATUS_ORDER.map((status, idx) => (
                    <span key={status} style={{
                      fontSize: "10px",
                      color: idx <= currentStatusIdx ? "var(--primary-600)" : "var(--text-muted)",
                      fontWeight: idx === currentStatusIdx ? "700" : "500",
                      flex: idx < STATUS_ORDER.length - 1 ? 1 : "none",
                    }}>
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {[
              { label: "Category", value: complaint.category, icon: "🏷️" },
              { label: "Department", value: complaint.department || "Not assigned", icon: "🏢" },
              { label: "Priority", value: complaint.effectivePriority || complaint.priority, icon: "⚡" },
              { label: "Supports", value: `${complaint.supportCount} people`, icon: "👍" },
              { label: "Location", value: complaint.address || "Not specified", icon: "📍" },
              { label: "Reported", value: new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: "📅" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card" style={{ padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "5px" }}>
                  {icon} {label}
                </p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Image */}
          {complaint.imageUrl && (
            <div className="card" style={{ padding: "16px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>
                📷 Photo Evidence
              </p>
              <img
                src={`http://localhost:5000${complaint.imageUrl}`}
                alt="Complaint evidence"
                style={{ maxHeight: "200px", borderRadius: "10px", objectFit: "cover", width: "100%" }}
              />
            </div>
          )}

          {/* Status History */}
          {complaint.statusHistory?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
                📋 Status History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[...complaint.statusHistory].reverse().map((entry, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: "14px",
                    paddingBottom: i < complaint.statusHistory.length - 1 ? "16px" : "0",
                    borderLeft: i < complaint.statusHistory.length - 1 ? "2px solid var(--border-color)" : "none",
                    marginLeft: "11px",
                    paddingLeft: "20px",
                    position: "relative",
                  }}>
                    <div style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: i === 0 ? "var(--primary-600)" : "var(--border-color-strong)",
                      border: "2px solid var(--card-bg)",
                      position: "absolute",
                      left: "-8px",
                      top: "0",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                        <StatusBadge status={entry.status} />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(entry.changedAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {entry.note && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support section */}
          {complaint.status !== "Resolved" && (
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>
                  👍 Support this complaint
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {complaint.supportCount} people have already supported this
                </p>
              </div>
              <button
                onClick={handleSupport}
                disabled={supporting}
                className="btn btn-primary"
              >
                {supporting ? (
                  <><span className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} /> Supporting...</>
                ) : "👍 Support"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
