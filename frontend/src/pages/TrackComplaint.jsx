import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const STATUS_ORDER = ["Pending", "Assigned", "In Progress", "Resolved"];

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get("id") || "");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supporting, setSupporting] = useState(false);
  const toast = useToast();
  const { isLoggedIn, user } = useAuth();

  // Auto-track if ID is in URL params
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      doTrack(idFromUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doTrack = async (id) => {
    const targetId = (id || complaintId).trim();
    if (!targetId) return;

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const { data } = await API.get(`/api/complaints/track/${targetId}`);
      setComplaint(data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Complaint not found. Please check your Complaint ID and try again.");
      } else {
        setError("Failed to fetch complaint. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    await doTrack(complaintId);
  };

  const handleSupport = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to support a complaint.");
      return;
    }
    if (!complaint) return;

    setSupporting(true);
    try {
      const { data } = await API.post(`/api/complaints/${complaint._id}/support`);
      setComplaint(data.data);
      toast.success("You have supported this complaint! 👍");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to support complaint";
      toast.error(msg);
    } finally {
      setSupporting(false);
    }
  };

  // Check if the current user has already supported this complaint
  const hasSupported = isLoggedIn && complaint?.supportedBy?.some(
    (id) => id === user?.id || id?.toString() === user?.id?.toString()
  );

  // Check if current user is the complaint owner
  const isOwner = complaint?.submittedBy?._id === user?.id ||
    complaint?.submittedBy === user?.id;

  const currentStatusIdx = complaint
    ? STATUS_ORDER.indexOf(complaint.status)
    : -1;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>🔍 Track Complaint</h1>
        <p>Enter your unique Complaint ID to view real-time status and updates.</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleTrack} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          placeholder="e.g. CMP-20250622-1234"
          required
          style={{ flex: 1, fontFamily: "monospace", fontSize: "14px" }}
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

            {/* Progress Bar */}
            {complaint.status !== "Reopened" && (
              <div style={{ marginTop: "24px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                  Progress
                </p>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {STATUS_ORDER.map((status, idx) => {
                    const isCompleted = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    const isLast = idx === STATUS_ORDER.length - 1;
                    return (
                      <div key={status} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: isCompleted ? "var(--primary-600)" : "var(--border-color)",
                            color: isCompleted ? "white" : "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            flexShrink: 0,
                            boxShadow: isCurrent ? "0 0 0 4px rgba(59,130,246,0.2)" : "none",
                            transition: "all 0.3s ease",
                          }}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span style={{
                            fontSize: "10px",
                            color: isCompleted ? "var(--primary-600)" : "var(--text-muted)",
                            fontWeight: isCurrent ? "700" : "500",
                            whiteSpace: "nowrap",
                          }}>
                            {status}
                          </span>
                        </div>
                        {!isLast && (
                          <div style={{
                            flex: 1,
                            height: "3px",
                            background: idx < currentStatusIdx ? "var(--primary-600)" : "var(--border-color)",
                            margin: "0 6px",
                            marginBottom: "18px",
                            borderRadius: "2px",
                            transition: "background 0.3s ease",
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {complaint.status === "Reopened" && (
              <div className="alert alert-warning" style={{ marginTop: "16px" }}>
                <span>🔄</span>
                <span>This complaint was reopened and is under review again.</span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "10px" }}>
            {[
              { label: "Category", value: complaint.category, icon: "🏷️" },
              { label: "Department", value: complaint.department || "Not yet assigned", icon: "🏢" },
              { label: "Priority", value: complaint.effectivePriority || complaint.priority, icon: "⚡" },
              { label: "Supporters", value: `${complaint.supportCount} people`, icon: "👍" },
              { label: "Location", value: complaint.address || "Not specified", icon: "📍" },
              {
                label: "Reported on",
                value: new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                }),
                icon: "📅",
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card" style={{ padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "5px" }}>
                  {icon} {label}
                </p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", wordBreak: "break-word" }}>
                  {value}
                </p>
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
                src={complaint.imageUrl.startsWith("http")
                  ? complaint.imageUrl
                  : `http://localhost:5000${complaint.imageUrl}`}
                alt="Complaint evidence"
                style={{ maxHeight: "200px", borderRadius: "10px", objectFit: "cover", width: "100%" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* Status History Timeline */}
          {complaint.statusHistory?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
                📋 Status History
              </h3>
              <div style={{ paddingLeft: "12px" }}>
                {[...complaint.statusHistory].reverse().map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "14px",
                      paddingBottom: i < complaint.statusHistory.length - 1 ? "16px" : "0",
                      borderLeft: i < complaint.statusHistory.length - 1 ? "2px solid var(--border-color)" : "none",
                      paddingLeft: "16px",
                      position: "relative",
                    }}
                  >
                    <div style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: i === 0 ? "var(--primary-600)" : "var(--border-color-strong)",
                      border: "2px solid var(--card-bg)",
                      position: "absolute",
                      left: "-7px",
                      top: "2px",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                        <StatusBadge status={entry.status} />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(entry.changedAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {entry.note && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Section */}
          {complaint.status !== "Resolved" && (
            <div className="card" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <div>
                <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>
                  👍 Support this complaint
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {complaint.supportCount} {complaint.supportCount === 1 ? "person" : "people"} have supported this
                </p>
              </div>

              {!isLoggedIn ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Login to support
                  </p>
                  <Link to="/login" className="btn btn-primary btn-sm">
                    Sign In
                  </Link>
                </div>
              ) : isOwner ? (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  This is your complaint
                </p>
              ) : hasSupported ? (
                <button disabled className="btn btn-sm" style={{ background: "var(--success-50)", color: "var(--success-700)", border: "1px solid var(--success-500)", cursor: "not-allowed" }}>
                  ✓ Already Supported
                </button>
              ) : (
                <button
                  onClick={handleSupport}
                  disabled={supporting}
                  className="btn btn-primary"
                >
                  {supporting ? (
                    <><span className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} /> Supporting...</>
                  ) : "👍 Support This Complaint"}
                </button>
              )}
            </div>
          )}

          {complaint.status === "Resolved" && (
            <div className="alert alert-success">
              <span>🎉</span>
              <span>
                This complaint was <strong>resolved</strong>
                {complaint.resolvedAt && ` on ${new Date(complaint.resolvedAt).toLocaleDateString("en-IN")}`}.
                Thank you for helping improve your city!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
