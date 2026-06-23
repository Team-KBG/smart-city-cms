import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WasteCollection() {
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("schedule");
  const [scheduleForm, setScheduleForm] = useState({ area: "", day: "", time: "", notes: "" });
  const [pickupForm, setPickupForm] = useState({
    citizenName: "",
    citizenEmail: "",
    address: "",
    area: "",
    wasteType: "General",
    preferredDate: "",
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // "success" | "error"
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const { user } = useAuth();

  const isAuthorized = user && (user.role === "admin" || user.role === "department_staff");

  // Pre-fill form from logged-in user
  useEffect(() => {
    if (user) {
      setPickupForm((prev) => ({
        ...prev,
        citizenName: prev.citizenName || user.name || "",
        citizenEmail: prev.citizenEmail || user.email || "",
      }));
    }
  }, [user]);

  const showMsg = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await API.get("/api/waste/schedules");
      // Guard: always set an array even if API returns unexpected shape
      setSchedules(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to load schedules", err);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchPickupRequests = async () => {
    if (!isAuthorized) return;
    try {
      const res = await API.get("/api/waste/pickup-requests");
      setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      // 403 = not authorized — just show empty list silently
      if (err.response?.status === 403) {
        setRequests([]);
      } else {
        console.error("Failed to load pickup requests", err);
        setRequests([]);
      }
    }
  };

  const fetchData = async () => {
    // Run fetches independently so one failure doesn't crash the other
    await Promise.allSettled([fetchSchedules(), fetchPickupRequests()]);
  };

  useEffect(() => {
    fetchData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/waste/schedules", scheduleForm);
      showMsg("Schedule added successfully!");
      setScheduleForm({ area: "", day: "", time: "", notes: "" });
      fetchSchedules();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add schedule", "error");
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!pickupForm.citizenName.trim()) {
      showMsg("Name is required", "error");
      return;
    }
    if (!pickupForm.citizenEmail.trim()) {
      showMsg("Email is required", "error");
      return;
    }
    if (!pickupForm.address.trim()) {
      showMsg("Address is required", "error");
      return;
    }
    if (!pickupForm.area.trim()) {
      showMsg("Area is required", "error");
      return;
    }
    try {
      await API.post("/api/waste/pickup-requests", pickupForm);
      showMsg("Pickup request submitted! We will contact you shortly.");
      setPickupForm((prev) => ({
        ...prev,
        address: "",
        area: "",
        preferredDate: "",
      }));
      if (isAuthorized) fetchPickupRequests();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to submit request", "error");
    }
  };

  const updateRequestStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.put(`/api/waste/pickup-requests/${id}`, { status });
      await fetchPickupRequests();
    } catch (err) {
      if (err.response?.status === 403) {
        showMsg("You don't have permission to update pickup requests.", "error");
      } else {
        showMsg(err.response?.data?.message || "Update failed", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">Waste Collection Scheduler</h1>
      <p className="mt-2 text-slate-500">
        View collection schedules and request garbage pickup.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["schedule", "request", ...(isAuthorized ? ["admin"] : [])].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {t === "schedule" ? "View Schedule" : t === "request" ? "Request Pickup" : "Manage (Admin)"}
          </button>
        ))}
      </div>

      {msg && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            msgType === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {msg}
        </div>
      )}

      {/* ── View Schedules ── */}
      {tab === "schedule" && (
        <div className="mt-8 space-y-3">
          {loadingSchedules ? (
            <p className="text-center text-slate-400">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-4xl">🗓️</p>
              <p className="mt-3 text-slate-500">No collection schedules available yet.</p>
            </div>
          ) : (
            schedules.map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{s.area}</p>
                    <p className="text-sm text-slate-500">
                      {s.day} at {s.time}
                    </p>
                    {s.notes && <p className="mt-1 text-xs text-slate-400">{s.notes}</p>}
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 self-start">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Request Pickup ── */}
      {tab === "request" && (
        <form onSubmit={handlePickupSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800">Request Garbage Pickup</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Your Name *</label>
              <input
                placeholder="John Doe"
                value={pickupForm.citizenName}
                onChange={(e) => setPickupForm({ ...pickupForm, citizenName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email *</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={pickupForm.citizenEmail}
                onChange={(e) => setPickupForm({ ...pickupForm, citizenEmail: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Full Address *</label>
            <input
              placeholder="Plot 5, Sector 62, Noida"
              value={pickupForm.address}
              onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Area *</label>
              <input
                placeholder="Sector 62"
                value={pickupForm.area}
                onChange={(e) => setPickupForm({ ...pickupForm, area: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Waste Type</label>
              <select
                value={pickupForm.wasteType}
                onChange={(e) => setPickupForm({ ...pickupForm, wasteType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option>General</option>
                <option>Recyclable</option>
                <option>Organic</option>
                <option>Bulk</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Preferred Date</label>
              <input
                type="date"
                value={pickupForm.preferredDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Request Pickup
          </button>
        </form>
      )}

      {/* ── Admin/Dept: Manage ── */}
      {tab === "admin" && isAuthorized && (
        <div className="mt-8 space-y-8">
          {/* Add Schedule Form */}
          <form onSubmit={handleScheduleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800">Add Collection Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                placeholder="Area *"
                value={scheduleForm.area}
                onChange={(e) => setScheduleForm({ ...scheduleForm, area: e.target.value })}
                required
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                placeholder="Day (e.g. Monday) *"
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                required
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                placeholder="Time (e.g. 7:00 AM) *"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                required
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <input
              placeholder="Notes (optional)"
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Add Schedule
            </button>
          </form>

          {/* Pickup Requests */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              Pickup Requests{" "}
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {requests.length}
              </span>
            </h3>
            <div className="space-y-3">
              {requests.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No pickup requests yet.
                </p>
              )}
              {requests.map((r) => (
                <div
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {r.citizenName} — <span className="text-slate-500">{r.area}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.address} · {r.wasteType}
                      {r.preferredDate && (
                        <> · Preferred: {new Date(r.preferredDate).toLocaleDateString()}</>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{r.citizenEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.status === "Pending" && (
                      <button
                        onClick={() => updateRequestStatus(r._id, "Scheduled")}
                        disabled={updatingId === r._id}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {updatingId === r._id ? "..." : "Schedule"}
                      </button>
                    )}
                    {r.status === "Scheduled" && (
                      <button
                        onClick={() => updateRequestStatus(r._id, "Completed")}
                        disabled={updatingId === r._id}
                        className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {updatingId === r._id ? "..." : "Complete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
