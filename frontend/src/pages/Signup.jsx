import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/api/auth/register", {
        ...form,
        role: "citizen",
      });

      login(data.user, data.token);
      toast.success(`Welcome to Smart City CMS, ${data.user.name}!`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const len = form.password.length;
    if (len === 0) return null;
    if (len < 6) return { label: "Too short", color: "#ef4444", width: "20%" };
    if (len < 8) return { label: "Weak", color: "#f59e0b", width: "40%" };
    if (len < 12) return { label: "Good", color: "#3b82f6", width: "70%" };
    return { label: "Strong", color: "#22c55e", width: "100%" };
  })();

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "800",
            color: "white",
            margin: "0 auto 16px",
            boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
          }}>
            SC
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "6px" }}>
            Create account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Join Smart City and report civic issues
          </p>
        </div>

        {/* Form Card */}
        <div className="form-section">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "20px" }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "2px",
                    color: "var(--text-muted)",
                    width: "auto",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Password strength */}
              {passwordStrength && (
                <div style={{ marginTop: "6px" }}>
                  <div style={{ height: "3px", borderRadius: "3px", background: "var(--border-color)" }}>
                    <div style={{
                      height: "100%",
                      width: passwordStrength.width,
                      borderRadius: "3px",
                      background: passwordStrength.color,
                      transition: "width 0.3s ease, background 0.3s ease",
                    }} />
                  </div>
                  <p style={{ fontSize: "11px", color: passwordStrength.color, marginTop: "3px" }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: "4px" }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary-600)", fontWeight: "600", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Info note */}
        <div style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: "var(--bg-surface-alt)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          fontSize: "12px",
          color: "var(--text-muted)",
          textAlign: "center",
        }}>
          🔒 Your account will be created as a <strong>Citizen</strong>
        </div>
      </div>
    </div>
  );
}