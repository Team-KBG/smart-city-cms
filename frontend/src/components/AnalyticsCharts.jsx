import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";

const BRAND_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Assigned: "#3b82f6",
  "In Progress": "#8b5cf6",
  Resolved: "#10b981",
  Reopened: "#f97316",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "var(--shadow-lg)",
        fontSize: "13px",
      }}>
        {label && <p style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: "600" }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ analytics }) {
  if (!analytics) return (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h3>No analytics data</h3>
      <p>Submit some complaints first to see analytics</p>
    </div>
  );

  const statusData = Object.entries(analytics.statusDistribution || {}).map(
    ([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || "#94a3b8" })
  );

  const categoryData = Object.entries(analytics.categoryDistribution || {})
    .map(([name, count]) => ({ name: name.replace(" ", "\n"), fullName: name, count }))
    .sort((a, b) => b.count - a.count);

  const trendData = Object.entries(analytics.monthlyTrend || {})
    .slice(-12) // Last 12 months
    .map(([name, count]) => ({ name, count }));

  const deptData = (analytics.departmentPerformance || []).map((d) => ({
    department: d.department.replace(" Department", ""),
    score: d.score,
    resolved: d.resolved,
    assigned: d.assigned,
  }));

  const resolutionRate = analytics.totalComplaints > 0
    ? Math.round(((analytics.statusDistribution?.Resolved || 0) / analytics.totalComplaints) * 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {[
          { label: "Total Complaints", value: analytics.totalComplaints || 0, icon: "📋", color: "#2563eb", bg: "#dbeafe" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
          { label: "Avg Resolution", value: `${analytics.avgResolutionHours || 0}h`, icon: "⏱️", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Most Common", value: analytics.mostCommonIssue?.category || "N/A", icon: "🏷️", color: "#d97706", bg: "#fef3c7", small: true },
          { label: "Hotspot Area", value: analytics.mostComplainedArea?.area || "N/A", icon: "📍", color: "#dc2626", bg: "#fee2e2", small: true },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "18px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: kpi.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              marginBottom: "10px",
            }}>
              {kpi.icon}
            </div>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              {kpi.label}
            </p>
            <p style={{
              fontSize: kpi.small ? "14px" : "22px",
              fontWeight: "800",
              color: kpi.color,
              lineHeight: 1.1,
              wordBreak: "break-word",
            }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Pie + Bar */}
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Status Distribution Pie */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
            📊 Status Distribution
          </h3>
          {statusData.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}><p>No data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
            🏷️ Complaints by Category
          </h3>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}><p>No data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis
                  dataKey="fullName"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Trend - Area Chart */}
      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
          📈 Monthly Complaint Trend
        </h3>
        {trendData.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}><p>No trend data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ left: 0, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#colorCount)"
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Complaints"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Department Performance */}
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Department Radar */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
            🏢 Department Performance
          </h3>
          {deptData.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}><p>No data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={deptData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="department" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <Radar
                  name="Score %"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                  dot={{ r: 4, fill: "#8b5cf6" }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department Rankings List */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
            🏆 Department Rankings
          </h3>
          {(analytics.departmentPerformance || []).length === 0 ? (
            <div className="empty-state" style={{ padding: "20px 0" }}><p>No data</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(analytics.departmentPerformance || []).map((dept, i) => {
                const scoreColor = dept.score >= 70 ? "#16a34a" : dept.score >= 40 ? "#d97706" : "#dc2626";
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={dept.department}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>{medals[i] || "  "}</span>
                        <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                          {dept.department}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: "800", fontSize: "15px", color: scoreColor }}>{dept.score}%</span>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {dept.resolved}/{dept.assigned} resolved
                        </p>
                      </div>
                    </div>
                    <div style={{ height: "6px", borderRadius: "3px", background: "var(--bg-surface-alt)" }}>
                      <div style={{
                        height: "100%",
                        width: `${dept.score}%`,
                        borderRadius: "3px",
                        background: scoreColor,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
