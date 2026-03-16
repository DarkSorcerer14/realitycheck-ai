"use client";
import { useState } from "react";

const SUGGESTIONS = [
  "AI fitness coach that builds personalized workout plans",
  "Marketplace for renting camera gear between creators",
  "B2B SaaS for automating employee onboarding with AI",
  "Social app for book readers to share highlights",
];

function FitQuestion({ label, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", borderRadius: "12px", cursor: "pointer",
        border: `1px solid ${value ? "rgba(139,92,246,0.4)" : "var(--border-subtle)"}`,
        background: value ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
        transition: "all 0.2s"
      }}
    >
      <div style={{
        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
        border: `2px solid ${value ? "var(--primary)" : "var(--border-hover)"}`,
        background: value ? "var(--primary)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s"
      }}>
        {value && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontSize: "0.9rem", color: value ? "var(--text-main)" : "var(--text-dim)", transition: "color 0.2s" }}>
        {label}
      </span>
    </div>
  );
}

export default function IdeaInput({ onAnalyze, loading }) {
  const [idea, setIdea] = useState("");
  const [roastMode, setRoastMode] = useState(false);
  const [domainExp, setDomainExp] = useState(false);
  const [techSkills, setTechSkills] = useState(false);
  const [network, setNetwork] = useState(false);
  const [showFit, setShowFit] = useState(false);

  const founderFitScore = (domainExp ? 4 : 0) + (techSkills ? 3.5 : 0) + (network ? 2.5 : 0);

  function handleAnalyze() {
    if (!idea.trim()) return;
    onAnalyze(idea, roastMode, domainExp, techSkills, network);
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Suggestion pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setIdea(s)}
            className="glass-pill"
            style={{ color: "var(--text-dim)", fontSize: "0.85rem", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--primary-hover)"; e.target.style.color = "var(--text-main)"; e.target.style.background = "rgba(139, 92, 246, 0.05)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.color = "var(--text-dim)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
          >
            {s.split(" ").slice(0, 3).join(" ")}...
          </button>
        ))}
      </div>

      {/* Input card */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "24px" }}>
        <textarea
          className="interactive-input"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea in detail. The more specific, the purer the data..."
          rows={4}
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey && idea.trim()) handleAnalyze(); }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Roast toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setRoastMode(!roastMode)}>
            <div className="toggle-switch" data-active={roastMode}><div className="toggle-knob" /></div>
            <span style={{ fontSize: "0.9rem", color: roastMode ? "#ea580c" : "var(--text-dim)", fontWeight: roastMode ? 500 : 400, transition: "color 0.3s" }}>
              🔥 Roast Mode
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Founder Fit toggle */}
            <button
              onClick={() => setShowFit(!showFit)}
              className="glass-pill"
              style={{
                padding: "10px 16px", fontSize: "0.85rem", cursor: "pointer",
                color: showFit ? "var(--primary)" : "var(--text-dim)",
                borderColor: showFit ? "rgba(139,92,246,0.4)" : "var(--border-subtle)",
                display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Founder Fit
              {founderFitScore > 0 && (
                <span style={{ background: "var(--primary)", color: "white", borderRadius: "999px", padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {founderFitScore}/10
                </span>
              )}
            </button>

            {/* Run button */}
            <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !idea.trim()}>
              {loading ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
                  Scanning Signals...
                </>
              ) : (<>Run Intelligence &rarr;</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Founder Fit panel */}
      {showFit && (
        <div className="glass-panel animate-scale-in" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div className="font-outfit" style={{ fontSize: "1rem", fontWeight: 600 }}>Founder-Market Fit</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Impacts <strong style={{ color: "var(--primary)" }}>10%</strong> of viability score
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <FitQuestion label="I have domain/industry experience in this space" value={domainExp} onChange={setDomainExp} />
            <FitQuestion label="I have technical skills to build an MVP" value={techSkills} onChange={setTechSkills} />
            <FitQuestion label="I have relevant network or connections in this market" value={network} onChange={setNetwork} />
          </div>
        </div>
      )}
    </div>
  );
}