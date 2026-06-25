import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Recycle, Settings, PackageCheck, Calendar, Clock,
  User, Trash2, PlusCircle, RefreshCw, Truck, CheckCircle2, Inbox
} from "lucide-react";

const WASTE_TYPES = ["General", "Recyclable", "Organic", "Bulk", "Hazardous"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STATUS_COLORS = {
  Pending:   { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  Scheduled: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  Completed: { bg: "#dcfce7", color: "#14532d", border: "#86efac" },
};

export default function WasteCollection() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [schedules, setSchedules]     = useState([]);
  const [requests, setRequests]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Admin: Add Schedule form state
  const [scheduleForm, setScheduleForm] = useState({ area: "", day: "Monday", time: "", notes: "" });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Citizen: Pickup Request form state
  const [pickupForm, setPickupForm] = useState({ address: "", area: "", wasteType: "General", preferredDate: "" });
  const [pickupLoading, setPickupLoading] = useState(false);

  // Tab logic:
  // Citizens: "schedule", "request"
  // Admins: "schedule", "manage", "requests"
  // Admin CANNOT access "request" tab — they are not citizens
  const buildTabs = () => {
    const base = [{ key: "schedule", label: "View Schedules", Icon: Calendar }];
    if (isAdmin) {
      return [
        ...base,
        { key: "manage",   label: "Manage Schedules", Icon: Settings },
        { key: "requests", label: "Pickup Requests", Icon: PackageCheck },
      ];
    }
    return [
      ...base,
      { key: "request", label: "Request Pickup", Icon: Truck },
    ];
  };

  const tabs = buildTabs();
  const [activeTab, setActiveTab] = useState("schedule");

  // Ensure active tab is valid after role change
  useEffect(() => {
    const validKeys = tabs.map((t) => t.key);
    if (!validKeys.includes(activeTab)) setActiveTab("schedule");
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const schedRes = await API.get("/api/waste/schedules");
      setSchedules(schedRes.data.data || []);

      if (isAdmin) {
        const reqRes = await API.get("/api/waste/pickup-requests");
        setRequests(reqRes.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load waste data. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Admin: Add Schedule ────────────────────────────────────────
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.area.trim()) { toast.error("Area is required"); return; }
    if (!scheduleForm.time) { toast.error("Time is required"); return; }

    setScheduleLoading(true);
    try {
      await API.post("/api/waste/schedules", {
        ...scheduleForm,
        area: scheduleForm.area.trim(),
      });
      toast.success("Collection schedule added!");
      setScheduleForm({ area: "", day: "Monday", time: "", notes: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleScheduleDelete = async (id) => {
    if (!window.confirm("Delete this schedule? This cannot be undone.")) return;
    try {
      await API.delete(`/api/waste/schedules/${id}`);
      toast.success("Schedule deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  // ── Citizen: Request Pickup ────────────────────────────────────
  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!pickupForm.address.trim()) { toast.error("Address is required"); return; }
    if (!pickupForm.area.trim()) { toast.error("Area is required"); return; }

    setPickupLoading(true);
    try {
      await API.post("/api/waste/pickup-requests", {
        ...pickupForm,
        address: pickupForm.address.trim(),
        area: pickupForm.area.trim(),
      });
      toast.success("Pickup request submitted! We'll schedule it soon. 🚛");
      setPickupForm({ address: "", area: "", wasteType: "General", preferredDate: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setPickupLoading(false);
    }
  };

  // ── Admin: Update Request Status ───────────────────────────────
  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/api/waste/pickup-requests/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontSize: "26px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Recycle size={20} color="white" />
          </span>
          Waste Collection Scheduler
        </h1>
        <p>
          {isAdmin
            ? "Manage area collection schedules and handle citizen pickup requests."
            : "Check your area's garbage schedule and request a special pickup."}
        </p>
      </div>

      {/* Role indicator */}
      <div className={`alert ${isAdmin ? "alert-warning" : "alert-info"}`} style={{ marginBottom: "20px" }}>
        {isAdmin ? <Settings size={15} style={{ flexShrink: 0 }} /> : <User size={15} style={{ flexShrink: 0 }} />}
        <span>
          {isAdmin
            ? <><strong>Admin Mode:</strong> You can manage schedules and view citizen pickup requests.</>
            : <><strong>Logged in as:</strong> {user?.name} ({user?.email})</>}
        </span>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "24px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <tab.Icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: VIEW SCHEDULES ══════════════════════════════════════ */}
      {activeTab === "schedule" && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              Active Collection Schedules
              {schedules.length > 0 && (
                <span style={{ marginLeft: "8px", background: "var(--bg-surface-alt)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", border: "1px solid var(--border-color)" }}>
                  {schedules.length}
                </span>
              )}
            </h2>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ gap: "5px", display: "inline-flex", alignItems: "center" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loadingData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "76px", borderRadius: "12px" }} />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Calendar size={28} color="var(--text-muted)" /></div>
              <h3>No schedules yet</h3>
              <p>
                {isAdmin
                  ? "Add a schedule from the Manage tab."
                  : "Collection schedules will appear here once added by the city authority."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {schedules.map((s) => (
                <div key={s._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: "rgba(22,163,74,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Recycle size={22} color="#16a34a" />
                    </div>
                    <div>
                      <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px", marginBottom: "2px" }}>{s.area}</p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {s.day} &nbsp;·&nbsp;
                        <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {s.time}
                      </p>
                      {s.notes && (
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>📝 {s.notes}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #86efac" }}>
                      ✓ Active
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleScheduleDelete(s._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: CITIZEN — REQUEST PICKUP ════════════════════════════ */}
      {activeTab === "request" && !isAdmin && (
        <div className="animate-fade-in">
          <form onSubmit={handlePickupSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={16} color="var(--primary-500)" /> Request Special Pickup
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Need an extra pickup outside the regular schedule? Submit a request and we'll send a truck.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="pickup-address">Full Address *</label>
              <input
                id="pickup-address"
                placeholder="House No., Street, Colony"
                value={pickupForm.address}
                onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label htmlFor="pickup-area">Area / Sector *</label>
                <input
                  id="pickup-area"
                  placeholder="e.g. Sector 62, Noida"
                  value={pickupForm.area}
                  onChange={(e) => setPickupForm({ ...pickupForm, area: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pickup-type">Waste Type</label>
                <select
                  id="pickup-type"
                  value={pickupForm.wasteType}
                  onChange={(e) => setPickupForm({ ...pickupForm, wasteType: e.target.value })}
                >
                  {WASTE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pickup-date">Preferred Date (optional)</label>
              <input
                id="pickup-date"
                type="date"
                value={pickupForm.preferredDate}
                onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <button type="submit" disabled={pickupLoading} className="btn btn-primary btn-full btn-lg" style={{ gap: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {pickupLoading
                ? <><span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Submitting...</>
                : <><Truck size={16} /> Submit Pickup Request</>}
            </button>
          </form>
        </div>
      )}

      {/* ══ TAB: ADMIN — MANAGE SCHEDULES ════════════════════════════ */}
      {activeTab === "manage" && isAdmin && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Add form */}
          <form onSubmit={handleScheduleSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <PlusCircle size={16} color="var(--primary-500)" /> Add Collection Schedule
            </h3>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label>Area / Sector *</label>
                <input
                  placeholder="e.g. Sector 62, Noida"
                  value={scheduleForm.area}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, area: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Day of Week *</label>
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
                <label>Pickup Time *</label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  placeholder="e.g. Morning pickup only"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={scheduleLoading}
              className="btn btn-primary"
              style={{ alignSelf: "flex-start", gap: "6px", display: "inline-flex", alignItems: "center" }}
            >
              {scheduleLoading ? "Adding..." : <><PlusCircle size={15} /> Add Schedule</>}
            </button>
          </form>

          {/* Existing schedules list with delete */}
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>
              Existing Schedules ({schedules.length})
            </h3>
            {schedules.length === 0 ? (
              <div className="empty-state" style={{ padding: "30px" }}>
                <p>No schedules added yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {schedules.map((s) => (
                  <div key={s._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>{s.area}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.day} at {s.time}</p>
                      {s.notes && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.notes}</p>}
                    </div>
                    <button
                      onClick={() => handleScheduleDelete(s._id)}
                      className="btn btn-danger btn-sm"
                      style={{ gap: "4px", display: "inline-flex", alignItems: "center" }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: ADMIN — PICKUP REQUESTS ═════════════════════════════ */}
      {activeTab === "requests" && isAdmin && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Citizen Pickup Requests
              <span style={{ marginLeft: "8px", background: "var(--bg-surface-alt)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", border: "1px solid var(--border-color)" }}>
                {requests.length}
              </span>
            </h3>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ gap: "5px", display: "inline-flex", alignItems: "center" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loadingData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "60px", borderRadius: "10px" }} />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Inbox size={28} color="var(--text-muted)" /></div>
              <h3>No pickup requests</h3>
              <p>Citizen pickup requests will appear here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Address</th>
                    <th>Area</th>
                    <th>Type</th>
                    <th>Preferred Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const sc = STATUS_COLORS[r.status] || {};
                    return (
                      <tr key={r._id}>
                        <td>
                          <p style={{ fontWeight: "600", fontSize: "13px" }}>{r.citizenName}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.citizenEmail}</p>
                        </td>
                        <td style={{ fontSize: "12px", maxWidth: "160px" }}>{r.address}</td>
                        <td style={{ fontWeight: "500" }}>{r.area}</td>
                        <td>
                          <span style={{ padding: "2px 8px", background: "var(--bg-surface-alt)", borderRadius: "20px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)" }}>
                            {r.wasteType}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px" }}>{r.preferredDate || "—"}</td>
                        <td>
                          <span style={{
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "11px", fontWeight: "700",
                            background: sc.bg, color: sc.color,
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
                                style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", gap: "4px", display: "inline-flex", alignItems: "center" }}
                              >
                                <Calendar size={11} /> Schedule
                              </button>
                            )}
                            {r.status === "Scheduled" && (
                              <button
                                onClick={() => updateRequestStatus(r._id, "Completed")}
                                className="btn btn-sm"
                                style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", gap: "4px", display: "inline-flex", alignItems: "center" }}
                              >
                                <CheckCircle2 size={11} /> Complete
                              </button>
                            )}
                            {r.status === "Completed" && (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Done</span>
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
