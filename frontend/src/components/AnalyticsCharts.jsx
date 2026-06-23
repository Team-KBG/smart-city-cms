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
} from "recharts";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AnalyticsCharts({ analytics }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textStroke = isDark ? "#94a3b8" : "#475569";
  const gridStroke = isDark ? "#334155" : "#e2e8f0";

  if (!analytics) return null;

  const statusData = Object.entries(analytics.statusDistribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  const categoryData = Object.entries(analytics.categoryDistribution || {}).map(
    ([name, value]) => ({ name, count: value })
  );

  const trendData = Array.isArray(analytics.monthlyTrend)
    ? analytics.monthlyTrend
    : Object.entries(analytics.monthlyTrend || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
          <p className="text-sm text-slate-500">Most Complained Area</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            {analytics.mostComplainedArea?.area || "N/A"}
          </p>
          <p className="text-sm text-slate-500">
            {analytics.mostComplainedArea?.count || 0} complaints
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
          <p className="text-sm text-slate-500">Most Common Issue</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            {analytics.mostCommonIssue?.category || "N/A"}
          </p>
          <p className="text-sm text-slate-500">
            {analytics.mostCommonIssue?.count || 0} complaints
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
          <p className="text-sm text-slate-500">Avg Resolution Time</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            {analytics.avgResolutionDays !== undefined ? `${analytics.avgResolutionDays} Days` : `${analytics.avgResolutionHours || 0} hours`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textStroke }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: textStroke }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Monthly Complaint Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={{ fill: textStroke }} />
            <YAxis tick={{ fill: textStroke }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-300">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Department Performance Ranking</h3>
        <div className="space-y-3">
          {(analytics.departmentPerformance || []).map((dept, i) => (
            <div key={dept.department} className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-200">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900 dark:text-slate-200">{dept.department}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {dept.resolved}/{dept.assigned} resolved ({dept.score}%)
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${dept.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
