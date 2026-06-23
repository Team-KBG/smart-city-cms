import { useEffect, useState } from "react";
import API from "../api/axios";
import HeatMapView from "../components/HeatMapView";
import { ALL_CATEGORIES } from "../utils/constants";

export default function HeatMap() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // "all", "7d", "30d"

  useEffect(() => {
    API.get("/api/complaints/heatmap")
      .then(({ data }) => {
        setComplaints(data.data);
        setFilteredComplaints(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...complaints];

    // Filter by Category
    if (category) {
      result = result.filter((c) => c.category === category);
    }

    // Filter by Priority
    if (priority) {
      result = result.filter((c) => c.priority === priority);
    }

    // Filter by Date
    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeRange === "7d") cutoff.setDate(now.getDate() - 7);
      if (timeRange === "30d") cutoff.setDate(now.getDate() - 30);
      result = result.filter((c) => new Date(c.createdAt) >= cutoff);
    }

    setFilteredComplaints(result);
  }, [category, priority, timeRange, complaints]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Complaint Heat Map</h1>
      <p className="mt-2 text-slate-500">
        View complaint clusters and high-density areas. Red markers indicate emergencies.
      </p>

      {/* Filter Bar */}
      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500" /> Regular
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" /> Emergency Hotspots
          </span>
        </div>
        <span className="text-slate-500 font-semibold">{filteredComplaints.length} complaints shown</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100 animate-pulse text-slate-500">
            Loading map data...
          </div>
        ) : (
          <HeatMapView complaints={filteredComplaints} />
        )}
      </div>
    </div>
  );
}
