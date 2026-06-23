import { useEffect, useState } from "react";
import API from "../api/axios";
import { PUBLIC_VOTE_TYPES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

export default function PublicVoting() {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [form, setForm] = useState({
    voteType: PUBLIC_VOTE_TYPES[0],
    location: "",
    description: "",
    citizenEmail: "",
  });
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchVotes = async () => {
    try {
      const { data } = await API.get("/api/votes/top");
      setVotes(data.data.all);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, citizenEmail: user.email }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Please log in to vote on community improvements.");
      return;
    }

    if (!form.location || !form.location.trim()) {
      setErrorMsg("Location is required");
      return;
    }

    // Check if user has already voted for a proposal with the same voteType and location
    const alreadyVoted = votes.some(
      (v) =>
        v.voteType === form.voteType &&
        v.location.toLowerCase().trim() === form.location.toLowerCase().trim() &&
        (v.voters || []).includes(user.email)
    );

    if (alreadyVoted) {
      setErrorMsg("You have already voted for this improvement in this location.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/api/votes", {
        ...form,
        citizenEmail: user.email,
      });
      setMsg("Vote submitted successfully!");
      setForm({ ...form, location: "", description: "" });
      fetchVotes();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVote = async (vote) => {
    setMsg("");
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Please log in to vote.");
      return;
    }

    // Frontend duplicate check
    if (vote.voters && vote.voters.includes(user.email)) {
      setErrorMsg("You have already voted for this improvement.");
      return;
    }

    try {
      await API.post("/api/votes", {
        voteType: vote.voteType,
        location: vote.location,
        citizenEmail: user.email,
      });
      setMsg("Vote added!");
      fetchVotes();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Already voted");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 font-sans">Public Issue Voting</h1>
      <p className="mt-2 text-slate-500">
        Vote for community improvements. Admins can view top requested changes.
      </p>

      {!user && (
        <div className="mt-6 rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-800 text-sm">
          ⚠️ You must be logged in to propose or vote for improvements.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {errorMsg && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
        )}
        {msg && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">{msg}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Improvement Type</label>
            <select
              value={form.voteType}
              onChange={(e) => setForm({ ...form, voteType: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
              disabled={!user}
            >
              {PUBLIC_VOTE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Your Email</label>
            <input
              type="email"
              value={user?.email || "Not logged in"}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location *</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            disabled={!user}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            placeholder="Sector 62, near metro station"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            disabled={!user}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            placeholder="Why is this needed?"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !user}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Vote
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">Top Requested Improvements</h2>
        <div className="mt-4 space-y-3">
          {votes.map((vote, i) => (
            <div
              key={vote._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  #{i + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{vote.voteType}</p>
                  <p className="text-sm text-slate-500">{vote.location}</p>
                  {vote.description && (
                    <p className="text-xs text-slate-400">{vote.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {vote.voteCount} votes
                </span>
                <button
                  onClick={() => handleQuickVote(vote)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
          {votes.length === 0 && (
            <p className="text-center text-slate-500">No votes yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
