import { useEffect, useState } from "react";
import API from "../api/axios";
import HeatMapView from "../components/HeatMapView";

export default function HeatMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/complaints/heatmap")
      .then(({ data }) => setComplaints(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Complaint Heat Map</h1>
      <p className="mt-2 text-slate-500">
        View complaint clusters and high-density areas. Red markers indicate emergencies.
      </p>

      <div className="mt-4 flex gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500" /> Regular
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" /> Emergency
        </span>
        <span className="text-slate-500">{complaints.length} complaints on map</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100">
            Loading map...
          </div>
        ) : (
          <HeatMapView complaints={complaints} />
        )}
      </div>
    </div>
  );
}
