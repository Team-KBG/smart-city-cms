import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { STATUS_VALUES } from '../utils/constants';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', note: '' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const dept = user?.department;

  useEffect(() => {
    if (!user || (user.role !== 'department_staff' && user.role !== 'admin')) {
      navigate('/');
      return;
    }
    if (!dept) return;

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const encodedDept = encodeURIComponent(dept);
        const params = { page, limit: 50 };
        if (filterStatus) params.status = filterStatus;
        const { data } = await API.get(`/api/complaints/dept/${encodedDept}`, { params });
        setComplaints(data.data);
        setPagination({ total: data.total, pages: data.pages });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user, dept, filterStatus, page, navigate, refreshKey]);

  const handleUpdate = async (id) => {
    try {
      await API.put(`/api/complaints/${id}`, editForm);
      setEditId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (!dept) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-amber-700">
          No department assigned to your account. Contact the administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{dept}</h1>
        <p className="mt-1 text-slate-500">Complaints assigned to your department</p>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700">
          Total Complaints: <strong>{pagination.total}</strong>
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...STATUS_VALUES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              setFilterStatus(s);
              setPage(1);
            }}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Supports</th>
                <th className="px-4 py-3 font-semibold">Reported</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c._id}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    c.isEmergency ? 'bg-red-50' : ''
                  }`}
                >
                  <td 
                    onClick={() => handleViewDetails(c)} 
                    className="px-4 py-3 font-mono text-xs cursor-pointer text-blue-600 hover:underline font-bold"
                  >
                    {c.complaintId}
                  </td>
                  <td 
                    onClick={() => handleViewDetails(c)} 
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                  >
                    <p className="font-medium">{c.title}</p>
                    {c.isEmergency && (
                      <span className="text-xs font-bold text-red-600">EMERGENCY</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold ${
                        c.effectivePriority === 'Critical'
                          ? 'text-red-600'
                          : c.effectivePriority === 'High'
                          ? 'text-orange-600'
                          : c.effectivePriority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {c.effectivePriority || c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.supportCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
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
                        <input
                          type="text"
                          placeholder="Add status note..."
                          value={editForm.note}
                          onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          className="w-full rounded border px-2 py-1 text-xs"
                        />
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
                      <button
                        onClick={() => {
                          setEditId(c._id);
                          setEditForm({
                            status: c.status,
                            note: '',
                          });
                        }}
                        className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              No complaints found for your department.
            </p>
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <ComplaintDetailsModal 
        complaint={selectedComplaint} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
