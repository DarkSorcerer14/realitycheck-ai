"use client";
import { useState } from "react";

const SUGGESTIONS = [
  "AI fitness coach that builds personalized workout plans",
  "Marketplace for renting camera gear between creators",
  "B2B SaaS for automating employee onboarding with AI",
  "Social app for book readers to share highlights",
];

export default function IdeaInput({ onAnalyze, loading }) {
  const [idea, setIdea] = useState("");
  const [roastMode, setRoastMode] = useState(false);

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Suggestion pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
        {SUGGESTIONS.map((s, i) => (
          <button 
            key={i} 
            onClick={() => setIdea(s)} 
            className="glass-pill"
            style={{
              color: "var(--text-dim)",
              fontSize: "0.85rem",
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { 
              e.target.style.borderColor = "var(--primary-hover)"; 
              e.target.style.color = "var(--text-main)"; 
              e.target.style.background = "rgba(139, 92, 246, 0.05)";
            }}
            onMouseLeave={e => { 
              e.target.style.borderColor = "var(--border-subtle)"; 
              e.target.style.color = "var(--text-dim)"; 
              e.target.style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            {s.split(" ").slice(0, 3).join(" ")}...
          </button>
        ))}
      </div>

      {/* Input card */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "40px" }}>
        <textarea
          className="interactive-input"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea in detail. The more specific, the purer the data..."
          rows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey && idea.trim()) onAnalyze(idea, roastMode);
          }}
        />
        
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)"
        }}>
          {/* Roast toggle */}
          <div 
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
            onClick={() => setRoastMode(!roastMode)}
          >
            <div className="toggle-switch" data-active={roastMode}>
              <div className="toggle-knob" />
            </div>
            <span style={{ 
              fontSize: "0.9rem", 
              color: roastMode ? "#ea580c" : "var(--text-dim)", 
              fontWeight: roastMode ? 500 : 400,
              transition: "color 0.3s"
            }}>
              🔥 Roast Mode
            </span>
          </div>

          {/* Run button */}
          <button
            className="btn-primary"
            onClick={() => idea.trim() && onAnalyze(idea, roastMode)}
            disabled={loading || !idea.trim()}
          >
            {loading ? (
              <>
                <div style={{
                  width: "16px", height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "50%", animation: "spin-slow 0.8s linear infinite"
                }}/>
                Scanning Signals...
              </>
            ) : (
              <>Run Intelligence &rarr;</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}