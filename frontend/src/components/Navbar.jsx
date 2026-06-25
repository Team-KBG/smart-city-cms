import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { 
  Home, 
  Trophy, 
  Key, 
  Sparkles, 
  Clipboard, 
  Search, 
  Map, 
  Vote, 
  Trash2, 
  LayoutDashboard, 
  BarChart3,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const guestLinks = [
    { to: "/", label: "Home", icon: <Home size={14} /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
    { to: "/login", label: "Login", icon: <Key size={14} /> },
    { to: "/signup", label: "Sign Up", icon: <Sparkles size={14} /> },
  ];

  const citizenLinks = [
    { to: "/", label: "Home", icon: <Home size={14} /> },
    { to: "/register", label: "Report Issue", icon: <Clipboard size={14} /> },
    { to: "/track", label: "Track", icon: <Search size={14} /> },
    { to: "/heatmap", label: "Heat Map", icon: <Map size={14} /> },
    { to: "/vote", label: "Vote", icon: <Vote size={14} /> },
    { to: "/waste", label: "Waste", icon: <Trash2 size={14} /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: <Home size={14} /> },
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
    { to: "/analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
    { to: "/heatmap", label: "Heat Map", icon: <Map size={14} /> },
    { to: "/waste", label: "Waste Mgmt", icon: <Trash2 size={14} /> },
    { to: "/vote", label: "Votes", icon: <Vote size={14} /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
  ];

  const links = !isLoggedIn ? guestLinks : isAdmin ? adminLinks : citizenLinks;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "var(--navbar-bg)",
      borderBottom: "1.5px solid var(--border-color)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-500))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: "850",
            color: "white",
            boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
            flexShrink: 0,
          }}>
            SC
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
              Smart City CMS
            </p>
            <p style={{ fontSize: "10px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
              Civic Portal
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }} className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: isActive(link.to) ? "white" : "var(--text-secondary)",
                background: isActive(link.to) ? "var(--primary-600)" : "transparent",
                boxShadow: isActive(link.to) ? "0 4px 10px rgba(37,99,235,0.2)" : "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "var(--bg-surface-alt)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-surface-alt)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-color-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isLoggedIn && (
            <>
              {/* User badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "var(--bg-surface-alt)",
                border: "1.5px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-primary)",
              }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  fontWeight: "750",
                  letterSpacing: "0.05em",
                  background: isAdmin ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
                  color: "white",
                  textTransform: "uppercase",
                }}>
                  {isAdmin ? "ADMIN" : "CITIZEN"}
                </span>
                <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name}
                </span>
              </div>

              <button 
                onClick={handleLogout} 
                className="btn btn-sm btn-danger"
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              >
                <LogOut size={13} />
                <span className="logout-text">Logout</span>
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            type="button"
            style={{
              display: "none",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-surface-alt)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          borderTop: "1.5px solid var(--border-color)",
          background: "var(--bg-surface)",
          padding: "12px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }} className="animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: isActive(link.to) ? "white" : "var(--text-primary)",
                background: isActive(link.to) ? "var(--primary-600)" : "transparent",
                boxShadow: isActive(link.to) ? "0 4px 10px rgba(37,99,235,0.15)" : "none",
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
              style={{ 
                marginTop: "8px", 
                width: "100%", 
                padding: "12px", 
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 1050px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .logout-text { display: none !important; }
        }
      `}</style>
    </nav>
  );
}