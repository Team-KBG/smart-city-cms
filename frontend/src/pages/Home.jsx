import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Clipboard, 
  Search, 
  Map, 
  Vote, 
  Trash2, 
  LayoutDashboard, 
  BarChart3, 
  Cpu, 
  MapPin, 
  Award, 
  AlertTriangle, 
  Calendar,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

const citizenFeatures = [
  {
    title: "Report an Issue",
    desc: "Register civic complaints with GPS location, photos, and AI-powered auto-categorization.",
    to: "/register",
    icon: <Clipboard size={20} />,
    color: "var(--primary-600)",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "Track Complaint",
    desc: "Monitor your complaint status in real-time using a unique Complaint ID.",
    to: "/track",
    icon: <Search size={20} />,
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.08)",
    border: "rgba(8, 145, 178, 0.15)",
  },
  {
    title: "Heat Map",
    desc: "Visualize complaint density across the city to identify high-priority areas.",
    to: "/heatmap",
    icon: <Map size={20} />,
    color: "var(--success-600)",
    bg: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.15)",
  },
  {
    title: "Public Voting",
    desc: "Vote for community improvements — parks, street lights, speed breakers, and more.",
    to: "/vote",
    icon: <Vote size={20} />,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.15)",
  },
  {
    title: "Waste Collection",
    desc: "View garbage collection schedules and request special pickup for your area.",
    to: "/waste",
    icon: <Trash2 size={20} />,
    color: "var(--warning-600)",
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.15)",
  },
];

const adminFeatures = [
  {
    title: "Admin Dashboard",
    desc: "Manage all complaints, assign departments, update statuses, and handle emergencies.",
    to: "/admin",
    icon: <LayoutDashboard size={20} />,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.15)",
  },
  {
    title: "Smart Analytics",
    desc: "Insights on complaint trends, department performance, and resolution metrics.",
    to: "/analytics",
    icon: <BarChart3 size={20} />,
    color: "var(--primary-600)",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "Heat Map",
    desc: "Visualize complaint density and identify problem areas across the city.",
    to: "/heatmap",
    icon: <Map size={20} />,
    color: "var(--success-600)",
    bg: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.15)",
  },
  {
    title: "Waste Management",
    desc: "Create collection schedules, manage pickup requests, and track waste operations.",
    to: "/waste",
    icon: <Trash2 size={20} />,
    color: "var(--warning-600)",
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.15)",
  },
  {
    title: "Public Votes",
    desc: "Review community vote results to guide city improvement decisions.",
    to: "/vote",
    icon: <Vote size={20} />,
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.08)",
    border: "rgba(8, 145, 178, 0.15)",
  },
];

const highlights = [
  { icon: <Cpu size={20} />, label: "AI Categorization", text: "Auto-detect category and department from description keywords" },
  { icon: <MapPin size={20} />, label: "Geospatial Detection", text: "Prevent duplicate complaints within 100 meters using GPS" },
  { icon: <Award size={20} />, label: "Citizen Reputation", text: "Earn Bronze, Silver, or Gold citizen levels through participation" },
  { icon: <AlertTriangle size={20} />, label: "Emergency Routing", text: "Critical incidents get auto-flagged and immediately escalated" },
  { icon: <BarChart3 size={20} />, label: "Smart Analytics", text: "Real-time insights on trends, resolution times, and performance" },
  { icon: <Calendar size={20} />, label: "Waste Scheduler", text: "Request garbage pickups and track your area's collection schedule" },
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
        background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(37,99,235,0.04) 50%, rgba(37,99,235,0.08) 100%)",
        borderRadius: "24px",
        padding: "64px 48px",
        color: "var(--text-primary)",
        position: "relative",
        overflow: "hidden",
        border: "1.5px solid var(--border-color)",
      }}>
        {/* Background decorations */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "300px", height: "300px",
          borderRadius: "50%",
          background: "rgba(59,130,246,0.03)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "30%",
          width: "200px", height: "200px",
          borderRadius: "50%",
          background: "rgba(59,130,246,0.02)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "640px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            background: "var(--bg-surface-alt)",
            border: "1.5px solid var(--border-color)",
            fontSize: "12px",
            fontWeight: "750",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "24px",
            color: "var(--primary-600)"
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse-glow 2s infinite" }} />
            Smart City Initiative
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: "900",
            lineHeight: "1.1",
            marginBottom: "20px",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)"
          }}>
            {isAdmin
              ? "Admin Control Center"
              : "Smart City Complaint Management"
            }
          </h1>

          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "36px", maxWidth: "540px" }}>
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
                  className="btn btn-primary btn-lg"
                  style={{ gap: "10px" }}
                >
                  <LayoutDashboard size={18} /> Open Dashboard
                </button>
                <button
                  onClick={() => navigate("/analytics")}
                  className="btn btn-secondary btn-lg"
                  style={{ gap: "10px" }}
                >
                  <BarChart3 size={18} /> View Analytics
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav("/register")}
                  className="btn btn-primary btn-lg"
                  style={{ gap: "10px" }}
                >
                  <Clipboard size={18} /> Report an Issue
                </button>
                <button
                  onClick={() => handleNav("/track")}
                  className="btn btn-secondary btn-lg"
                  style={{ gap: "10px" }}
                >
                  <Search size={18} /> Track Complaint
                </button>
                {!isLoggedIn && (
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn btn-secondary btn-lg"
                    style={{ gap: "10px", border: "1.5px solid var(--primary-200)", color: "var(--primary-600)" }}
                  >
                    <Sparkles size={18} /> Get Started
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div style={{ marginBottom: "28px" }}>
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
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        }}>
          {features.map((f) => (
            <div
              key={f.to}
              onClick={() => handleNav(f.to)}
              className="card card-interactive animate-fade-in"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: f.bg,
                border: `1.5px solid ${f.border}`,
                color: f.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", flex: 1 }}>
                {f.desc}
              </p>
              <div style={{
                marginTop: "20px",
                fontSize: "13px",
                fontWeight: "700",
                color: f.color,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                Access Module <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Features Highlights (citizen only) */}
      {!isAdmin && (
        <section>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              Smart Features
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Powered by AI, geospatial intelligence, and community data
            </p>
          </div>

          <div style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}>
            {highlights.map((item) => (
              <div key={item.label} className="card animate-fade-in" style={{ display: "flex", gap: "16px", padding: "20px", alignItems: "flex-start" }}>
                <div style={{
                  color: "var(--primary-500)",
                  background: "rgba(59, 130, 246, 0.06)",
                  border: "1.5px solid rgba(59, 130, 246, 0.12)",
                  borderRadius: "10px",
                  flexShrink: 0,
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                    {item.label}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
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
          background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(37,99,235,0.03) 50%, rgba(37,99,235,0.06) 100%)",
          border: "1.5px solid var(--border-color)",
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center",
          color: "var(--text-primary)",
        }}>
          <h2 style={{ fontSize: "26px", fontWeight: "900", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            Ready to make your city better?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "15px" }}>
            Join thousands of citizens reporting and resolving civic issues.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
              className="btn btn-primary btn-lg"
              style={{ gap: "8px" }}
            >
              <Sparkles size={16} /> Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-secondary btn-lg"
            >
              Sign In
            </button>
          </div>
        </section>
      )}
    </div>
  );
}