import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// ─── Icon components (Lucide-style SVG, no emoji) ────────────────────────────

const IconClipboardPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1Z"/>
    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const IconSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconMap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const IconVote = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/>
    <path d="M22 19H2"/>
  </svg>
);

const IconRecycle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.777l7.5-12.94a2 2 0 0 1 3.51 0l2.432 4.195"/>
    <path d="M15.18 17.5l1.372 2.372a1.83 1.83 0 0 1-1.57 2.778H9.5"/><path d="m22 17-3 3-3-3"/>
    <path d="M19 14v6"/><path d="M10.5 20H7"/>
  </svg>
);

const IconGauge = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M22 12h1"/><path d="M1 12h1"/>
    <path d="M4.22 4.22l.71.71"/><path d="M18.36 5.64l.71-.71"/>
    <path d="M12 1v1"/><path d="M12 22v-9"/>
  </svg>
);

const IconBrain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
  </svg>
);

const IconSatellite = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 7 9 3 3 9l4 4"/><path d="m13 7 3 3-3.5 3.5"/>
    <path d="m14 14 1.5 1.5L21 9l-4-4-1.5 1.5"/>
    <path d="m5 15-2 6 6-2"/><path d="m14.5 10.5 5 5"/>
    <circle cx="8.5" cy="15.5" r="2.5"/>
  </svg>
);

const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
  </svg>
);

const IconActivity = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const primaryActions = [
  {
    title: "Report an issue",
    desc: "Submit civic complaints with photo evidence and automatic GPS tagging. AI categorizes and routes to the right department in seconds.",
    to: "/register",
    icon: <IconClipboardPlus />,
    cta: "Start report",
    accent: "#0F62FE",
    accentBg: "#EEF4FF",
  },
  {
    title: "Track your complaint",
    desc: "Check real-time status, department assignment, and resolution timeline using your complaint ID or registered phone number.",
    to: "/track",
    icon: <IconSearch />,
    cta: "Check status",
    accent: "#0A8A6A",
    accentBg: "#EEFAF6",
  },
];

const serviceFeatures = [
  {
    title: "Heat map",
    desc: "View complaint density and high-activity areas across the city.",
    to: "/heatmap",
    icon: <IconMap />,
  },
  {
    title: "Public voting",
    desc: "Vote for community improvements — parks, lighting, road repairs.",
    to: "/vote",
    icon: <IconVote />,
  },
  {
    title: "Waste collection",
    desc: "Request pickup and view live collection schedules by area.",
    to: "/waste",
    icon: <IconRecycle />,
  },
  {
    title: "Admin dashboard",
    desc: "Manage complaints, assign departments, and review analytics.",
    to: "/admin",
    icon: <IconGauge />,
    adminOnly: true,
  },
];

const capabilities = [
  {
    label: "AI categorization",
    desc: "Natural language processing detects issue type and routes to the correct municipal department automatically.",
    icon: <IconBrain />,
    color: "#5B2EFF",
    bg: "#F3EEFF",
  },
  {
    label: "Geospatial deduplication",
    desc: "Complaints within 100 meters are clustered — your report is linked to existing tickets rather than filed separately.",
    icon: <IconSatellite />,
    color: "#0070C9",
    bg: "#E5F2FF",
  },
  {
    label: "Citizen reputation",
    desc: "Verified reporters earn Bronze, Silver, and Gold status — prioritizing high-quality complaints in the resolution queue.",
    icon: <IconAward />,
    color: "#B5860D",
    bg: "#FFF8E6",
  },
];

const stats = [
  { value: "48,200+", label: "Complaints resolved" },
  { value: "2.4 days", label: "Avg. resolution time" },
  { value: "14", label: "Cities deployed" },
  { value: "99.1%", label: "Uptime SLA" },
];

// ─── Ticker (scrolling status strip) ─────────────────────────────────────────

const tickerItems = [
  "12 issues resolved in the last hour",
  "Heat map updated · 847 active complaints",
  "Waste pickup rescheduled in Zone 4",
  "AI routed 3 new complaints to Public Works",
  "99.1% platform uptime this month",
];

function Ticker() {
  const [offset, setOffset] = useState(0);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % tickerItems.length);
    }, 3200);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "7px 14px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "8px",
        width: "fit-content",
        marginBottom: "32px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#60CFAB",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#60CFAB",
            animation: "pulse-dot 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        Live
      </span>
      <span style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.15)" }} />
      <span
        style={{
          fontSize: "12.5px",
          color: "rgba(255,255,255,0.75)",
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          letterSpacing: "-0.01em",
          transition: "opacity 0.4s ease",
        }}
      >
        {tickerItems[current]}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .home-hero { animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .home-section { animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
        .home-section-2 { animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both; }
        .home-section-3 { animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.26s both; }

        .primary-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #E4E9F2;
          border-radius: 16px;
          padding: 28px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .primary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.09);
          border-color: #C7D4F0;
        }
        .primary-card:focus-visible {
          outline: 2px solid #0F62FE;
          outline-offset: 3px;
        }

        .service-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #fff;
          border: 1px solid #E4E9F2;
          border-radius: 14px;
          padding: 20px 22px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
          border-color: #C7D4F0;
        }
        .service-card:focus-visible {
          outline: 2px solid #0F62FE;
          outline-offset: 3px;
        }
        .service-card.admin-card {
          border-style: dashed;
          border-color: #D1D9E8;
          background: #FAFBFD;
        }
        .service-card.admin-card:hover {
          background: #fff;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 20px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          color: #fff;
          transition: opacity 0.15s, transform 0.15s;
          width: fit-content;
        }
        .cta-primary:hover { opacity: 0.88; transform: translateX(2px); }
        .cta-primary:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          background: #0F62FE;
          color: #fff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
        }
        .hero-cta-primary:hover { background: #0353E9; transform: translateY(-1px); }
        .hero-cta-primary:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s;
        }
        .hero-cta-secondary:hover { background: rgba(255,255,255,0.14); }
        .hero-cta-secondary:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

        @media (max-width: 640px) {
          .primary-actions-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .capabilities-grid { grid-template-columns: 1fr !important; }
          .hero-ctas { flex-direction: column !important; }
          .hero-ctas a { width: 100%; justify-content: center; }
          .hero-headline { font-size: clamp(28px, 7vw, 48px) !important; line-height: 1.12 !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="home-hero"
          style={{
            background: "linear-gradient(135deg, #0A0F1E 0%, #0D1A3A 55%, #0F2756 100%)",
            borderRadius: "20px",
            padding: "clamp(36px, 5vw, 64px) clamp(28px, 5vw, 60px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
          {/* Glow orb */}
          <div style={{
            position: "absolute", top: "-80px", right: "-60px",
            width: "380px", height: "380px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(15,98,254,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", maxWidth: "680px" }}>
            <Ticker />

            <p style={{
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#5B9BFF",
              marginBottom: "14px",
            }}>
              Smart City Initiative
            </p>

            <h1
              className="hero-headline"
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#fff",
                margin: 0,
              }}
            >
              The civic platform
              <br />
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>your city</span>
              {" "}deserves
            </h1>

            <p style={{
              marginTop: "18px",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.6)",
              maxWidth: "520px",
            }}>
              Report civic issues, track resolutions, and participate in community decisions — powered by geospatial intelligence and AI routing.
            </p>

            <div className="hero-ctas" style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/register" className="hero-cta-primary">
                <IconClipboardPlus />
                Report an issue
              </Link>
              <Link to="/track" className="hero-cta-secondary">
                <IconSearch />
                Track complaint
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{
              marginTop: "36px",
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}>
              {[
                { icon: <IconShield />, text: "ISO 27001 compliant" },
                { icon: <IconActivity />, text: "99.1% uptime" },
              ].map((t) => (
                <span key={t.text} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", color: "rgba(255,255,255,0.4)",
                }}>
                  {t.icon}
                  {t.text}
                </span>
              ))}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Trusted by 14 city governments
              </span>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div
          className="home-section stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "#E4E9F2",
            border: "1px solid #E4E9F2",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "#fff",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}>
              <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", color: "#0A0F1E" }}>
                {s.value}
              </span>
              <span style={{ fontSize: "12.5px", color: "#6B7A99", fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Primary citizen actions ───────────────────────────────────────── */}
        <section className="home-section">
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9BA8BF", marginBottom: "6px" }}>
              Citizen services
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0A0F1E", letterSpacing: "-0.02em", margin: 0 }}>
              What do you need to do?
            </h2>
          </div>

          <div
            className="primary-actions-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            {primaryActions.map((action) => (
              <Link key={action.to} to={action.to} className="primary-card">
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: "3px",
                  background: action.accent,
                  borderRadius: "16px 16px 0 0",
                }} />

                {/* Icon */}
                <div style={{
                  width: "44px", height: "44px",
                  background: action.accentBg,
                  borderRadius: "11px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: action.accent,
                  marginBottom: "18px",
                  flexShrink: 0,
                }}>
                  {action.icon}
                </div>

                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0A0F1E", margin: "0 0 8px", letterSpacing: "-0.015em" }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#6B7A99", lineHeight: 1.6, margin: "0 0 24px", flexGrow: 1 }}>
                  {action.desc}
                </p>

                <span
                  className="cta-primary"
                  style={{ background: action.accent, marginTop: "auto" }}
                >
                  {action.cta}
                  <IconArrow />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Other services ────────────────────────────────────────────────── */}
        <section className="home-section-2">
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9BA8BF", marginBottom: "6px" }}>
              Platform
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0A0F1E", letterSpacing: "-0.02em", margin: 0 }}>
              More city services
            </h2>
          </div>

          <div
            className="services-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
          >
            {serviceFeatures.map((feat) => (
              <Link
                key={feat.to}
                to={feat.to}
                className={`service-card${feat.adminOnly ? " admin-card" : ""}`}
              >
                <div style={{
                  width: "38px", height: "38px",
                  background: feat.adminOnly ? "#F0F3F9" : "#F0F4FF",
                  borderRadius: "9px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: feat.adminOnly ? "#6B7A99" : "#0F62FE",
                  flexShrink: 0,
                }}>
                  {feat.icon}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: feat.adminOnly ? "#6B7A99" : "#0A0F1E", margin: 0 }}>
                      {feat.title}
                    </h3>
                    {feat.adminOnly && (
                      <span style={{
                        fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.05em",
                        textTransform: "uppercase", color: "#9BA8BF",
                        background: "#F0F3F9", padding: "2px 7px", borderRadius: "4px",
                      }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#9BA8BF", lineHeight: 1.55, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Capabilities (dark surface) ───────────────────────────────────── */}
        <section
          className="home-section-3"
          style={{
            background: "#0A0F1E",
            borderRadius: "20px",
            padding: "clamp(32px, 4vw, 52px) clamp(24px, 4vw, 52px)",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B5A9A", marginBottom: "8px" }}>
              Powered by
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
              Intelligence under the hood
            </h2>
          </div>

          <div
            className="capabilities-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
          >
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "22px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >
                <div style={{
                  width: "36px", height: "36px",
                  background: cap.bg,
                  borderRadius: "9px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: cap.color,
                  marginBottom: "14px",
                }}>
                  {cap.icon}
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                  {cap.label}
                </h3>
                <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0 }}>
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
