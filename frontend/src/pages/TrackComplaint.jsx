import { useState, useEffect } from "react";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { STATUS_VALUES } from "../utils/constants";
import { resolveImageUrl } from "../utils/auth";

export default function TrackComplaint() {
  const { user } = useAuth();
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMsg, setSupportMsg] = useState("");

  useEffect(() => {
    if (user?.email) {
      setSupportEmail(user.email);
    }
  }, [user]);

  const handleTrack = async (e = null) => {
    if (e) e.preventDefault();
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
    const email = user?.email || supportEmail;
    if (!email) {
      setSupportMsg("Please enter an email or log in to support this complaint.");
      return;
    }
    try {
      const { data } = await API.post(`/api/complaints/${complaint._id}/support`, {
        citizenEmail: email,
      });
      // Fetch complaint again to get updated fields
      const res = await API.get(`/api/complaints/track/${complaint.complaintId}`);
      setComplaint(res.data.data);
      setSupportMsg(data.message || "Support updated!");
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
              src={resolveImageUrl(complaint.imageUrl)}
              alt="Complaint proof"
              className="mt-4 max-h-48 w-full rounded-xl object-cover"
            />
          )}

          {/* Status Timeline / Stepper (Item 15) */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Timeline</h3>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 py-2 border-t border-b border-slate-100">
              {STATUS_VALUES.map((step, index) => {
                const isCompleted = STATUS_VALUES.indexOf(complaint.status) >= index;
                const isActive = complaint.status === step;
                return (
                  <div key={step} className="flex flex-col items-center flex-1 min-w-[70px]">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted && !isActive ? '✓' : index + 1}
                      </div>
                    </div>
                    <span
                      className={`mt-2 text-center text-[10px] font-bold tracking-tight transition ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History Log (Item 20) */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 font-sans">Complaint History Log</h3>
            <div className="space-y-4 relative border-l border-slate-200 pl-4 ml-2">
              {(complaint.statusHistory || []).map((entry, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white group-hover:scale-125 transition" />
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800">
                      Status: <span className="text-blue-600">{entry.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.changedAt || entry.createdAt || complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-xs text-slate-500 font-sans">
                      {entry.note}
                    </p>
                  )}
                  {entry.changedBy && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Updated By: <span className="font-semibold">{entry.changedBy.name}</span> ({entry.changedBy.role === 'admin' ? 'Admin' : 'Department Staff'})
                    </p>
                  )}
                </div>
              ))}
              {(!complaint.statusHistory || complaint.statusHistory.length === 0) && (
                <div className="relative group text-xs text-slate-400">
                  No status transitions logged yet.
                </div>
              )}
            </div>
          </div>

          {complaint.status !== "Resolved" && (
            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">
                {(complaint.supportedBy || []).includes(user?.email || supportEmail) ? "You support this complaint" : "Support this complaint"}
              </p>
              <div className="mt-2 flex gap-2">
                {!user && (
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
                <button
                  onClick={handleSupport}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    (complaint.supportedBy || []).includes(user?.email || supportEmail)
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {(complaint.supportedBy || []).includes(user?.email || supportEmail) ? "Remove Support 👎" : "Support 👍"}
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
