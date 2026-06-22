import { useEffect, useState } from "react";
import API from "../api/axios";

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

  const fetchData = async () => {
    try {
      const [schedRes, reqRes] = await Promise.all([
        API.get("/api/waste/schedules"),
        API.get("/api/waste/pickup-requests"),
      ]);
      setSchedules(schedRes.data.data);
      setRequests(reqRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/waste/schedules", scheduleForm);
      setMsg("Schedule added!");
      setScheduleForm({ area: "", day: "", time: "", notes: "" });
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/waste/pickup-requests", pickupForm);
      setMsg("Pickup request submitted!");
      setPickupForm({ ...pickupForm, address: "", preferredDate: "" });
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  const updateRequestStatus = async (id, status) => {
    await API.put(`/api/waste/pickup-requests/${id}`, { status });
    fetchData();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">Waste Collection Scheduler</h1>
      <p className="mt-2 text-slate-500">
        View collection schedules and request garbage pickup.
      </p>

      <div className="mt-6 flex gap-2">
        {["schedule", "request", "admin"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {t === "schedule" ? "View Schedule" : t === "request" ? "Request Pickup" : "Manage (Admin)"}
          </button>
        ))}
      </div>

      {msg && <p className="mt-4 text-sm text-green-600">{msg}</p>}

      {tab === "schedule" && (
        <div className="mt-8 space-y-3">
          {schedules.map((s) => (
            <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{s.area}</p>
                  <p className="text-sm text-slate-500">
                    {s.day} at {s.time}
                  </p>
                  {s.notes && <p className="mt-1 text-xs text-slate-400">{s.notes}</p>}
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <p className="text-center text-slate-500">No schedules available yet.</p>
          )}
        </div>
      )}

      {tab === "request" && (
        <form onSubmit={handlePickupSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Your Name *"
              value={pickupForm.citizenName}
              onChange={(e) => setPickupForm({ ...pickupForm, citizenName: e.target.value })}
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            />
            <input
              type="email"
              placeholder="Email *"
              value={pickupForm.citizenEmail}
              onChange={(e) => setPickupForm({ ...pickupForm, citizenEmail: e.target.value })}
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            />
          </div>
          <input
            placeholder="Address *"
            value={pickupForm.address}
            onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              placeholder="Area *"
              value={pickupForm.area}
              onChange={(e) => setPickupForm({ ...pickupForm, area: e.target.value })}
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            />
            <select
              value={pickupForm.wasteType}
              onChange={(e) => setPickupForm({ ...pickupForm, wasteType: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            >
              <option>General</option>
              <option>Recyclable</option>
              <option>Organic</option>
              <option>Bulk</option>
            </select>
            <input
              type="date"
              value={pickupForm.preferredDate}
              onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Request Pickup
          </button>
        </form>
      )}

      {tab === "admin" && (
        <div className="mt-8 space-y-8">
          <form onSubmit={handleScheduleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold">Add Collection Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                placeholder="Area"
                value={scheduleForm.area}
                onChange={(e) => setScheduleForm({ ...scheduleForm, area: e.target.value })}
                required
                className="rounded-xl border px-4 py-2 text-sm"
              />
              <input
                placeholder="Day (e.g. Monday)"
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                required
                className="rounded-xl border px-4 py-2 text-sm"
              />
              <input
                placeholder="Time (e.g. 7:00 AM)"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                required
                className="rounded-xl border px-4 py-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">
              Add Schedule
            </button>
          </form>

          <div>
            <h3 className="mb-4 font-semibold">Pickup Requests</h3>
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
                  <div>
                    <p className="font-medium">{r.citizenName} — {r.area}</p>
                    <p className="text-slate-500">{r.address} | {r.wasteType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.status === "Completed" ? "bg-green-100 text-green-700" :
                      r.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.status}
                    </span>
                    {r.status === "Pending" && (
                      <button
                        onClick={() => updateRequestStatus(r._id, "Scheduled")}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                      >
                        Schedule
                      </button>
                    )}
                    {r.status === "Scheduled" && (
                      <button
                        onClick={() => updateRequestStatus(r._id, "Completed")}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                      >
                        Complete
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
