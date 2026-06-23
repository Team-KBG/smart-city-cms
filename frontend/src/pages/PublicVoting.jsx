import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PUBLIC_VOTE_TYPES } from "../utils/constants";

const TYPE_ICONS = {
  "New Park": "🌳",
  "More Street Lights": "💡",
  "Speed Breakers": "🛑",
};

const TYPE_COLORS = {
  "New Park": { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  "More Street Lights": { color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  "Speed Breakers": { color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
};

export default function PublicVoting() {
  const { user } = useAuth();
  const toast = useToast();

  const [votes, setVotes] = useState([]);
  const [form, setForm] = useState({
    voteType: PUBLIC_VOTE_TYPES[0],
    location: "",
    description: "",
  });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [votingId, setVotingId] = useState(null); // ID of vote being processed
  const [activeTab, setActiveTab] = useState("browse"); // 'browse' | 'propose'

  const fetchVotes = async () => {
    try {
      const { data } = await API.get("/api/votes/top");
      setVotes(data.data.all || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVotes(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const { data } = await API.post("/api/votes", form);
      setMsg({ text: data.message || "Vote submitted!", type: "success" });
      toast.success(data.message || "Vote submitted!");
      setForm({ voteType: PUBLIC_VOTE_TYPES[0], location: "", description: "" });
      await fetchVotes();
      setActiveTab("browse");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to submit vote";
      setMsg({ text: errMsg, type: "error" });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVote = async (vote) => {
    if (vote.hasVoted) {
      toast.info("You have already voted for this proposal");
      return;
    }
    setVotingId(vote._id);
    try {
      const { data } = await API.post("/api/votes", {
        voteType: vote.voteType,
        location: vote.location,
      });
      toast.success(data.message || "Vote added!");
      await fetchVotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to vote");
    } finally {
      setVotingId(null);
    }
  };

  // Group votes by type
  const votesByType = PUBLIC_VOTE_TYPES.reduce((acc, type) => {
    acc[type] = votes.filter((v) => v.voteType === type).slice(0, 5);
    return acc;
  }, {});

  const totalVotes = votes.reduce((sum, v) => sum + v.voteCount, 0);
  const maxVotes = Math.max(...votes.map((v) => v.voteCount), 1);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
            Public Issue Voting
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Vote for community improvements. Top requests are reviewed by city authorities.
          </p>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="card" style={{ padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary-600)" }}>{totalVotes}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Total Votes</p>
          </div>
          <div className="card" style={{ padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>{votes.length}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Proposals</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("browse")}
          className={`tab-btn ${activeTab === "browse" ? "active" : ""}`}
        >
          🗳️ Browse & Vote
        </button>
        <button
          onClick={() => setActiveTab("propose")}
          className={`tab-btn ${activeTab === "propose" ? "active" : ""}`}
        >
          ✨ Propose Improvement
        </button>
      </div>

      {/* Browse & Vote Tab */}
      {activeTab === "browse" && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {loadingVotes ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "12px" }} />
              ))}
            </div>
          ) : votes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗳️</div>
              <h3>No proposals yet</h3>
              <p>Be the first to propose a community improvement!</p>
              <button
                onClick={() => setActiveTab("propose")}
                className="btn btn-primary"
                style={{ marginTop: "16px" }}
              >
                ✨ Create First Proposal
              </button>
            </div>
          ) : (
            PUBLIC_VOTE_TYPES.map((type) => {
              const typeVotes = votesByType[type];
              if (typeVotes.length === 0) return null;
              const scheme = TYPE_COLORS[type] || { color: "#2563eb", bg: "#dbeafe", border: "#93c5fd" };

              return (
                <div key={type}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: scheme.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "17px",
                    }}>
                      {TYPE_ICONS[type] || "🗳️"}
                    </div>
                    <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{type}</h2>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "20px",
                      background: scheme.bg,
                      color: scheme.color,
                      fontSize: "11px",
                      fontWeight: "700",
                      border: `1px solid ${scheme.border}`,
                    }}>
                      {typeVotes.length} proposals
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {typeVotes.map((vote, i) => {
                      const barWidth = Math.round((vote.voteCount / maxVotes) * 100);
                      const isVoting = votingId === vote._id;

                      return (
                        <div
                          key={vote._id}
                          className="card"
                          style={{ padding: "14px 18px", position: "relative", overflow: "hidden" }}
                        >
                          {/* Background progress bar */}
                          <div style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${barWidth}%`,
                            background: `${scheme.bg}`,
                            opacity: 0.5,
                            transition: "width 0.4s ease",
                          }} />

                          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                              <span style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: i < 3 ? scheme.bg : "var(--bg-surface-alt)",
                                color: i < 3 ? scheme.color : "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "800",
                                flexShrink: 0,
                                border: `1px solid ${i < 3 ? scheme.border : "var(--border-color)"}`,
                              }}>
                                {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13px", marginBottom: "1px" }}>
                                  {vote.location}
                                </p>
                                {vote.description && (
                                  <p style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {vote.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                              <span style={{
                                fontWeight: "800",
                                fontSize: "14px",
                                color: scheme.color,
                              }}>
                                {vote.voteCount}
                              </span>
                              <button
                                onClick={() => handleQuickVote(vote)}
                                disabled={isVoting || vote.hasVoted}
                                className="btn btn-sm"
                                style={{
                                  background: vote.hasVoted ? "var(--bg-surface-alt)" : scheme.bg,
                                  color: vote.hasVoted ? "var(--text-muted)" : scheme.color,
                                  border: `1px solid ${vote.hasVoted ? "var(--border-color)" : scheme.border}`,
                                  cursor: vote.hasVoted ? "not-allowed" : "pointer",
                                }}
                              >
                                {isVoting ? (
                                  <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
                                ) : vote.hasVoted ? "✓ Voted" : "👍 Vote"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Propose Tab */}
      {activeTab === "propose" && (
        <div className="animate-fade-in">
          <div className="alert alert-info" style={{ marginBottom: "20px" }}>
            <span>👤</span>
            <span>Proposing as: <strong>{user?.name}</strong></span>
          </div>

          <form onSubmit={handleSubmit} className="form-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label>Improvement Type *</label>
              <select
                value={form.voteType}
                onChange={(e) => setForm({ ...form, voteType: e.target.value })}
              >
                {PUBLIC_VOTE_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                placeholder="e.g. Sector 62, near metro station"
              />
            </div>

            <div className="form-group">
              <label>Why is this needed? (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe why this improvement would benefit the community..."
              />
            </div>

            {msg.text && (
              <div className={`alert alert-${msg.type}`}>
                <span>{msg.type === "success" ? "✅" : "⚠️"}</span>
                <span>{msg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? (
                <><span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Submitting...</>
              ) : "✨ Submit Proposal"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}