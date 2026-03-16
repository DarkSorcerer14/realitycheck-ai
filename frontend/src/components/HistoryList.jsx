"use client";
import { useEffect, useState } from "react";

export default function HistoryList({ onSelectHistory, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [refreshTrigger]);

  async function handleDelete(e, id) {
    e.stopPropagation();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history:", err);
    }
  }

  if (loading) return null;
  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: "100px", animation: "slideUpFade 0.6s ease both" }}>
      <h3 className="font-outfit" style={{
        fontSize: "1.5rem",
        fontWeight: 600,
        marginBottom: "24px",
        color: "var(--text-main)",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "16px",
        letterSpacing: "-0.02em"
      }}>
        Archive
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {history.map((item) => (
          <div
            key={item.id}
            className="glass-panel"
            onClick={() => onSelectHistory(item)}
            style={{
              padding: "20px 24px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary-hover)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ flex: 1, marginRight: "24px" }}>
              <div className="font-inter" style={{ 
                color: "var(--text-main)", fontSize: "1.05rem", fontWeight: 400, marginBottom: "12px", 
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 
              }}>
                "{item.idea}"
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{
                  fontSize: "0.65rem", padding: "4px 10px", borderRadius: "999px",
                  background: item.roast ? "rgba(234,88,12,0.1)" : "rgba(255,255,255,0.05)",
                  color: item.roast ? "#ea580c" : "var(--text-dim)", textTransform: "uppercase",
                  letterSpacing: "0.1em", fontWeight: 600
                }}>
                  {item.roast ? '🔥 Roasted' : 'Standard'}
                </div>
                
                {item.keywords?.slice(0,3).map(kw => (
                  <span key={kw} className="glass-pill" style={{
                    color: "var(--text-muted)", fontSize: "0.7rem", padding: "4px 10px",
                    letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0)"
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ textAlign: "right" }}>
                <div className="font-outfit" style={{
                  fontSize: "2rem", fontWeight: 700, lineHeight: 1,
                  color: item.viability_score >= 7 ? "var(--success)" : item.viability_score >= 5 ? "var(--warning)" : item.viability_score >= 3 ? "#f87171" : "var(--danger)"
                }}>
                  {item.viability_score.toFixed(1)}
                </div>
                <div className="font-inter" style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "4px", fontWeight: 600 }}>Score</div>
              </div>

              <div
                onClick={(e) => handleDelete(e, item.id)}
                style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", 
                  cursor: "pointer", color: "var(--text-dim)", 
                  padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.3)"; e.currentTarget.style.background = "rgba(244, 63, 94, 0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                title="Delete analysis"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
