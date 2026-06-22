import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/register", label: "Register Complaint" },
  { to: "/track", label: "Track Complaint" },
  { to: "/heatmap", label: "Heat Map" },
  { to: "/vote", label: "Public Voting" },
  { to: "/waste", label: "Waste Collection" },
  { to: "/admin", label: "Admin Dashboard" },
  { to: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            SC
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Smart City CMS</p>
            <p className="text-xs text-slate-500">Complaint Management</p>
          </div>
        </Link>

        <div className="flex flex-wrap gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                location.pathname === link.to
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
