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
        } catch (_) {}
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
      
      <main style={{ maxWidth: "840px", margin: "0 auto", padding: "80px 24px 120px", position: "relative", zIndex: 10 }}>
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
            }}/>
            Advanced Market Intelligence
          </div>
          
          <h1 className="heading-xl font-outfit" style={{ marginBottom: "20px" }}>
            Validate your ideas <br/>
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
    </>
  );
}