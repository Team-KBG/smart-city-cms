import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { STATUS_VALUES } from '../utils/constants';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

export default function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filterStatus) params.status = filterStatus;
        const { data } = await API.get('/api/citizens/my-complaints', { params });
        setComplaints(data.data);
        setPagination({ total: data.total, pages: data.pages });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user, filterStatus, page, navigate]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
          <p className="mt-1 text-slate-500">Track all complaints you have registered</p>
        </div>
        <Link
          to="/register"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + New Complaint
        </Link>
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
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c._id}
              onClick={() => {
                setSelectedComplaint(c);
                setIsModalOpen(true);
              }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer hover:border-blue-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-mono text-xs text-slate-400">{c.complaintId}</p>
                  <h3 className="mt-1 font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{c.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {c.category} &bull; {c.department || 'Unassigned'} &bull;{' '}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={c.status} />
                  {c.isEmergency && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                      EMERGENCY
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{c.supportCount} supports</span>
                </div>
              </div>
              {c.status === 'Resolved' && !c.feedbackSubmitted && (
                <Link
                  to={`/feedback/${c._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-block rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  ⭐ Leave Feedback
                </Link>
              )}
            </div>
          ))}
          
          <ComplaintDetailsModal 
            complaint={selectedComplaint} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
          {complaints.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-4xl">📋</p>
              <p className="mt-4 text-slate-500">No complaints found.</p>
              <Link
                to="/register"
                className="mt-3 inline-block text-sm text-blue-600 underline"
              >
                Register your first complaint
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
}
