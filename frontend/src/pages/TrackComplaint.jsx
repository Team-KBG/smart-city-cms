import { useState } from "react";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMsg, setSupportMsg] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setComplaint(null);
    try {
      const { data } = await API.get(`/api/complaints/track/${complaintId.trim()}`);
      setComplaint(data.data);
    } catch {
      setError("Complaint not found. Please check your Complaint ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    try {
      const { data } = await API.post(`/api/complaints/${complaint._id}/support`, {
        citizenEmail: supportEmail,
      });
      setComplaint(data.data);
      setSupportMsg("Thank you for supporting this complaint!");
    } catch (err) {
      setSupportMsg(err.response?.data?.message || "Failed to support");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Track Complaint</h1>
      <p className="mt-2 text-slate-500">Enter your Complaint ID to check status and updates.</p>

      <form onSubmit={handleTrack} className="mt-8 flex gap-3">
        <input
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          placeholder="CMP-20250622-1234"
          required
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {complaint && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Complaint ID</p>
              <p className="text-xl font-bold text-slate-900">{complaint.complaintId}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={complaint.status} />
              {complaint.isEmergency && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  EMERGENCY
                </span>
              )}
            </div>
          </div>

          <h2 className="mt-4 text-lg font-semibold">{complaint.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Category", complaint.category],
              ["Department", complaint.department || "Not assigned"],
              ["Priority", complaint.effectivePriority || complaint.priority],
              ["Support Count", complaint.supportCount],
              ["Address", complaint.address || "N/A"],
              ["Registered", new Date(complaint.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {complaint.imageUrl && (
            <img
              src={complaint.imageUrl}
              alt="Complaint proof"
              className="mt-4 max-h-48 rounded-xl object-cover"
            />
          )}

          {complaint.statusHistory?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">Status History</h3>
              <div className="mt-3 space-y-2">
                {complaint.statusHistory.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <StatusBadge status={entry.status} />
                    <span className="text-slate-500">
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaint.status !== "Resolved" && (
            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Support this complaint</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSupport}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Support 👍
                </button>
              </div>
              {supportMsg && <p className="mt-2 text-sm text-green-600">{supportMsg}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
