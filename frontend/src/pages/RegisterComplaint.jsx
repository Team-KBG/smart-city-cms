import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ALL_CATEGORIES } from "../utils/constants";
import {
  CheckCircle2, Camera, X, Cpu, MapPin, AlertTriangle,
  User, Zap, Tag, Building2, Search, PlusCircle, Siren
} from "lucide-react";

export default function RegisterComplaint() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gpsLocation, setGpsLocation] = useState({ latitude: null, longitude: null });
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [nearby, setNearby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  // Flag to bypass nearby check when user explicitly chooses to register anyway
  const skipNearbyCheck = useRef(false);

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {} // Silently ignore if denied
      );
    }
  }, []);

  // AI categorization preview with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      const text = (form.title + " " + form.description).trim();
      if (text.length > 10) {
        setAiLoading(true);
        try {
          const { data } = await API.post("/api/complaints/categorize/preview", {
            title: form.title,
            description: form.description,
          });
          setAiPreview(data.data);
        } catch {
          setAiPreview(null);
        } finally {
          setAiLoading(false);
        }
      } else {
        setAiPreview(null);
        setAiLoading(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  const checkNearbyComplaints = async (category) => {
    if (!gpsLocation.latitude || !category) return null;
    try {
      const { data } = await API.get("/api/complaints/nearby/check", {
        params: {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          category,
        },
      });
      return data;
    } catch {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  /**
   * Core submit function — sends the complaint to the API.
   * supportExistingId: if set, routes the user to support that existing complaint.
   */
  const submitComplaint = async (supportExistingId = null) => {
    setLoading(true);
    setError("");
    setNearby(null);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.category) formData.append("category", form.category);
      if (form.address) formData.append("address", form.address);
      if (gpsLocation.latitude) formData.append("latitude", gpsLocation.latitude);
      if (gpsLocation.longitude) formData.append("longitude", gpsLocation.longitude);
      if (image) formData.append("image", image);
      if (supportExistingId) formData.append("supportExistingId", supportExistingId);

      const { data } = await API.post("/api/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data.data);
      toast.success("Complaint registered successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit complaint. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Form submit handler — checks nearby before submitting.
   * Uses skipNearbyCheck ref to allow bypassing the check.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    // If user explicitly skipped the nearby check, submit directly
    if (skipNearbyCheck.current) {
      skipNearbyCheck.current = false;
      await submitComplaint();
      return;
    }

    const category = form.category || aiPreview?.category;

    // Check for nearby duplicates if we have GPS and category
    if (category && gpsLocation.latitude) {
      const nearbyResult = await checkNearbyComplaints(category);
      if (nearbyResult?.hasSimilar && nearbyResult.data?.length > 0) {
        setNearby(nearbyResult);
        return; // Show nearby panel
      }
    }

    await submitComplaint();
  };

  /**
   * When user clicks "Register anyway" — bypass the nearby check on next submit.
   */
  const handleRegisterAnyway = () => {
    skipNearbyCheck.current = true;
    setNearby(null);
    // Trigger form submission programmatically
    submitComplaint();
  };

  const handleReset = () => {
    setResult(null);
    setForm({ title: "", description: "", category: "", address: "" });
    setImage(null);
    setImagePreview(null);
    setAiPreview(null);
    setNearby(null);
    setError("");
    skipNearbyCheck.current = false;
  };

  // ── Success Screen ──────────────────────────────────────────
  if (result) {
    return (
      <div style={{ maxWidth: "540px", margin: "0 auto" }} className="animate-scale-in">
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
          }}>
            <CheckCircle2 size={36} color="white" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
            Complaint Registered!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "14px", lineHeight: "1.6" }}>
            Your complaint has been submitted and will be reviewed by the appropriate department.
          </p>

          <div style={{
            background: "var(--bg-surface-alt)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "24px",
            textAlign: "left",
            border: "1px solid var(--border-color)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <InfoRow label="Complaint ID" icon={<Tag size={13} />}>
                <span style={{
                  fontFamily: "monospace",
                  fontWeight: "700",
                  fontSize: "15px",
                  color: "var(--primary-600)",
                  background: "rgba(59,130,246,0.08)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}>
                  {result.complaintId}
                </span>
              </InfoRow>
              <InfoRow label="Category" icon={<Tag size={13} />}>{result.category}</InfoRow>
              <InfoRow label="Department" icon={<Building2 size={13} />}>{result.department || "Auto-assigning..."}</InfoRow>
              <InfoRow label="Priority" icon={<Zap size={13} />}>
                <PriorityBadge priority={result.priority} />
              </InfoRow>
              <InfoRow label="Status" icon={<CheckCircle2 size={13} />}>
                <StatusChip status={result.status} />
              </InfoRow>
              {result.isEmergency && (
                <div style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#dc2626",
                  fontWeight: "700",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}>
                  <Siren size={14} /> This has been flagged as an EMERGENCY and escalated immediately
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleReset} className="btn btn-primary" style={{ gap: "8px", display: "inline-flex", alignItems: "center" }}>
              <PlusCircle size={16} /> Register Another
            </button>
            <button
              onClick={() => window.location.href = `/track?id=${result.complaintId}`}
              className="btn btn-secondary"
              style={{ gap: "8px", display: "inline-flex", alignItems: "center" }}
            >
              <Search size={16} /> Track This Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "26px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-500))",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <PlusCircle size={20} color="white" />
          </span>
          Register Complaint
        </h1>
        <p>Report a civic issue. Your identity is auto-filled from your account.</p>
      </div>

      {/* Submitting as banner */}
      <div className="alert alert-info" style={{ marginBottom: "20px" }}>
        <User size={16} style={{ flexShrink: 0 }} />
        <div>
          <strong>Submitting as:</strong> {user?.name}{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>({user?.email})</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="form-section"
        style={{ display: "flex", flexDirection: "column", gap: "22px" }}
      >
        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Complaint Title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Brief title describing the issue"
            maxLength={120}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            Description *
            <span style={{ fontWeight: "400", color: "var(--text-muted)", fontSize: "11px", marginLeft: "6px" }}>
              (The more detail you provide, the better)
            </span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the issue in detail — location, severity, when it started..."
            maxLength={1000}
          />
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
            {form.description.length}/1000
          </p>
        </div>

        {/* AI Suggestion */}
        {aiLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
            AI is analyzing your description...
          </div>
        )}
        {aiPreview && !aiLoading && (
          <div className="alert alert-info animate-fade-in" style={{ flexWrap: "wrap", gap: "6px" }}>
            <Cpu size={15} style={{ flexShrink: 0, color: "var(--primary-500)" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span><strong>AI Suggestion:</strong></span>
              <span style={{ background: "rgba(59,130,246,0.12)", color: "var(--primary-600)", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(59,130,246,0.2)" }}>
                {aiPreview.category}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→ {aiPreview.department}</span>
              <span style={{ fontSize: "12px", fontWeight: "600", color: aiPreview.priority === "Critical" ? "#dc2626" : "var(--text-secondary)" }}>
                Priority: {aiPreview.priority}
              </span>
              {aiPreview.isEmergency && (
                <span style={{
                  background: "#ef4444", color: "white",
                  padding: "2px 8px", borderRadius: "20px",
                  fontSize: "11px", fontWeight: "700",
                  display: "inline-flex", alignItems: "center", gap: "4px",
                }}>
                  <Siren size={10} /> EMERGENCY
                </span>
              )}
            </div>
          </div>
        )}

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">🤖 Auto-detect from description (recommended)</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {form.category && aiPreview && form.category !== aiPreview.category && (
            <p style={{ fontSize: "11px", color: "var(--warning-600, #d97706)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertTriangle size={11} /> You selected "{form.category}" but AI suggests "{aiPreview.category}"
            </p>
          )}
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Location / Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g. Sector 62, Noida (helps with geospatial detection)"
          />
          {gpsLocation.latitude ? (
            <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} /> GPS captured: {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}
            </p>
          ) : (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} /> Allow location access for better nearby detection
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Photo Evidence <span style={{ fontWeight: "400", color: "var(--text-muted)", fontSize: "11px" }}>(optional)</span></label>
          {!image ? (
            <label
              htmlFor="image-upload"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "32px 24px",
                border: "2px dashed var(--border-color-strong)",
                borderRadius: "14px",
                background: "var(--bg-surface-alt)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-400)";
                e.currentTarget.style.background = "rgba(59,130,246,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color-strong)";
                e.currentTarget.style.background = "var(--bg-surface-alt)";
              }}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(59,130,246,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={22} color="var(--primary-500)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600", display: "block" }}>
                  Click to upload an image
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  JPG, PNG, GIF, WebP — max 5MB
                </span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "120px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid var(--border-color)",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "white",
                    border: "2px solid var(--card-bg)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{image.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nearby Complaint Panel */}
        {nearby?.hasSimilar && (
          <div
            className="animate-fade-in"
            style={{
              border: "1.5px solid #f59e0b",
              borderRadius: "14px",
              background: "rgba(245,158,11,0.06)",
              padding: "20px",
            }}
          >
            <p style={{ fontWeight: "700", color: "#92400e", marginBottom: "4px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={15} /> Similar complaint already exists nearby!
            </p>
            <p style={{ fontSize: "13px", color: "#78350f", marginBottom: "16px" }}>
              Would you like to support an existing complaint instead of creating a duplicate?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {nearby.data.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--card-bg)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    border: "1px solid #fcd34d",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>{c.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {c.complaintId} • 👍 {c.supportCount} supports
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => submitComplaint(c._id)}
                    disabled={loading}
                    className="btn btn-sm"
                    style={{ background: "#d97706", color: "white", border: "none", flexShrink: 0 }}
                  >
                    {loading ? "..." : "👍 Support This"}
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRegisterAnyway}
              disabled={loading}
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#92400e",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Register as a new complaint anyway →
            </button>
          </div>
        )}

        {/* Submit button — hidden when nearby panel is shown */}
        {!nearby?.hasSimilar && (
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                Submitting...
              </>
            ) : (
              <>
                <Zap size={16} />
                Submit Complaint
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────

function InfoRow({ label, icon, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, display: "flex", alignItems: "center", gap: "5px" }}>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
        {label}
      </span>
      <span style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px", textAlign: "right" }}>
        {children}
      </span>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    Low: { bg: "#f1f5f9", color: "#475569" },
    Medium: { bg: "#fef3c7", color: "#92400e" },
    High: { bg: "#fff7ed", color: "#c2410c" },
    Critical: { bg: "#fef2f2", color: "#dc2626" },
  };
  const c = colors[priority] || colors.Low;
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      background: c.bg,
      color: c.color,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    }}>
      {priority}
    </span>
  );
}

function StatusChip({ status }) {
  const colors = {
    Pending: { bg: "#fef3c7", color: "#92400e" },
    Assigned: { bg: "#dbeafe", color: "#1e40af" },
    Resolved: { bg: "#dcfce7", color: "#14532d" },
  };
  const c = colors[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      background: c.bg,
      color: c.color,
    }}>
      {status}
    </span>
  );
}
