import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LEVEL_CONFIG = {
  "Gold Citizen": { icon: "🥇", bg: "#fef9c3", color: "#713f12", border: "#fde047" },
  "Silver Citizen": { icon: "🥈", bg: "#f1f5f9", color: "#334155", border: "#94a3b8" },
  "Bronze Citizen": { icon: "🥉", bg: "#fef3c7", color: "#78350f", border: "#fbbf24" },
};

function getLevelConfig(level) {
  return LEVEL_CONFIG[level] || { icon: "⭐", bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

export default function Leaderboard() {
  const { user, isLoggedIn } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaderRes] = await Promise.all([
        API.get("/api/citizens/leaderboard"),
      ]);
      setLeaders(leaderRes.data.data || []);

      // Fetch own profile if logged in
      if (isLoggedIn) {
        try {
          const profileRes = await API.get("/api/citizens/me/profile");
          setMyProfile(profileRes.data.data);
        } catch {
          setMyProfile(null);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const myRank = myProfile
    ? leaders.findIndex((l) => l.email === user?.email) + 1
    : -1;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-header">
        <h1 style={{ fontSize: "26px" }}>🏆 Citizen Leaderboard</h1>
        <p>
          Citizens earn points for reporting issues, supporting complaints, and community participation.
        </p>
      </div>

      {/* Point system explainer */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "14px" }}>
          🎯 How to Earn Points
        </h3>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {[
            { icon: "📝", label: "Submit a complaint", pts: "+10 pts" },
            { icon: "✅", label: "Complaint resolved", pts: "+25 pts" },
            { icon: "👍", label: "Support others", pts: "+5 pts" },
            { icon: "🔄", label: "Report follow-up", pts: "+15 pts" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a" }}>{item.pts}</span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>{item.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
            <div
              key={level}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              <span>{cfg.icon}</span>
              {level}
            </div>
          ))}
          <p style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>
            Bronze (0–99) → Silver (100–249) → Gold (250+)
          </p>
        </div>
      </div>

      {/* My profile (if logged in) */}
      {isLoggedIn && myProfile && (
        <div className="card" style={{ marginBottom: "24px", border: "2px solid var(--primary-300)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "var(--primary-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "800",
                color: "var(--primary-600)",
                flexShrink: 0,
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                  {user?.name} <span style={{ fontSize: "11px", color: "var(--primary-600)", fontWeight: "600" }}>(You)</span>
                </p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "3px" }}>
                  {(() => {
                    const cfg = getLevelConfig(myProfile.level);
                    return (
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px",
                        background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        fontSize: "11px", fontWeight: "700",
                      }}>
                        {cfg.icon} {myProfile.level}
                      </span>
                    );
                  })()}
                  {myRank > 0 && (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Rank #{myRank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Points", value: myProfile.points, color: "#2563eb" },
                { label: "Submitted", value: myProfile.complaintsSubmitted },
                { label: "Resolved", value: myProfile.complaintsResolved },
                { label: "Supported", value: myProfile.upvotesGiven },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: color || "var(--text-primary)", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
            Top Citizens
          </h3>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "8px" }} />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No citizens yet</h3>
            <p>Be the first to earn reputation points by reporting issues!</p>
          </div>
        ) : (
          <div>
            {leaders.map((citizen, i) => {
              const cfg = getLevelConfig(citizen.level);
              const isMe = citizen.email === user?.email;
              return (
                <div
                  key={citizen._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 24px",
                    borderBottom: i < leaders.length - 1 ? "1px solid var(--border-color)" : "none",
                    background: isMe ? "var(--primary-50)" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: i < 3 ? [
                      "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      "linear-gradient(135deg, #9ca3af, #6b7280)",
                      "linear-gradient(135deg, #d97706, #b45309)",
                    ][i] : "var(--bg-surface-alt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: i < 3 ? "16px" : "12px",
                    fontWeight: "700",
                    color: i < 3 ? "white" : "var(--text-muted)",
                    flexShrink: 0,
                  }}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: `hsl(${(citizen.name?.charCodeAt(0) || 65) * 13 % 360}, 60%, 70%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "white",
                    flexShrink: 0,
                  }}>
                    {(citizen.name || "?")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <p style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-primary)" }}>
                        {citizen.name || "Anonymous"}
                      </p>
                      {isMe && (
                        <span style={{ fontSize: "10px", background: "var(--primary-600)", color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>
                          You
                        </span>
                      )}
                    </div>
                    <span style={{
                      padding: "1px 8px", borderRadius: "20px",
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      fontSize: "10px", fontWeight: "700",
                    }}>
                      {cfg.icon} {citizen.level}
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "16px", flexShrink: 0, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb", lineHeight: 1 }}>{citizen.points}</p>
                      <p style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>pts</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", lineHeight: 1 }}>{citizen.complaintsSubmitted}</p>
                      <p style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>reports</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
