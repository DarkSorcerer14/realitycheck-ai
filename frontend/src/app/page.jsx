"use client";
import { useState } from "react";
import IdeaInput from "@/components/IdeaInput";
import Dashboard from "@/components/Dashboard";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshHistory, setRefreshHistory] = useState(0);

  async function analyze(idea, roastMode) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, roast_mode: roastMode }),
      });
      if (!res.ok) {
        let errMsg = "Intelligence Analysis Failed. Is the backend running?";
        try {
          const errData = await res.json();
          if (errData.detail) errMsg = errData.detail;
        } catch (_) { }
        throw new Error(errMsg);
      }
      const data = await res.json();
      setResult(data);
      setRefreshHistory(prev => prev + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectHistory(item) {
    setResult(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="bg-grid" />
      <div className="ambient-glow" />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(5,5,8,0.8)", backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "linear-gradient(135deg, var(--primary), #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(139,92,246,0.4)"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="font-outfit" style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-main)" }}>
            RealityCheck <span style={{ color: "var(--primary)" }}>AI</span>
          </span>
        </div>
        <div className="glass-pill" style={{
          fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "5px 14px", color: "var(--text-dim)", fontWeight: 600
        }}>
          Beta
        </div>
      </nav>

      <main style={{ maxWidth: "840px", margin: "0 auto", padding: "100px 24px 60px", position: "relative", zIndex: 10 }}>
        <header className="animate-slide-up" style={{ textAlign: "center", marginBottom: "64px" }}>

          <div className="glass-pill" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 20px", fontSize: "0.75rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--primary)", marginBottom: "32px",
            fontWeight: 600
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)",
              boxShadow: "0 0 10px var(--primary)",
              animation: "pulseGlow 2s ease-in-out infinite"
            }} />
            Advanced Market Intelligence
          </div>

          <h1 className="heading-xl font-outfit" style={{ marginBottom: "20px" }}>
            Validate your ideas <br />
            <span className="text-gradient">before you build.</span>
          </h1>

          <p className="font-inter" style={{
            color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 300,
            maxWidth: "500px", margin: "0 auto", lineHeight: 1.6
          }}>
            Real internet signals. Honest scoring. Zero fluff.
            Stress-test your startup concept against pure data.
          </p>
        </header>

        <IdeaInput onAnalyze={analyze} loading={loading} />

        {error && (
          <div className="glass-panel" style={{
            borderColor: "rgba(244, 63, 94, 0.3)",
            background: "rgba(244, 63, 94, 0.05)",
            color: "var(--danger)", padding: "20px",
            marginBottom: "32px", fontSize: "0.95rem"
          }}>
            {error}
          </div>
        )}

        {result && <Dashboard data={result} />}

        <HistoryList refreshTrigger={refreshHistory} onSelectHistory={handleSelectHistory} />
      </main>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10, borderTop: "1px solid var(--border-subtle)",
        padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "6px",
            background: "linear-gradient(135deg, var(--primary), #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="font-outfit" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)" }}>
            RealityCheck <span style={{ color: "var(--primary)" }}>AI</span>
          </span>
        </div>
        <span className="font-inter" style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 300 }}>
          Made with <span style={{ color: "var(--danger)" }}></span> by <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Code Bros</span>
        </span>
      </footer>
    </>
  );
}