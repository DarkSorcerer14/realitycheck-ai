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
    <div>
      {/* Suggestion pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setIdea(s)} style={{
            background: "#0E0E14", border: "1px solid #1E1E2E",
            color: "#6B6880", fontSize: "12px", padding: "6px 14px",
            borderRadius: "100px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.target.style.borderColor = "rgba(201,168,76,0.4)"; e.target.style.color = "#C9A84C"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#1E1E2E"; e.target.style.color = "#6B6880"; }}
          >
            {s.split(" ").slice(0, 3).join(" ")}...
          </button>
        ))}
      </div>

      {/* Input card */}
      <div style={{
        background: "#0E0E14", border: "1px solid #1E1E2E",
        borderRadius: "20px", padding: "28px", marginBottom: "32px",
        transition: "border-color 0.2s"
      }}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea in detail — the more specific, the better the signal..."
          rows={4}
          style={{
            width: "100%", background: "transparent", border: "none",
            outline: "none", color: "#F0EEE8", fontFamily: "'DM Sans',sans-serif",
            fontSize: "15px", fontWeight: 300, lineHeight: 1.8, resize: "none"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey && idea.trim()) onAnalyze(idea, roastMode);
          }}
        />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #1E1E2E"
        }}>
          {/* Roast toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => setRoastMode(!roastMode)}>
            <div style={{
              width: "36px", height: "20px", borderRadius: "100px",
              background: roastMode ? "#7C3A00" : "#1E1E2E",
              position: "relative", transition: "background 0.2s", cursor: "pointer"
            }}>
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
                position: "absolute", top: "3px", left: "3px",
                transition: "transform 0.2s",
                transform: roastMode ? "translateX(16px)" : "translateX(0)"
              }}/>
            </div>
            <span style={{ fontSize: "12px", color: "#6B6880" }}>🔥 Roast mode</span>
          </div>

          {/* Run button */}
          <button
            onClick={() => idea.trim() && onAnalyze(idea, roastMode)}
            disabled={loading || !idea.trim()}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: loading || !idea.trim() ? "rgba(201,168,76,0.4)" : "#C9A84C",
              color: "#07070A", fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px", fontWeight: 500, letterSpacing: "0.04em",
              padding: "11px 24px", borderRadius: "100px", border: "none",
              cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
              transition: "all 0.15s"
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "13px", height: "13px",
                  border: "2px solid rgba(7,7,10,0.3)", borderTopColor: "#07070A",
                  borderRadius: "50%", animation: "spin 0.7s linear infinite"
                }}/>
                Analyzing
              </>
            ) : (
              <>Run Analysis →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}