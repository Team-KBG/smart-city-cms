export default function StatsCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-amber-500 to-amber-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-xl text-white shadow`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
