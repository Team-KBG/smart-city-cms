import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const guestLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/login", label: "Login", icon: "🔑" },
    { to: "/signup", label: "Sign Up", icon: "✨" },
  ];

  const citizenLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/register", label: "Report Issue", icon: "📝" },
    { to: "/track", label: "Track", icon: "🔍" },
    { to: "/heatmap", label: "Heat Map", icon: "🗺️" },
    { to: "/vote", label: "Vote", icon: "🗳️" },
    { to: "/waste", label: "Waste", icon: "♻️" },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/admin", label: "Dashboard", icon: "⚙️" },
    { to: "/analytics", label: "Analytics", icon: "📊" },
    { to: "/heatmap", label: "Heat Map", icon: "🗺️" },
    { to: "/waste", label: "Waste Mgmt", icon: "♻️" },
    { to: "/vote", label: "Votes", icon: "🗳️" },
  ];

  const links = !isLoggedIn ? guestLinks : isAdmin ? adminLinks : citizenLinks;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const roleBadge = isAdmin
    ? { label: "Admin", color: "background: #7c3aed; color: white;" }
    : { label: "Citizen", color: "background: #0284c7; color: white;" };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "var(--navbar-bg)",
      borderBottom: "1px solid var(--border-color)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 20px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: "800",
            color: "white",
            boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
            flexShrink: 0,
          }}>
            SC
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              Smart City CMS
            </p>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>
              Complaint Management
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }} className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.18s ease",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: isActive(link.to) ? "white" : "var(--text-secondary)",
                background: isActive(link.to) ? "var(--primary-600)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.to)) {
                  e.target.style.background = "var(--bg-surface-alt)";
                  e.target.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to)) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ fontSize: "12px" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-surface-alt)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.18s ease",
              flexShrink: 0,
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {isLoggedIn && (
            <>
              {/* User badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                background: "var(--bg-surface-alt)",
                border: "1.5px solid var(--border-color)",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-secondary)",
              }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 7px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.04em",
                  background: isAdmin ? "#7c3aed" : "var(--primary-600)",
                  color: "white",
                  textTransform: "uppercase",
                }}>
                  {isAdmin ? "ADMIN" : "CITIZEN"}
                </span>
                <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-danger"
              >
                Logout
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-surface-alt)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          borderTop: "1px solid var(--border-color)",
          background: "var(--bg-surface)",
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: isActive(link.to) ? "white" : "var(--text-primary)",
                background: isActive(link.to) ? "var(--primary-600)" : "transparent",
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ marginTop: "8px" }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}