import { useEffect, useState } from "react";
import API from "../api/axios";
import { PUBLIC_VOTE_TYPES } from "../utils/constants";

export default function PublicVoting() {
  const [votes, setVotes] = useState([]);
  const [form, setForm] = useState({
    voteType: PUBLIC_VOTE_TYPES[0],
    location: "",
    description: "",
  });

  const [msg, setMsg] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      await API.post("/api/votes", form);

      setMsg("Vote submitted successfully!");

      setForm({
        voteType: PUBLIC_VOTE_TYPES[0],
        location: "",
        description: "",
      });

      fetchVotes();
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        "Failed to submit vote"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVote = async (vote) => {
    try {
      await API.post("/api/votes", {
        voteType: vote.voteType,
        location: vote.location,
      });

      setMsg("Vote added successfully!");
      fetchVotes();
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        "You have already voted for this proposal"
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">
        Public Issue Voting
      </h1>

      <p className="mt-2 text-slate-500">
        Vote for community improvements. Admins can
        view top requested changes.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Improvement Type
            </label>

            <select
              value={form.voteType}
              onChange={(e) =>
                setForm({
                  ...form,
                  voteType: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            >
              {PUBLIC_VOTE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Location *
          </label>

          <input
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            placeholder="Sector 62, near metro station"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            placeholder="Why is this needed?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Vote
        </button>

        {msg && (
          <p className="text-sm text-green-600">
            {msg}
          </p>
        )}
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">
          Top Requested Improvements
        </h2>

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
                  <p className="font-semibold text-slate-900">
                    {vote.voteType}
                  </p>

                  <p className="text-sm text-slate-500">
                    {vote.location}
                  </p>

                  {vote.description && (
                    <p className="text-xs text-slate-400">
                      {vote.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {vote.voteCount} votes
                </span>

                <button
                  type="button"
                  onClick={() => handleQuickVote(vote)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Vote
                </button>
              </div>
            </div>
          ))}

          {votes.length === 0 && (
            <p className="text-center text-slate-500">
              No votes yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}