import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const WASTE_TYPES = ["General", "Recyclable", "Organic", "Bulk", "Hazardous"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WasteCollection() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("schedule");
  const [loadingData, setLoadingData] = useState(true);

  // Admin: Add Schedule form
  const [scheduleForm, setScheduleForm] = useState({ area: "", day: "Monday", time: "", notes: "" });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Citizen: Pickup Request form
  const [pickupForm, setPickupForm] = useState({
    address: "",
    area: "",
    wasteType: "General",
    preferredDate: "",
  });
  const [pickupLoading, setPickupLoading] = useState(false);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [schedRes] = await Promise.all([
        API.get("/api/waste/schedules"),
      ]);
      setSchedules(schedRes.data.data);

      // Admin also fetches pickup requests
      if (isAdmin) {
        const reqRes = await API.get("/api/waste/pickup-requests");
        setRequests(reqRes.data.data);
      }
    } catch (err) {
      toast.error("Failed to load waste data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleLoading(true);
    try {
      await API.post("/api/waste/schedules", scheduleForm);
      toast.success("Collection schedule added successfully!");
      setScheduleForm({ area: "", day: "Monday", time: "", notes: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleScheduleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await API.delete(`/api/waste/schedules/${id}`);
      toast.success("Schedule deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete schedule");
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    setPickupLoading(true);
    try {
      // citizenName and citizenEmail come from req.user on backend
      await API.post("/api/waste/pickup-requests", pickupForm);
      toast.success("Pickup request submitted! We'll schedule it soon.");
      setPickupForm({ address: "", area: "", wasteType: "General", preferredDate: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setPickupLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/api/waste/pickup-requests/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Build tabs based on role
  const tabs = [
    { key: "schedule", label: "📅 View Schedules" },
    { key: "request", label: "📦 Request Pickup" },
    ...(isAdmin ? [
      { key: "manage", label: "⚙️ Manage (Admin)" },
      { key: "requests", label: "📋 Pickup Requests (Admin)" },
    ] : []),
  ];

  const statusColors = {
    Pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    Scheduled: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    Completed: { bg: "#dcfce7", color: "#14532d", border: "#86efac" },
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>♻️ Waste Collection Scheduler</h1>
        <p>
          {isAdmin
            ? "Manage collection schedules and handle pickup requests from citizens."
            : "View your area's garbage collection schedule and request special pickup."}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "24px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- VIEW SCHEDULES ---- */}
      {activeTab === "schedule" && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              Active Collection Schedules
            </h2>
            <button onClick={fetchData} className="btn btn-secondary btn-sm">🔄 Refresh</button>
          </div>

          {loadingData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: "76px", borderRadius: "12px" }} />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No schedules available</h3>
              <p>Collection schedules will appear here once added by administrators.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {schedules.map((s) => (
                <div key={s._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}>
                      ♻️
                    </div>
                    <div>
                      <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px", marginBottom: "2px" }}>{s.area}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {s.day} at {s.time}
                      </p>
                      {s.notes && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.notes}</p>}
                    </div>
                  </div>
                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #86efac" }}>
                    ✓ Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- REQUEST PICKUP ---- */}
      {activeTab === "request" && (
        <div className="animate-fade-in">
          <div className="alert alert-info" style={{ marginBottom: "20px" }}>
            <span>👤</span>
            <span>Submitting as: <strong>{user?.name}</strong> ({user?.email})</span>
          </div>

          <form onSubmit={handlePickupSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Request Special Pickup</h3>

            <div className="form-group">
              <label>Full Address *</label>
              <input
                placeholder="House No, Street, Colony"
                value={pickupForm.address}
                onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                required
              />
            </div>

            <div className="form-row form-row-3">
              <div className="form-group">
                <label>Area *</label>
                <input
                  placeholder="Sector 62"
                  value={pickupForm.area}
                  onChange={(e) => setPickupForm({ ...pickupForm, area: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Waste Type</label>
                <select
                  value={pickupForm.wasteType}
                  onChange={(e) => setPickupForm({ ...pickupForm, wasteType: e.target.value })}
                >
                  {WASTE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Date</label>
                <input
                  type="date"
                  value={pickupForm.preferredDate}
                  onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pickupLoading}
              className="btn btn-primary btn-full"
            >
              {pickupLoading ? (
                <><span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Submitting...</>
              ) : "📦 Submit Pickup Request"}
            </button>
          </form>
        </div>
      )}

      {/* ---- ADMIN: MANAGE SCHEDULES ---- */}
      {activeTab === "manage" && isAdmin && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <form onSubmit={handleScheduleSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              ➕ Add Collection Schedule
            </h3>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label>Area *</label>
                <input
                  placeholder="e.g. Sector 62"
                  value={scheduleForm.area}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, area: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Day *</label>
                <select
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  placeholder="Optional notes"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={scheduleLoading}
              className="btn btn-primary"
              style={{ alignSelf: "flex-start" }}
            >
              {scheduleLoading ? "Adding..." : "Add Schedule"}
            </button>
          </form>

          {/* Existing Schedules with Delete */}
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
              Existing Schedules
            </h3>
            {schedules.length === 0 ? (
              <div className="empty-state" style={{ padding: "30px" }}><p>No schedules yet</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {schedules.map((s) => (
                  <div key={s._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>{s.area}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.day} at {s.time}</p>
                    </div>
                    <button
                      onClick={() => handleScheduleDelete(s._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- ADMIN: PICKUP REQUESTS ---- */}
      {activeTab === "requests" && isAdmin && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Citizen Pickup Requests
              {requests.length > 0 && (
                <span style={{ marginLeft: "8px", background: "var(--bg-surface-alt)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", border: "1px solid var(--border-color)" }}>
                  {requests.length}
                </span>
              )}
            </h3>
            <button onClick={fetchData} className="btn btn-secondary btn-sm">🔄 Refresh</button>
          </div>

          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No pickup requests</h3>
              <p>Citizens' pickup requests will appear here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Area</th>
                    <th>Waste Type</th>
                    <th>Preferred Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const sc = statusColors[r.status] || {};
                    return (
                      <tr key={r._id}>
                        <td>
                          <p style={{ fontWeight: "600", fontSize: "13px" }}>{r.citizenName}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.citizenEmail}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{r.address}</p>
                        </td>
                        <td style={{ fontWeight: "500" }}>{r.area}</td>
                        <td>{r.wasteType}</td>
                        <td style={{ fontSize: "12px" }}>{r.preferredDate || "—"}</td>
                        <td>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {r.status === "Pending" && (
                              <button
                                onClick={() => updateRequestStatus(r._id, "Scheduled")}
                                className="btn btn-sm"
                                style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" }}
                              >
                                Schedule
                              </button>
                            )}
                            {r.status === "Scheduled" && (
                              <button
                                onClick={() => updateRequestStatus(r._id, "Completed")}
                                className="btn btn-sm"
                                style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
