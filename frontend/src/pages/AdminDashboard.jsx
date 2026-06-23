import { useEffect, useState } from "react";
import API from "../api/axios";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import { DEPARTMENTS, STATUS_VALUES } from "../utils/constants";
import ComplaintDetailsModal from "../components/ComplaintDetailsModal";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", department: "", note: "" });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        API.get("/api/complaints"),
        API.get("/api/complaints/stats/dashboard"),
      ]);
      setComplaints(complaintsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id) => {
    try {
      await API.put(`/api/complaints/${id}`, editForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      await API.delete(`/api/complaints/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const emergencies = complaints.filter((c) => c.isEmergency && c.status !== "Resolved");
  const regular = complaints.filter((c) => !c.isEmergency || c.status === "Resolved");

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-500">Manage complaints, assign departments, and monitor emergencies.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Total Complaints" value={stats.total || 0} icon="📋" color="blue" />
        <StatsCard title="Pending" value={stats.pending || 0} icon="⏳" color="yellow" />
        <StatsCard title="Resolved" value={stats.resolved || 0} icon="✅" color="green" />
        <StatsCard title="Emergency Active" value={stats.emergency || 0} icon="🚨" color="red" />
        <StatsCard title="Most Complained Area" value={stats.topArea || "N/A"} icon="📍" color="orange" />
      </div>

      {emergencies.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-700">
            🚨 Emergency Complaints
          </h2>
          <ComplaintTable
            complaints={emergencies}
            editId={editId}
            editForm={editForm}
            setEditId={setEditId}
            setEditForm={setEditForm}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            onViewDetails={handleViewDetails}
            highlight
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">All Complaints</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <ComplaintTable
            complaints={regular}
            editId={editId}
            editForm={editForm}
            setEditId={setEditId}
            setEditForm={setEditForm}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      <ComplaintDetailsModal 
        complaint={selectedComplaint} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function ComplaintTable({
  complaints,
  editId,
  editForm,
  setEditId,
  setEditForm,
  handleUpdate,
  handleDelete,
  highlight,
  onViewDetails,
}) {
  return (
    <div className={`overflow-x-auto rounded-2xl border ${highlight ? "border-red-200" : "border-slate-200"} bg-white shadow-sm`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Priority</th>
            <th className="px-4 py-3 font-semibold">Supports</th>
            <th className="px-4 py-3 font-semibold">Department</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
              <td 
                onClick={() => onViewDetails && onViewDetails(c)} 
                className="px-4 py-3 font-mono text-xs cursor-pointer text-blue-600 hover:underline font-bold"
              >
                {c.complaintId}
              </td>
              <td 
                onClick={() => onViewDetails && onViewDetails(c)} 
                className="px-4 py-3 cursor-pointer hover:text-blue-600"
              >
                <p className="font-medium">{c.title}</p>
                {c.isEmergency && (
                  <span className="text-xs font-bold text-red-600">EMERGENCY</span>
                )}
              </td>
              <td className="px-4 py-3">{c.category}</td>
              <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              <td className="px-4 py-3">{c.effectivePriority || c.priority}</td>
              <td className="px-4 py-3">{c.supportCount}</td>
              <td className="px-4 py-3">{c.department || "-"}</td>
              <td className="px-4 py-3">
                {editId === c._id ? (
                  <div className="space-y-2">
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded border px-2 py-1 text-xs"
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full rounded border px-2 py-1 text-xs"
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdate(c._id)}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded bg-slate-200 px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditId(c._id);
                        setEditForm({
                          status: c.status,
                          department: c.department || "",
                          note: "",
                        });
                      }}
                      className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {complaints.length === 0 && (
        <p className="p-8 text-center text-slate-500">No complaints found.</p>
      )}
    </div>
  );
}
