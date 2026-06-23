import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isDeptStaff } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Define links based on roles
  let links = [];
  if (isAdmin) {
    links = [
      { to: "/admin", label: "Admin Dashboard" },
      { to: "/analytics", label: "Analytics" },
      { to: "/heatmap", label: "Heat Map" },
      { to: "/leaderboard", label: "Leaderboard" },
    ];
  } else if (isDeptStaff) {
    links = [
      { to: "/dept-dashboard", label: "Department Dashboard" },
      { to: "/heatmap", label: "Heat Map" },
    ];
  } else {
    // Citizen or Public
    links = [
      { to: "/", label: "Home" },
      { to: "/register", label: "Register Complaint" },
      { to: "/track", label: "Track Complaint" },
      { to: "/heatmap", label: "Heat Map" },
      { to: "/vote", label: "Public Voting" },
      { to: "/waste", label: "Waste Collection" },
      { to: "/leaderboard", label: "Leaderboard" },
    ];
    if (user) {
      links.push({ to: "/my-complaints", label: "My Complaints" });
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-md">
            SC
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">Smart City CMS</p>
            <p className="text-[10px] text-slate-500 font-medium">Complaint Management</p>
          </div>
        </Link>

        {/* Mid Navigation Links */}
        <div className="flex flex-wrap gap-1 items-center">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                location.pathname === link.to
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Auth Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-300 cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-250">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-650"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register-account"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
