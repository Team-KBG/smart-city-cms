import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// ── Proposal type metadata ────────────────────────────────────────────────────
const VOTE_TYPE_META = {
  "New Park":                 { icon: "🌳", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  "More Street Lights":       { icon: "💡", color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  "Speed Breakers":           { icon: "🛑", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
  "Road Repair":              { icon: "🛣️", color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
  "Public Toilet":            { icon: "🚻", color: "#0891b2", bg: "#cffafe", border: "#67e8f9" },
  "Garbage Bin Installation": { icon: "🗑️", color: "#4d7c0f", bg: "#ecfccb", border: "#a3e635" },
  "Tree Plantation":          { icon: "🌱", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
  "CCTV Camera":              { icon: "📹", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  "Bus Shelter":              { icon: "🚌", color: "#9333ea", bg: "#f3e8ff", border: "#d8b4fe" },
  "Other":                    { icon: "🏙️", color: "#475569", bg: "#f1f5f9", border: "#e2e8f0" },
};

// ── Proposal status config ────────────────────────────────────────────────────
const STATUS_META = {
  "Active":      { bg: "#dcfce7", color: "#15803d", border: "#86efac",  icon: "🟢" },
  "In Progress": { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd",  icon: "🔵" },
  "Approved":    { bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd",  icon: "✅" },
  "Rejected":    { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5",  icon: "❌" },
  "Completed":   { bg: "#f0fdf4", color: "#065f46", border: "#6ee7b7",  icon: "🏁" },
};

const PROPOSAL_STATUSES = ["Active", "In Progress", "Approved", "Rejected", "Completed"];

function getMeta(type) {
  return VOTE_TYPE_META[type] || { icon: "🗳️", color: "#2563eb", bg: "#dbeafe", border: "#93c5fd" };
}

// ── Citizen: Browse & Vote Tab ────────────────────────────────────────────────
function BrowseTab({ votes, loading, onVote, votingId, onRefresh, isAdmin }) {
  const [typeFilter, setTypeFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const presentTypes = [...new Set(votes.map((v) => v.voteType))].sort();

  const displayed = votes
    .filter((v) => typeFilter === "all"   || v.voteType === typeFilter)
    .filter((v) => statusFilter === "all" || v.status   === statusFilter)
    .filter((v) =>
      !searchQuery ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.voteCount - a.voteCount);

  const maxVotes = Math.max(...votes.map((v) => v.voteCount || 0), 1);

  return (
    <div className="animate-fade-in">
      {/* Search + refresh */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <input
          placeholder="🔍 Search by location or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, fontSize: "13px" }}
        />
        <button onClick={onRefresh} className="btn btn-secondary btn-sm" title="Refresh">
          🔄
        </button>
      </div>

      {/* Type filter chips */}
      {presentTypes.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", flexShrink: 0 }}>Type:</span>
          <button
            onClick={() => setTypeFilter("all")}
            className={`btn btn-sm ${typeFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          >All</button>
          {presentTypes.map((t) => {
            const m = getMeta(t);
            return (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
                className="btn btn-sm"
                style={{
                  background: typeFilter === t ? m.bg : "var(--bg-surface-alt)",
                  color: typeFilter === t ? m.color : "var(--text-secondary)",
                  border: `1.5px solid ${typeFilter === t ? m.border : "var(--border-color)"}`,
                  fontSize: "11px",
                }}
              >
                {m.icon} {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Status filter chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", flexShrink: 0 }}>Status:</span>
        {["all", ...PROPOSAL_STATUSES].map((s) => {
          const sm = s !== "all" ? STATUS_META[s] : null;
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${!sm && active ? "btn-primary" : ""}`}
              style={sm ? {
                background: active ? sm.bg : "var(--bg-surface-alt)",
                color: active ? sm.color : "var(--text-secondary)",
                border: `1.5px solid ${active ? sm.border : "var(--border-color)"}`,
                fontSize: "11px",
              } : {}}
            >
              {sm ? `${sm.icon} ${s}` : "All Statuses"}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "12px" }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{votes.length === 0 ? "🗳️" : "🔍"}</div>
          <h3>{votes.length === 0 ? "No proposals yet" : "No matching proposals"}</h3>
          <p>{votes.length === 0
            ? "Be the first to propose a community improvement!"
            : "Try clearing your filters."}
          </p>
          {(typeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setSearchQuery(""); }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "12px" }}
            >Clear Filters</button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayed.map((vote, i) => {
            const meta       = getMeta(vote.voteType);
            const statusMeta = STATUS_META[vote.status] || STATUS_META["Active"];
            const barWidth   = Math.max(6, Math.round((vote.voteCount / maxVotes) * 100));
            const isVoting   = votingId === vote._id;
            const medals     = ["🥇", "🥈", "🥉"];
            const canVote    = !vote.hasVoted && !isAdmin &&
                               vote.status !== "Rejected" && vote.status !== "Completed";

            return (
              <div key={vote._id} className="card"
                style={{ padding: "16px 20px", position: "relative", overflow: "hidden" }}
              >
                {/* Progress fill */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${barWidth}%`,
                  background: meta.bg, opacity: 0.35,
                  transition: "width 0.6s ease", pointerEvents: "none",
                }} />

                <div style={{ position: "relative", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {/* Rank */}
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < 3 ? meta.bg : "var(--bg-surface-alt)",
                    border: `1.5px solid ${i < 3 ? meta.border : "var(--border-color)"}`,
                    fontSize: i < 3 ? "15px" : "11px",
                    fontWeight: "700",
                    color: i < 3 ? meta.color : "var(--text-muted)",
                    marginTop: "3px",
                  }}>
                    {i < 3 ? medals[i] : i + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Type + Status badges */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "5px", alignItems: "center" }}>
                      <span style={{
                        padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                      }}>
                        {meta.icon} {vote.voteType}
                      </span>
                      <span style={{
                        padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}`,
                      }}>
                        {statusMeta.icon} {vote.status}
                      </span>
                    </div>

                    {/* Location — primary title */}
                    <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px", marginBottom: "3px" }}>
                      📍 {vote.location}
                    </p>

                    {/* Description */}
                    {vote.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "4px" }}>
                        {vote.description}
                      </p>
                    )}

                    {/* Admin note */}
                    {vote.adminNote && (
                      <p style={{
                        fontSize: "11px", color: "#7c3aed", fontStyle: "italic",
                        background: "#ede9fe", padding: "3px 8px", borderRadius: "6px",
                        display: "inline-block", marginTop: "2px",
                      }}>
                        🏛️ Admin: {vote.adminNote}
                      </p>
                    )}

                    {/* Proposer */}
                    {vote.createdBy?.name && (
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                        Proposed by {vote.createdBy.name}
                      </p>
                    )}
                  </div>

                  {/* Vote count + button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, minWidth: "76px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "26px", fontWeight: "800", color: meta.color, lineHeight: 1 }}>
                        {vote.voteCount}
                      </p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
                        {vote.voteCount === 1 ? "vote" : "votes"}
                      </p>
                    </div>

                    {/* Vote button — hidden for admin */}
                    {!isAdmin && (
                      <button
                        onClick={() => canVote && onVote(vote)}
                        disabled={isVoting || !canVote}
                        className="btn btn-sm"
                        title={
                          vote.hasVoted ? "Already voted" :
                          vote.status === "Rejected" ? "Proposal rejected" :
                          vote.status === "Completed" ? "Proposal completed" :
                          "Cast your vote"
                        }
                        style={{
                          background: vote.hasVoted ? "var(--bg-surface-alt)" : meta.color,
                          color: vote.hasVoted ? "var(--text-muted)" : "white",
                          border: "none",
                          cursor: canVote ? "pointer" : "default",
                          opacity: isVoting ? 0.7 : 1,
                          width: "100%",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        {isVoting
                          ? <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "2px", borderTopColor: "white" }} />
                          : vote.hasVoted ? "✓ Voted"
                          : (vote.status === "Rejected" || vote.status === "Completed") ? "Closed"
                          : "👍 Vote"}
                      </button>
                    )}

                    {isAdmin && (
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
                        Manage in Admin tab
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayed.length > 0 && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "14px" }}>
          Showing {displayed.length} of {votes.length} proposals
        </p>
      )}
    </div>
  );
}

// ── Citizen: Propose Tab ──────────────────────────────────────────────────────
function ProposeTab({ user, onProposed }) {
  const toast = useToast();
  const [form, setForm] = useState({
    voteType: Object.keys(VOTE_TYPE_META)[0],
    location: "",
    description: "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    const location = form.location.trim();
    if (!location || location.length < 5) {
      setError("Location must be at least 5 characters. Be specific (e.g. Near Gate 2, Sector 62).");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/api/votes", {
        voteType: form.voteType,
        location,
        description: form.description.trim(),
      });

      setSuccess("Proposal submitted! Redirecting to Browse...");
      setForm({ voteType: Object.keys(VOTE_TYPE_META)[0], location: "", description: "" });
      toast.success(data.message || "Proposal created!");
      setTimeout(() => { setSuccess(""); onProposed(); }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="alert alert-info" style={{ marginBottom: "20px" }}>
        <span>👤</span>
        <span>Proposing as: <strong>{user?.name}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="form-section"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
            ✨ Propose a Community Improvement
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Choose a type, enter the exact location, and optionally explain why. Your proposal is instantly your first vote.
          </p>
        </div>

        {error   && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="alert alert-success"><span>✅</span><span>{success}</span></div>}

        {/* Type selector grid */}
        <div className="form-group">
          <label>Improvement Type *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: "8px" }}>
            {Object.entries(VOTE_TYPE_META).map(([type, meta]) => {
              const sel = form.voteType === type;
              return (
                <label key={type} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                  border: `1.5px solid ${sel ? meta.color : "var(--border-color)"}`,
                  background: sel ? meta.bg : "var(--bg-surface-alt)",
                  fontSize: "12px", fontWeight: "600",
                  color: sel ? meta.color : "var(--text-secondary)",
                  transition: "all 0.18s ease",
                }}>
                  <input type="radio" name="voteType" value={type}
                    checked={sel}
                    onChange={() => setForm({ ...form, voteType: type })}
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: "16px" }}>{meta.icon}</span>
                  {type}
                </label>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="prop-location">
            Exact Location *
            <span style={{ fontSize: "11px", fontWeight: "400", color: "var(--text-muted)", marginLeft: "6px" }}>
              (Be specific — others will vote based on this)
            </span>
          </label>
          <input
            id="prop-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required maxLength={200}
            placeholder="e.g. Near Main Gate, Sector 62 Market, Noida — opposite Metro Station"
          />
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            {form.location.length}/200
          </p>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="prop-desc">
            Why is this needed?
            <span style={{ fontSize: "11px", fontWeight: "400", color: "var(--text-muted)", marginLeft: "6px" }}>
              (Optional — increases support)
            </span>
          </label>
          <textarea
            id="prop-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} maxLength={500}
            placeholder="e.g. This stretch has no lights, making it dangerous after dark..."
          />
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            {form.description.length}/500
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
          {loading
            ? <><span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Submitting...</>
            : "✨ Submit Proposal & Cast My Vote"}
        </button>

        {/* How it works */}
        <div style={{
          background: "var(--bg-surface-alt)", borderRadius: "10px",
          padding: "12px 14px", fontSize: "12px", color: "var(--text-secondary)",
        }}>
          <p style={{ fontWeight: "700", marginBottom: "6px" }}>💡 How it works:</p>
          <p>1. Your proposal becomes visible immediately to all citizens.</p>
          <p>2. Others browse and vote for proposals they support.</p>
          <p>3. City authority reviews top-voted proposals monthly.</p>
          <p>4. You can only vote once per proposal.</p>
        </div>
      </form>
    </div>
  );
}

// ── Admin: Manage Proposals Tab ───────────────────────────────────────────────
function AdminManageTab({ votes, loading, onRefresh, onStatusUpdate, onDelete }) {
  const [updating, setUpdating] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const presentTypes = [...new Set(votes.map((v) => v.voteType))].sort();

  const displayed = votes
    .filter((v) => typeFilter === "all"   || v.voteType === typeFilter)
    .filter((v) => statusFilter === "all" || v.status   === statusFilter)
    .sort((a, b) => b.voteCount - a.voteCount);

  const handleUpdate = async (vote) => {
    const newStatus = statusInputs[vote._id] || vote.status;
    const newNote   = noteInputs[vote._id] !== undefined ? noteInputs[vote._id] : vote.adminNote;
    setUpdating(vote._id);
    await onStatusUpdate(vote._id, newStatus, newNote);
    setUpdating(null);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
          Manage Community Proposals
          <span style={{ marginLeft: "8px", background: "var(--bg-surface-alt)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "20px", fontSize: "12px", border: "1px solid var(--border-color)" }}>
            {votes.length}
          </span>
        </h3>
        <button onClick={onRefresh} className="btn btn-secondary btn-sm">🔄 Refresh</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Type:</span>
        <button onClick={() => setTypeFilter("all")} className={`btn btn-sm ${typeFilter === "all" ? "btn-primary" : "btn-secondary"}`}>All</button>
        {presentTypes.map((t) => (
          <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
            className={`btn btn-sm ${typeFilter === t ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "11px" }}
          >{getMeta(t).icon} {t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Status:</span>
        {["all", ...PROPOSAL_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "11px" }}
          >{s === "all" ? "All" : `${STATUS_META[s]?.icon} ${s}`}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "12px" }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No proposals</h3>
          <p>Citizens haven't submitted any proposals yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayed.map((vote) => {
            const meta       = getMeta(vote.voteType);
            const statusMeta = STATUS_META[vote.status] || STATUS_META["Active"];
            const isUpdating = updating === vote._id;

            return (
              <div key={vote._id} className="card" style={{ padding: "16px 20px" }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                        {meta.icon} {vote.voteType}
                      </span>
                      <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}>
                        {statusMeta.icon} {vote.status}
                      </span>
                      <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: "var(--bg-surface-alt)", color: "var(--primary-600)", border: "1px solid var(--border-color)" }}>
                        👍 {vote.voteCount} vote{vote.voteCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>
                      📍 {vote.location}
                    </p>
                    {vote.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{vote.description}</p>
                    )}
                    {vote.createdBy?.name && (
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                        Proposed by {vote.createdBy.name} · {new Date(vote.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(vote._id, vote.location)}
                    className="btn btn-danger btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    🗑️
                  </button>
                </div>

                {/* Admin actions */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div className="form-group" style={{ margin: 0, flex: 1, minWidth: "160px" }}>
                    <label style={{ marginBottom: "4px" }}>Change Status</label>
                    <select
                      value={statusInputs[vote._id] ?? vote.status}
                      onChange={(e) => setStatusInputs({ ...statusInputs, [vote._id]: e.target.value })}
                      style={{ fontSize: "13px" }}
                    >
                      {PROPOSAL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s]?.icon} {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0, flex: 2, minWidth: "200px" }}>
                    <label style={{ marginBottom: "4px" }}>Admin Note (visible to citizens)</label>
                    <input
                      value={noteInputs[vote._id] ?? (vote.adminNote || "")}
                      onChange={(e) => setNoteInputs({ ...noteInputs, [vote._id]: e.target.value })}
                      placeholder="e.g. Work scheduled for July 2025"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                  <button
                    onClick={() => handleUpdate(vote)}
                    disabled={isUpdating}
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0, marginBottom: "0" }}
                  >
                    {isUpdating ? "Saving..." : "💾 Save"}
                  </button>
                </div>

                {vote.adminNote && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#6d28d9", background: "#ede9fe", padding: "4px 10px", borderRadius: "6px" }}>
                    🏛️ Current note: {vote.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PublicVoting() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [votes, setVotes]           = useState([]);
  const [loadingVotes, setLoading]  = useState(true);
  const [votingId, setVotingId]     = useState(null);
  const [activeTab, setActiveTab]   = useState("browse");

  // ── Fetch all proposals ───────────────────────────────────────
  const fetchVotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/votes");
      setVotes(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const msg = err.response?.status === 401
        ? "Please log in to view community proposals."
        : "Failed to load proposals.";
      toast.error(msg);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  // ── Cast vote by proposal ID ──────────────────────────────────
  const handleVote = async (vote) => {
    if (vote.hasVoted) { toast.info("You've already voted for this."); return; }

    setVotingId(vote._id);
    try {
      const { data } = await API.post(`/api/votes/${vote._id}/vote`);
      toast.success(data.message || "Vote cast! 👍");

      // Optimistic update
      setVotes((prev) =>
        prev.map((v) =>
          v._id === vote._id ? { ...v, voteCount: v.voteCount + 1, hasVoted: true } : v
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to vote.");
    } finally {
      setVotingId(null);
    }
  };

  // ── Admin: update status ──────────────────────────────────────
  const handleStatusUpdate = async (id, status, adminNote) => {
    try {
      await API.patch(`/api/votes/${id}/status`, { status, adminNote });
      toast.success(`Proposal marked as ${status}`);
      await fetchVotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  // ── Admin: delete proposal ────────────────────────────────────
  const handleDelete = async (id, location) => {
    if (!window.confirm(`Delete proposal "${location}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/api/votes/${id}`);
      toast.success("Proposal deleted.");
      setVotes((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      toast.error("Failed to delete proposal.");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────
  const totalVotes     = votes.reduce((s, v) => s + (v.voteCount || 0), 0);
  const myVotesCount   = votes.filter((v) => v.hasVoted).length;
  const activeProposals = votes.filter((v) => v.status === "Active").length;

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = isAdmin ? [
    { key: "browse",  label: "🗳️ Browse Proposals" },
    { key: "manage",  label: "⚙️ Manage (Admin)" },
  ] : [
    { key: "browse",  label: "🗳️ Browse & Vote" },
    { key: "propose", label: "✨ Propose Improvement" },
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
          🗳️ Community Improvement Proposals
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          {isAdmin
            ? "Review and manage citizen proposals. Update status as the city acts on them."
            : "Propose and vote for improvements in your city. Top proposals are reviewed monthly."}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginBottom: "24px" }}>
        {[
          { label: "Total Proposals", value: votes.length,   color: "#2563eb", icon: "📋" },
          { label: "Total Votes",     value: totalVotes,      color: "#7c3aed", icon: "🗳️" },
          { label: "Active",          value: activeProposals, color: "#16a34a", icon: "🟢" },
          ...(!isAdmin ? [{ label: "Your Votes", value: myVotesCount, color: "#d97706", icon: "✅" }] : []),
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: "20px", marginBottom: "2px" }}>{s.icon}</p>
            <p style={{ fontSize: "22px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", marginTop: "3px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: "24px" }}>
        {tabs.map((t) => (
          <button key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "browse" && (
        <BrowseTab
          votes={votes}
          loading={loadingVotes}
          onVote={handleVote}
          votingId={votingId}
          onRefresh={fetchVotes}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === "propose" && !isAdmin && (
        <ProposeTab
          user={user}
          onProposed={() => { fetchVotes(); setActiveTab("browse"); }}
        />
      )}

      {activeTab === "manage" && isAdmin && (
        <AdminManageTab
          votes={votes}
          loading={loadingVotes}
          onRefresh={fetchVotes}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}