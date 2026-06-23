import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function SubmitFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    API.get(`/api/complaints/${id}`)
      .then(({ data }) => setComplaint(data.data))
      .catch(() => setError('Complaint not found.'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please select a rating.');
    setLoading(true);
    setError('');
    try {
      await API.post('/api/feedback', { complaintId: id, rating, comment });
      navigate('/my-complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Rate Resolution</h1>
        {complaint && (
          <p className="mt-1 text-sm text-slate-500">
            Feedback for: <strong>{complaint.title}</strong> ({complaint.complaintId})
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Your Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className={`text-4xl transition ${
                    star <= (hovered || rating) ? 'scale-110' : 'opacity-30'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                {['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][rating]}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Share your experience with the resolution..."
            />
          </div>
          <button
            type="submit"
            disabled={loading || !rating}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
