import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ALL_CATEGORIES } from "../utils/constants";
import StatusBadge from "../components/StatusBadge";

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
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [nearby, setNearby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  // AI categorization preview with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.title.length > 5 || form.description.length > 10) {
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
    }, 600);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  const checkNearby = async (category) => {
    if (!location.latitude || !category) return null;
    try {
      const { data } = await API.get("/api/complaints/nearby/check", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          category,
        },
      });
      setNearby(data);
      return data;
    } catch {
      setNearby(null);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category" && value) checkNearby(value);
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

  const submitComplaint = async (supportExistingId = null) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      // Only submit the form fields — NO manual citizenName/citizenEmail
      // The backend will read from req.user
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.category) formData.append("category", form.category);
      if (form.address) formData.append("address", form.address);
      if (location.latitude) formData.append("latitude", location.latitude);
      if (location.longitude) formData.append("longitude", location.longitude);
      if (image) formData.append("image", image);
      if (supportExistingId) formData.append("supportExistingId", supportExistingId);

      const { data } = await API.post("/api/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data.data);
      setNearby(null);
      toast.success("Complaint registered successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = form.category || aiPreview?.category;

    if (category && location.latitude) {
      const nearbyResult = await checkNearby(category);
      if (nearbyResult?.hasSimilar) {
        return; // Show the nearby panel
      }
    }

    await submitComplaint();
  };

  const handleReset = () => {
    setResult(null);
    setForm({ title: "", description: "", category: "", address: "" });
    setImage(null);
    setImagePreview(null);
    setAiPreview(null);
    setNearby(null);
    setError("");
  };

  // Success State
  if (result) {
    return (
      <div style={{ maxWidth: "540px", margin: "0 auto" }} className="animate-scale-in">
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}>
            Complaint Registered!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Your complaint has been submitted and will be reviewed by the appropriate department.
          </p>

          <div style={{
            background: "var(--bg-surface-alt)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            textAlign: "left",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                  Complaint ID
                </span>
                <span style={{
                  fontFamily: "monospace",
                  fontWeight: "700",
                  fontSize: "15px",
                  color: "var(--primary-600)",
                  background: "var(--primary-50)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                }}>
                  {result.complaintId}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Category</span>
                <span style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px" }}>{result.category}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Department</span>
                <span style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px" }}>{result.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Priority</span>
                <PriorityBadge priority={result.priority} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Status</span>
                <StatusBadge status={result.status} />
              </div>
              {result.isEmergency && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#dc2626",
                  fontWeight: "600",
                  textAlign: "center",
                }}>
                  🚨 This has been flagged as an EMERGENCY
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={handleReset} className="btn btn-primary">
              Register Another
            </button>
            <button
              onClick={() => window.location.href = `/track?id=${result.complaintId}`}
              className="btn btn-secondary"
            >
              Track This Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>Register Complaint</h1>
        <p>Report a civic issue — your identity is automatically linked via your account.</p>
      </div>

      {/* Citizen info banner */}
      <div className="alert alert-info" style={{ marginBottom: "24px" }}>
        <span>👤</span>
        <div>
          <strong>Submitting as:</strong> {user?.name} ({user?.email})
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
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
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the issue in detail..."
          />
        </div>

        {/* AI Preview */}
        {aiLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
            AI analyzing your description...
          </div>
        )}

        {aiPreview && !aiLoading && (
          <div className="alert alert-info animate-fade-in">
            <span>🤖</span>
            <div>
              <strong>AI Suggestion:</strong>{" "}
              Category: <strong>{aiPreview.category}</strong> →{" "}
              Department: <strong>{aiPreview.department}</strong> |{" "}
              Priority: <strong>{aiPreview.priority}</strong>
              {aiPreview.isEmergency && (
                <span style={{
                  marginLeft: "8px",
                  background: "#ef4444",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                }}>
                  EMERGENCY
                </span>
              )}
            </div>
          </div>
        )}

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Auto-detect from description (recommended)</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Location / Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g. Sector 62, Noida"
          />
          {location.latitude && (
            <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
              📍 GPS captured: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Photo Evidence</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              padding: "8px",
              border: "1.5px dashed var(--border-color-strong)",
              borderRadius: "10px",
              background: "var(--bg-surface-alt)",
              cursor: "pointer",
            }}
          />
          {imagePreview && (
            <div style={{ marginTop: "10px", position: "relative", display: "inline-block" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "2px solid var(--border-color)" }}
              />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); }}
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "auto",
                  padding: "2px 5px",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Nearby complaint warning */}
        {nearby?.hasSimilar && (
          <div style={{
            border: "1.5px solid #f59e0b",
            borderRadius: "14px",
            background: "var(--warning-50)",
            padding: "20px",
          }} className="animate-fade-in">
            <p style={{ fontWeight: "700", color: "#92400e", marginBottom: "6px", fontSize: "14px" }}>
              ⚠️ Similar complaint already registered nearby!
            </p>
            <p style={{ fontSize: "13px", color: "#78350f", marginBottom: "14px" }}>
              Would you like to support an existing complaint instead of creating a duplicate?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {nearby.data.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "white",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    border: "1px solid #fcd34d",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "13px", color: "#1c1917", marginBottom: "2px" }}>{c.title}</p>
                    <p style={{ fontSize: "12px", color: "#78350f" }}>
                      ID: {c.complaintId} • {c.supportCount} supports
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => submitComplaint(c._id)}
                    className="btn btn-sm"
                    style={{ background: "#d97706", color: "white", border: "none" }}
                  >
                    👍 Support
                  </button>
                </div>
              ))}
            </div>
            <button
              type="submit"
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
              Register as new complaint anyway →
            </button>
          </div>
        )}

        {/* Submit Button */}
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
            ) : "Submit Complaint"}
          </button>
        )}
      </form>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    Low: { bg: "#f1f5f9", text: "#475569" },
    Medium: { bg: "#fef3c7", text: "#92400e" },
    High: { bg: "#fff7ed", text: "#c2410c" },
    Critical: { bg: "#fef2f2", text: "#dc2626" },
  };
  const c = colors[priority] || colors.Low;
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      background: c.bg,
      color: c.text,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    }}>
      {priority}
    </span>
  );
}
