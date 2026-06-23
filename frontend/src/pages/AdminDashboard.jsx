import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { DEPARTMENTS, STATUS_VALUES } from "../utils/constants";

const PRIORITY_LABELS = { Low: "🟢", Medium: "🟡", High: "🟠", Critical: "🔴" };

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", department: "", note: "" });
  const [filters, setFilters] = useState({ status: "", category: "", emergency: "" });
  const [search, setSearch] = useState("");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.emergency) params.emergency = filters.emergency;

      const [complaintsRes, statsRes] = await Promise.all([
        API.get("/api/complaints", { params }),
        API.get("/api/complaints/stats/dashboard"),
      ]);
      setComplaints(complaintsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (id) => {
    try {
      await API.put(`/api/complaints/${id}`, editForm);
      setEditId(null);
      toast.success("Complaint updated successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) return;
    try {
      await API.delete(`/api/complaints/${id}`);
      toast.success("Complaint deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.complaintId?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.citizenName?.toLowerCase().includes(q) ||
      c.citizenEmail?.toLowerCase().includes(q)
    );
  });

  const emergencies = filteredComplaints.filter((c) => c.isEmergency && c.status !== "Resolved");
  const regular = filteredComplaints.filter((c) => !c.isEmergency || c.status === "Resolved");

  const statsCards = [
    { title: "Total Complaints", value: stats.total ?? 0, icon: "📋", color: "#2563eb", bg: "#dbeafe" },
    { title: "Pending", value: stats.pending ?? 0, icon: "⏳", color: "#d97706", bg: "#fef3c7" },
    { title: "Resolved", value: stats.resolved ?? 0, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
    { title: "Active Emergencies", value: stats.emergency ?? 0, icon: "🚨", color: "#dc2626", bg: "#fee2e2" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: "26px" }}>Admin Dashboard</h1>
        <p>Manage complaints, assign departments, and monitor city operations.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statsCards.map((card) => (
          <div key={card.title} className="card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: card.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {card.title}
              </p>
              <p style={{ fontSize: "28px", fontWeight: "800", color: card.color, lineHeight: 1.1 }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Emergencies Alert */}
      {emergencies.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
          border: "1px solid #b91c1c",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white",
        }}>
          <span style={{ fontSize: "24px" }}>🚨</span>
          <div>
            <p style={{ fontWeight: "700", fontSize: "15px" }}>
              {emergencies.length} Active Emergency {emergencies.length === 1 ? "Complaint" : "Complaints"}
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
              Immediate attention required
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="🔍 Search by title, ID, citizen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1", minWidth: "200px" }}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            style={{ width: "160px" }}
          >
            <option value="">All Statuses</option>
            {STATUS_VALUES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.emergency}
            onChange={(e) => setFilters(f => ({ ...f, emergency: e.target.value }))}
            style={{ width: "160px" }}
          >
            <option value="">All Types</option>
            <option value="true">🚨 Emergency Only</option>
          </select>
          {(filters.status || filters.emergency || search) && (
            <button
              onClick={() => { setFilters({ status: "", category: "", emergency: "" }); setSearch(""); }}
              className="btn btn-secondary btn-sm"
            >
              ✕ Clear
            </button>
          )}
          <button onClick={fetchData} className="btn btn-secondary btn-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Emergency Table */}
      {emergencies.length > 0 && (
        <section>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            🚨 Emergency Complaints
            <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: "20px", fontSize: "12px" }}>
              {emergencies.length}
            </span>
          </h2>
          <ComplaintTable
            complaints={emergencies}
            editId={editId}
            editForm={editForm}
            setEditId={setEditId}
            setEditForm={setEditForm}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            highlight
          />
        </section>
      )}

      {/* Main Table */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            All Complaints
            <span style={{ background: "var(--bg-surface-alt)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", border: "1px solid var(--border-color)" }}>
              {filteredComplaints.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "52px" }} />
            ))}
          </div>
        ) : (
          <ComplaintTable
            complaints={regular}
            editId={editId}
            editForm={editForm}
            setEditId={setEditId}
            setEditForm={setEditForm}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}

function ComplaintTable({ complaints, editId, editForm, setEditId, setEditForm, handleUpdate, handleDelete, highlight }) {
  if (complaints.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No complaints found</h3>
          <p>No complaints match the current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container" style={highlight ? { borderColor: "#fca5a5" } : {}}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Supports</th>
            <th>Department</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--primary-600)", fontWeight: "600" }}>
                  {c.complaintId}
                </span>
              </td>
              <td>
                <div>
                  <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px", marginBottom: "2px" }}>{c.title}</p>
                  {c.citizenName && (
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>by {c.citizenName}</p>
                  )}
                </div>
              </td>
              <td>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>{c.category}</span>
              </td>
              <td><StatusBadge status={c.status} /></td>
              <td>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>
                  {PRIORITY_LABELS[c.effectivePriority || c.priority]} {c.effectivePriority || c.priority}
                </span>
              </td>
              <td>
                <span style={{ fontWeight: "700", color: c.supportCount > 0 ? "var(--primary-600)" : "var(--text-muted)", fontSize: "13px" }}>
                  {c.supportCount}
                </span>
              </td>
              <td>
                <span style={{ fontSize: "12px", color: c.department ? "var(--text-secondary)" : "var(--text-muted)", fontStyle: c.department ? "normal" : "italic" }}>
                  {c.department || "Unassigned"}
                </span>
              </td>
              <td>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </td>
              <td>
                {editId === c._id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "180px" }}>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ fontSize: "12px", padding: "5px 8px" }}
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      style={{ fontSize: "12px", padding: "5px 8px" }}
                    >
                      <option value="">Unassigned</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Add a note..."
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      style={{ fontSize: "12px", padding: "5px 8px" }}
                    />
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => handleUpdate(c._id)}
                        className="btn btn-primary btn-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => {
                        setEditId(c._id);
                        setEditForm({ status: c.status, department: c.department || "", note: "" });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Del
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
