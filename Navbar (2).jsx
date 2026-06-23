import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const citizenLinks = [
  {
    to: "/",
    label: "Home",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/register",
    label: "Register",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    to: "/track",
    label: "Track",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: "/heatmap",
    label: "Heat Map",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    to: "/vote",
    label: "Voting",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    to: "/waste",
    label: "Waste",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
  },
];

const adminLinks = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

function NavLink({ to, label, icon, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link group relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "nav-link-active text-blue-600"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      <span
        className={`transition-colors duration-150 ${
          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
        }`}
      >
        {icon}
      </span>
      {label}
      {isActive && <span className="nav-active-bar" />}
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isAdminRoute = adminLinks.some((l) => isActive(l.to));

  return (
    <>
      <style>{`
        .navbar-glass {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }
        .navbar-glass.scrolled {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04);
        }
        .nav-link {
          position: relative;
        }
        .nav-link:hover:not(.nav-link-active) {
          background: rgba(241, 245, 249, 0.8);
        }
        .nav-active-bar {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 8px 0 rgba(37,99,235,0.45);
        }
        .admin-divider {
          width: 1px;
          height: 20px;
          background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
          flex-shrink: 0;
        }
        .admin-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px 2px 6px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: rgba(254, 242, 242, 0.8);
          color: #dc2626;
        }
        .admin-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.2);
          animation: pulse-dot 2s ease infinite;
        }
        .citizen-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px 2px 6px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid rgba(37, 99, 235, 0.2);
          background: rgba(239, 246, 255, 0.8);
          color: #2563eb;
        }
        .citizen-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3b82f6;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .logo-mark {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
          box-shadow: 0 0 0 1px rgba(37,99,235,0.2), 0 2px 8px rgba(37,99,235,0.25);
        }
        .hamburger-btn {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: background 0.15s;
        }
        .hamburger-btn:hover { background: #f8fafc; }
        .hamburger-line {
          width: 100%;
          height: 1.5px;
          background: #64748b;
          border-radius: 2px;
          transition: all 0.2s ease;
          transform-origin: center;
        }
        .hamburger-open .hamburger-line:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger-open .hamburger-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger-open .hamburger-line:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
        .mobile-menu {
          border-top: 1px solid #f1f5f9;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .mobile-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 12px 16px 4px;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          transition: background 0.1s, color 0.1s;
        }
        .mobile-nav-link:hover { background: #f8fafc; color: #0f172a; }
        .mobile-nav-link.active {
          color: #2563eb;
          background: #eff6ff;
          font-weight: 600;
        }
        .mobile-nav-link .mobile-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #f1f5f9;
          flex-shrink: 0;
          transition: background 0.1s;
        }
        .mobile-nav-link.active .mobile-icon {
          background: #dbeafe;
          color: #2563eb;
        }
        .mobile-admin-link.active .mobile-icon {
          background: #fee2e2;
          color: #dc2626;
        }
        .mobile-admin-link.active {
          color: #dc2626;
          background: #fef2f2;
        }
        .mobile-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 4px 0;
        }
      `}</style>

      <nav className={`navbar-glass sticky top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
        {/* Desktop Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0" style={{ height: 56 }}>

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="logo-mark flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-extrabold text-white tracking-tight select-none">
              SC
            </span>
            <div className="hidden sm:block leading-none">
              <p className="text-[13px] font-semibold text-slate-900 tracking-tight">Smart City</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Complaint Management</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Citizen links */}
            {citizenLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                label={link.label}
                icon={link.icon}
                isActive={isActive(link.to)}
              />
            ))}

            {/* Visual divider */}
            <div className="admin-divider mx-2" />

            {/* Admin links */}
            <div className="flex items-center gap-0.5">
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                    isActive(link.to)
                      ? "text-red-600"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  style={isActive(link.to) ? { background: "rgba(254,242,242,0.7)" } : {}}
                >
                  <span
                    className={`transition-colors duration-150 ${
                      isActive(link.to)
                        ? "text-red-500"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                  {isActive(link.to) && (
                    <span
                      className="nav-active-bar"
                      style={{ background: "#ef4444", boxShadow: "0 0 8px 0 rgba(239,68,68,0.45)" }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right utility ── */}
          <div className="hidden lg:flex items-center gap-2">
            {isAdminRoute ? (
              <span className="admin-badge">
                <span className="admin-badge-dot" />
                Admin
              </span>
            ) : (
              <span className="citizen-badge">
                <span className="citizen-badge-dot" />
                Citizen
              </span>
            )}
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            className={`hamburger-btn lg:hidden ${mobileOpen ? "hamburger-open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="mobile-menu lg:hidden pb-3">
            {/* Citizen section */}
            <p className="mobile-section-label">Citizen Portal</p>
            {citizenLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${isActive(link.to) ? "active" : ""}`}
              >
                <span className="mobile-icon">{link.icon}</span>
                {link.label}
                {isActive(link.to) && (
                  <span
                    className="ml-auto text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full"
                  >
                    Active
                  </span>
                )}
              </Link>
            ))}

            <div className="mobile-divider mx-4 my-2" />

            {/* Admin section */}
            <p className="mobile-section-label">Admin</p>
            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link mobile-admin-link ${isActive(link.to) ? "active" : ""}`}
              >
                <span className="mobile-icon">{link.icon}</span>
                {link.label}
                {isActive(link.to) && (
                  <span
                    className="ml-auto text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full"
                  >
                    Active
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
