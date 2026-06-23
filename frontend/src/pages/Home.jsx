import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const citizenFeatures = [
  {
    title: "Report an Issue",
    desc: "Register civic complaints with GPS location, photos, and AI-powered auto-categorization.",
    to: "/register",
    icon: "📝",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    title: "Track Complaint",
    desc: "Monitor your complaint status in real-time using a unique Complaint ID.",
    to: "/track",
    icon: "🔍",
    color: "#0891b2",
    bg: "#cffafe",
  },
  {
    title: "Heat Map",
    desc: "Visualize complaint density across the city to identify high-priority areas.",
    to: "/heatmap",
    icon: "🗺️",
    color: "#059669",
    bg: "#d1fae5",
  },
  {
    title: "Public Voting",
    desc: "Vote for community improvements — parks, street lights, speed breakers, and more.",
    to: "/vote",
    icon: "🗳️",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    title: "Waste Collection",
    desc: "View garbage collection schedules and request special pickup for your area.",
    to: "/waste",
    icon: "♻️",
    color: "#d97706",
    bg: "#fef3c7",
  },
];

const adminFeatures = [
  {
    title: "Admin Dashboard",
    desc: "Manage all complaints, assign departments, update statuses, and handle emergencies.",
    to: "/admin",
    icon: "⚙️",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    title: "Smart Analytics",
    desc: "Insights on complaint trends, department performance, and resolution metrics.",
    to: "/analytics",
    icon: "📊",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    title: "Heat Map",
    desc: "Visualize complaint density and identify problem areas across the city.",
    to: "/heatmap",
    icon: "🗺️",
    color: "#059669",
    bg: "#d1fae5",
  },
  {
    title: "Waste Management",
    desc: "Create collection schedules, manage pickup requests, and track waste operations.",
    to: "/waste",
    icon: "♻️",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    title: "Public Votes",
    desc: "Review community vote results to guide city improvement decisions.",
    to: "/vote",
    icon: "🗳️",
    color: "#0891b2",
    bg: "#cffafe",
  },
];

const highlights = [
  { icon: "🤖", label: "AI Categorization", text: "Auto-detect category and department from description keywords" },
  { icon: "📍", label: "Geospatial Detection", text: "Prevent duplicate complaints within 100 meters using GPS" },
  { icon: "🏆", label: "Citizen Reputation", text: "Earn Bronze, Silver, or Gold citizen levels through participation" },
  { icon: "🚨", label: "Emergency Routing", text: "Critical incidents get auto-flagged and immediately escalated" },
  { icon: "📊", label: "Smart Analytics", text: "Real-time insights on trends, resolution times, and performance" },
  { icon: "♻️", label: "Waste Scheduler", text: "Request garbage pickups and track your area's collection schedule" },
];

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();

  const features = isAdmin ? adminFeatures : citizenFeatures;

  const handleNav = (path) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 70%, #2563eb 100%)",
        borderRadius: "24px",
        padding: "64px 48px",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decorations */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "300px", height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "30%",
          width: "200px", height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "640px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse-glow 2s infinite" }} />
            Smart City Initiative
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: "800",
            lineHeight: "1.1",
            marginBottom: "16px",
            letterSpacing: "-0.03em",
          }}>
            {isAdmin
              ? "Admin Control Center"
              : "Smart City Complaint Management"
            }
          </h1>

          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "rgba(255,255,255,0.8)", marginBottom: "32px", maxWidth: "520px" }}>
            {isAdmin
              ? "Manage civic complaints, track department performance, and drive city improvements with real-time analytics."
              : "Report, track, and resolve civic issues faster. Powered by geospatial intelligence, AI categorization, and community participation."
            }
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate("/admin")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "white",
                    color: "#1d4ed8",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  ⚙️ Open Dashboard
                </button>
                <button
                  onClick={() => navigate("/analytics")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                >
                  📊 View Analytics
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav("/register")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "white",
                    color: "#1d4ed8",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  📝 Report an Issue
                </button>
                <button
                  onClick={() => handleNav("/track")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                >
                  🔍 Track Complaint
                </button>
                {!isLoggedIn && (
                  <button
                    onClick={() => navigate("/signup")}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.12)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    ✨ Get Started Free
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
            {isAdmin ? "Admin Modules" : "Platform Features"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {isAdmin
              ? "Tools to manage and improve your city"
              : "Everything you need to engage with your city"
            }
          </p>
        </div>

        <div style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}>
          {features.map((f) => (
            <div
              key={f.to}
              onClick={() => handleNav(f.to)}
              className="card card-interactive animate-fade-in"
              style={{ cursor: "pointer" }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: f.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "14px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {f.desc}
              </p>
              <div style={{
                marginTop: "14px",
                fontSize: "12px",
                fontWeight: "600",
                color: f.color,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                Open →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Features Highlights (citizen only) */}
      {!isAdmin && (
        <section>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              Smart Features
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Powered by AI, geospatial intelligence, and community data
            </p>
          </div>

          <div style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}>
            {highlights.map((item) => (
              <div key={item.label} className="card" style={{ display: "flex", gap: "14px", padding: "18px" }}>
                <div style={{
                  fontSize: "24px",
                  flexShrink: 0,
                  width: "40px",
                  textAlign: "center",
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {item.label}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA for guests */}
      {!isLoggedIn && (
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          borderRadius: "20px",
          padding: "40px 32px",
          textAlign: "center",
          color: "white",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>
            Ready to make your city better?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "24px", fontSize: "15px" }}>
            Join thousands of citizens reporting and resolving civic issues.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "12px 28px",
                borderRadius: "12px",
                background: "white",
                color: "#1d4ed8",
                fontWeight: "700",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ✨ Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "12px 28px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </div>
        </section>
      )}
    </div>
  );
}