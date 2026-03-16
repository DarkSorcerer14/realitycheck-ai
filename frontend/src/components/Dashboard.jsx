"use client";

function viabilityMeta(score) {
  if (score >= 7) return { label: "Strong Signal", color: "var(--success)", border: "rgba(16, 185, 129, 0.3)", shadow: "rgba(16, 185, 129, 0.2)" };
  if (score >= 5) return { label: "Moderate Signal", color: "var(--warning)", border: "rgba(245, 158, 11, 0.3)", shadow: "rgba(245, 158, 11, 0.2)" };
  if (score >= 3) return { label: "Weak Signal", color: "#f87171", border: "rgba(248, 113, 113, 0.3)", shadow: "rgba(248, 113, 113, 0.2)" };
  return { label: "Risky Territory", color: "var(--danger)", border: "rgba(244, 63, 94, 0.3)", shadow: "rgba(244, 63, 94, 0.2)" };
}

function ScoreCard({ label, value, color, description, delay = "0s", pulse = false }) {
  return (
    <div className={`glass-panel animate-scale-in`} style={{ padding: "24px", animationDelay: delay, ...(pulse ? { animation: `scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards, pulseBorder 3s infinite` } : {}) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <div className="font-outfit" style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1, marginBottom: "16px", color: "var(--text-main)" }}>
        {value.toFixed(1)}
        <span style={{ fontSize: "1rem", color: "var(--text-dim)", fontWeight: 400, marginLeft: "4px" }}>/10</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{
          height: "100%", borderRadius: "999px", background: color,
          width: `${value * 10}%`, transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 10px ${color}`
        }}/>
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}

export default function Dashboard({ data }) {
  const { label, color, border, shadow } = viabilityMeta(data.viability_score);
  const circ = 2 * Math.PI * 60;
  const dash = (data.viability_score / 10) * circ;

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Hero Score */}
      <div className="glass-panel" style={{
        padding: "48px 40px", display: "flex", alignItems: "center", gap: "48px",
        marginBottom: "24px", flexWrap: "wrap",
        background: "linear-gradient(145deg, rgba(20,20,30,0.6) 0%, rgba(10,10,15,0.8) 100%)"
      }}>
        <div style={{ position: "relative" }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ flexShrink: 0, filter: `drop-shadow(0 0 12px ${shadow})` }}>
            <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10"/>
            <circle cx="75" cy="75" r="60" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 75 75)"
              style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.3))" }}
            />
          </svg>
          <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
             <div className="font-outfit" style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1 }}>
               {data.viability_score.toFixed(1)}
             </div>
             <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Score</div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{
            display: "inline-block", fontSize: "0.75rem", letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "6px 16px", borderRadius: "999px",
            marginBottom: "16px", fontWeight: 600, 
            background: `color-mix(in srgb, ${color} 10%, transparent)`, 
            color, border: `1px solid ${border}`,
            boxShadow: `0 0 20px ${shadow}`
          }}>
            {label}
          </div>
          <h2 className="font-outfit" style={{
            fontSize: "2rem", fontWeight: 600, marginBottom: "12px", letterSpacing: "-0.01em"
          }}>
            Market Viability Analysis
          </h2>
          <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
            Weighted computation: <strong>40%</strong> Reddit Demand, <strong>40%</strong> Google Trends Momentum, <br/><strong>20%</strong> Inverse Market Saturation.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.keywords?.map((kw) => (
              <span key={kw} className="glass-pill" style={{
                color: "var(--primary)", fontSize: "0.75rem", padding: "4px 12px",
                fontWeight: 500, letterSpacing: "0.05em", background: "rgba(139, 92, 246, 0.08)",
                borderColor: "rgba(139, 92, 246, 0.2)"
              }}>
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "24px" }}>
        <div style={{ flex: "1 1 280px" }}>
          <ScoreCard label="Organic Demand" value={data.demand_score} color="#3b82f6" description="Cumulative Reddit discussion volume & engagement." delay="0.1s" />
        </div>
        <div style={{ flex: "1 1 280px" }}>
          <ScoreCard label="Trend Momentum" value={data.trend_score} color="var(--primary)" description="Google Trends 12-month search interest trajectory." delay="0.2s" pulse={true} />
        </div>
        <div style={{ flex: "1 1 280px" }}>
          <ScoreCard label="Market Saturation" value={data.competition_score} color="#ec4899" description="AI-estimated competition density (lower is better)." delay="0.3s" />
        </div>
      </div>

      {/* Business Profile Features */}
      {(data.target_audience || data.monetization) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "24px" }}>
          {data.target_audience && (
            <div className="glass-panel animate-scale-in" style={{ flex: "1 1 280px", padding: "24px", animationDelay: "0.5s" }}>
              <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--success)", fontWeight: 600, marginBottom: "12px" }}>
                Target Audience
              </div>
              <div style={{ fontSize: "1rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                {data.target_audience}
              </div>
            </div>
          )}

          {data.monetization && (
            <div className="glass-panel animate-scale-in" style={{ flex: "1 1 280px", padding: "24px", animationDelay: "0.6s" }}>
              <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--warning)", fontWeight: 600, marginBottom: "12px" }}>
                Monetization Model
              </div>
              <div style={{ fontSize: "1rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                {data.monetization}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Symmetrical Grid for Competitors and AI Analyst */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "24px" }}>
        {/* Competitors Section */}
        {data.competitors && data.competitors.length > 0 ? (
          <div className="glass-panel animate-scale-in" style={{ flex: "1 1 350px", padding: "32px", animationDelay: "0.7s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "rgba(236, 72, 153, 0.1)", border: "1px solid rgba(236, 72, 153, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="font-outfit" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Known Alternatives</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {data.competitors.map((comp, idx) => (
                <span key={idx} style={{
                  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)",
                  padding: "10px 18px", borderRadius: "10px", fontSize: "0.95rem", color: "var(--text-dim)",
                  transition: "all 0.2s"
                }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text-main)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                  {comp}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* AI Analyst */}
        <div className="glass-panel animate-scale-in" style={{ flex: "1 1 350px", padding: "32px", animationDelay: "0.8s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="font-outfit" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Actionable Insights</div>
          </div>
          <div style={{ 
            fontSize: "1rem", color: "var(--text-main)", lineHeight: 1.8, 
            whiteSpace: "pre-line", fontWeight: 300, background: "rgba(0,0,0,0.2)",
            padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)"
          }}>
            {data.ai_feedback}
          </div>
        </div>
      </div>


      {/* Roast */}
      {data.roast && (
        <div className="glass-panel animate-slide-up" style={{
          padding: "32px", background: "linear-gradient(145deg, rgba(234,88,12,0.05) 0%, rgba(10,10,15,0.8) 100%)",
          borderColor: "rgba(234, 88, 12, 0.2)", animationDelay: '0.4s'
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <div className="font-outfit" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ea580c" }}>Silicon Valley Investor Roast</div>
          </div>
          <p style={{ 
            fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, 
            fontStyle: "italic", fontWeight: 300, paddingLeft: "16px", borderLeft: "2px solid #ea580c"
          }}>
            "{data.roast}"
          </p>
        </div>
      )}
    </div>
  );
}