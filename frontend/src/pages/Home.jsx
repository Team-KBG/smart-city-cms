import { Link } from "react-router-dom";

const features = [
  {
    title: "Register Complaint",
    desc: "Report civic issues with photo proof and GPS location.",
    to: "/register",
    icon: "📝",
  },
  {
    title: "Track Status",
    desc: "Track your complaint using a unique Complaint ID.",
    to: "/track",
    icon: "🔍",
  },
  {
    title: "Heat Map",
    desc: "View complaint clusters and high-density areas on a map.",
    to: "/heatmap",
    icon: "🗺️",
  },
  {
    title: "Public Voting",
    desc: "Vote for community improvements like parks and street lights.",
    to: "/vote",
    icon: "🗳️",
  },
  {
    title: "Waste Collection",
    desc: "Request garbage pickup and view collection schedules.",
    to: "/waste",
    icon: "♻️",
  },
  {
    title: "Admin Dashboard",
    desc: "Manage complaints, assign departments, and view analytics.",
    to: "/admin",
    icon: "⚙️",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-14 text-white shadow-xl">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-200">
            Smart City Initiative
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Smart City Complaint Management System
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Report, track, and resolve civic issues faster. Powered by geospatial
            intelligence, AI categorization, and community participation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow hover:bg-blue-50"
            >
              Report an Issue
            </Link>
            <Link
              to="/track"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Platform Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "AI Categorization", text: "Auto-detect category and department from description" },
          { label: "Geospatial Detection", text: "Find duplicate complaints within 100 meters" },
          { label: "Citizen Reputation", text: "Earn Bronze, Silver, or Gold citizen levels" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-500">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
