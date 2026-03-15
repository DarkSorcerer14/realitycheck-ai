"use client";

function viabilityMeta(score) {
  if (score >= 7) return { label: "Strong Signal", color: "#2DD4A0", bg: "rgba(45,212,160,0.1)", border: "rgba(45,212,160,0.25)" };
  if (score >= 5) return { label: "Moderate Signal", color: "#C9A84C", bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.25)" };
  if (score >= 3) return { label: "Weak Signal", color: "#F5A623", bg: "rgba(245,166,35,0.1)", border: "rgba(245,166,35,0.25)" };
  return { label: "Risky Territory", color: "#F56565", bg: "rgba(245,101,101,0.1)", border: "rgba(245,101,101,0.25)" };
}

function ScoreCard({ label, value, color, description }) {
  return (
    <div style={{
      background: "#0E0E14", border: "1px solid #1E1E2E",
      borderRadius: "16px", padding: "22px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6880" }}>
          {label}
        </div>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
      </div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "36px", fontWeight: 400, lineHeight: 1, marginBottom: "12px" }}>
        {value.toFixed(1)}
        <span style={{ fontSize: "14px", color: "#6B6880", fontFamily: "'DM Sans',sans-serif" }}>/10</span>
      </div>
      <div style={{ height: "3px", background: "#1E1E2E", borderRadius: "100px", overflow: "hidden", marginBottom: "10px" }}>
        <div style={{
          height: "100%", borderRadius: "100px", background: color,
          width: `${value * 10}%`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)"
        }}/>
      </div>
      <div style={{ fontSize: "11px", color: "#6B6880", lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}

export default function Dashboard({ data }) {
  const { label, color, bg, border } = viabilityMeta(data.viability_score);
  const circ = 2 * Math.PI * 54;
  const dash = (data.viability_score / 10) * circ;

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      {/* Hero */}
      <div style={{
        background: "#0E0E14", border: "1px solid #1E1E2E", borderRadius: "20px",
        padding: "40px", display: "flex", alignItems: "center", gap: "40px",
        marginBottom: "20px", flexWrap: "wrap"
      }}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ flexShrink: 0 }}>
          <circle cx="65" cy="65" r="54" fill="none" stroke="#1E1E2E" strokeWidth="8"/>
          <circle cx="65" cy="65" r="54" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
          <text x="65" y="60" textAnchor="middle" fill="#F0EEE8" fontSize="30"
            fontFamily="'Instrument Serif',serif" fontWeight="400">
            {data.viability_score.toFixed(1)}
          </text>
          <text x="65" y="78" textAnchor="middle" fill="#6B6880" fontSize="11"
            fontFamily="'DM Sans',sans-serif">
            out of 10
          </text>
        </svg>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{
            display: "inline-block", fontSize: "11px", letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "5px 14px", borderRadius: "100px",
            marginBottom: "14px", fontWeight: 500, background: bg, color, border: `1px solid ${border}`
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: "'Instrument Serif',serif", fontSize: "28px",
            fontWeight: 400, marginBottom: "8px", letterSpacing: "-0.01em"
          }}>
            Startup Viability Score
          </div>
          <div style={{ color: "#6B6880", fontSize: "13px", lineHeight: 1.7, marginBottom: "16px" }}>
            Weighted signal: 40% demand · 30% trend · −30% competition
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.keywords?.map((kw) => (
              <span key={kw} style={{
                background: "#14141C", border: "1px solid #1E1E2E",
                color: "#6B6880", fontSize: "11px", padding: "4px 12px",
                borderRadius: "100px", letterSpacing: "0.04em"
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px", marginBottom: "20px" }}>
        <ScoreCard label="Demand" value={data.demand_score} color="#7C6FCD" description="Reddit engagement & discussion volume" />
        <ScoreCard label="Trend" value={data.trend_score} color="#2DD4A0" description="Google Trends 12-month momentum" />
        <ScoreCard label="Competition" value={data.competition_score} color="#F5A623" description="Market saturation — lower favours you" />
      </div>

      {/* AI feedback */}
      <div style={{
        background: "#0E0E14", border: "1px solid #1E1E2E",
        borderRadius: "16px", padding: "28px", marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A84C" }}/>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.04em" }}>Analyst Verdict</div>
          <div style={{
            marginLeft: "auto", fontSize: "10px", color: "#C9A84C",
            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
            padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.06em", textTransform: "uppercase"
          }}>
            Llama 3.3
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#A09DB8", lineHeight: 1.85, whiteSpace: "pre-line", fontWeight: 300 }}>
          {data.ai_feedback}
        </p>
      </div>

      {/* Roast */}
      {data.roast && (
        <div style={{
          background: "#0F0800", border: "1px solid rgba(245,166,35,0.2)",
          borderRadius: "16px", padding: "28px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span style={{ fontSize: "16px" }}>🔥</span>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#F5A623" }}>Roast Mode</div>
          </div>
          <p style={{ fontSize: "14px", color: "rgba(245,166,35,0.6)", lineHeight: 1.85, fontStyle: "italic", fontWeight: 300 }}>
            {data.roast}
          </p>
        </div>
      )}
    </div>
  );
}