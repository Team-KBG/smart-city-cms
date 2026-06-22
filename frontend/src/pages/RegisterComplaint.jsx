import { useState, useEffect } from "react";
import API from "../api/axios";
import { ALL_CATEGORIES } from "../utils/constants";
import StatusBadge from "../components/StatusBadge";

export default function RegisterComplaint() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    citizenName: "",
    citizenEmail: "",
  });
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [aiPreview, setAiPreview] = useState(null);
  const [nearby, setNearby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.title.length > 5 || form.description.length > 10) {
        try {
          const { data } = await API.post("/api/complaints/categorize/preview", {
            title: form.title,
            description: form.description,
          });
          setAiPreview(data.data);
        } catch {
          setAiPreview(null);
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  const checkNearby = async (category) => {
    if (!location.latitude || !category) return null;
    try {
      const { data } = await API.get("/api/complaints/nearby/check", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          category,
        },
      });
      setNearby(data);
      return data;
    } catch {
      setNearby(null);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category") checkNearby(value);
  };

  const submitComplaint = async (supportExistingId = null) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (location.latitude) formData.append("latitude", location.latitude);
      if (location.longitude) formData.append("longitude", location.longitude);
      if (image) formData.append("image", image);
      if (supportExistingId) formData.append("supportExistingId", supportExistingId);

      const { data } = await API.post("/api/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data.data);
      setNearby(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = form.category || aiPreview?.category;

    if (category && location.latitude) {
      const nearbyResult = await checkNearby(category);
      if (nearbyResult?.hasSimilar) {
        return;
      }
    }

    await submitComplaint();
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-5xl">✅</div>
        <h2 className="mt-4 text-2xl font-bold text-green-800">Complaint Registered!</h2>
        <p className="mt-2 text-green-700">
          Your Complaint ID: <strong className="text-lg">{result.complaintId}</strong>
        </p>
        <div className="mt-4 space-y-1 text-sm text-green-700">
          <p>Category: {result.category}</p>
          <p>Department: {result.department}</p>
          <p>Priority: {result.priority}</p>
          <StatusBadge status={result.status} />
        </div>
        <button
          onClick={() => {
            setResult(null);
            setForm({ title: "", description: "", category: "", address: "", citizenName: "", citizenEmail: "" });
            setImage(null);
          }}
          className="mt-6 rounded-xl bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Register Another
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Register Complaint</h1>
      <p className="mt-2 text-slate-500">Report a civic issue with location and photo proof.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your Name</label>
            <input
              name="citizenName"
              value={form.citizenName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email (for notifications)</label>
            <input
              name="citizenEmail"
              type="email"
              value={form.citizenEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@email.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Brief title of the issue"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Describe the issue in detail..."
          />
        </div>

        {aiPreview && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">🤖 AI Suggestion</p>
            <p className="mt-1 text-sm text-blue-700">
              Category: <strong>{aiPreview.category}</strong> → Department:{" "}
              <strong>{aiPreview.department}</strong> | Priority:{" "}
              <strong>{aiPreview.priority}</strong>
              {aiPreview.isEmergency && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  EMERGENCY
                </span>
              )}
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Auto-detect from description</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location / Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Sector 62, Noida"
          />
          {location.latitude && (
            <p className="mt-1 text-xs text-green-600">
              📍 GPS captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Image Proof</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {nearby?.hasSimilar && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="font-semibold text-amber-800">
              ⚠️ Similar complaint already registered nearby!
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Do you want to support the existing complaint instead?
            </p>
            <div className="mt-3 space-y-2">
              {nearby.data.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-slate-500">
                      {c.complaintId} • {c.supportCount} supports
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => submitComplaint(c._id)}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Support
                  </button>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-3 text-sm font-medium text-amber-800 underline"
            >
              Register as new complaint anyway
            </button>
          </div>
        )}

        {!nearby?.hasSimilar && (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        )}
      </form>
    </div>
  );
}
