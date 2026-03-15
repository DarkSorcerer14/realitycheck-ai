"use client";
import { useState } from "react";
import IdeaInput from "@/components/IdeaInput";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!res.ok) throw new Error("Analysis failed");
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      background: "#07070A",
      minHeight: "100vh",
      color: "#F0EEE8",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflowX: "hidden"
    }}>
      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(#1E1E2E 1px,transparent 1px),linear-gradient(90deg,#1E1E2E 1px,transparent 1px)",
        backgroundSize: "60px 60px", opacity: 0.3, pointerEvents: "none"
      }}/>
      {/* Gold glow */}
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse,rgba(201,168,76,0.08) 0%,transparent 70%)",
        pointerEvents: "none"
      }}/>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "60px 24px 80px", position: "relative" }}>
        <header style={{ textAlign: "center", marginBottom: "52px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(201,168,76,0.3)", borderRadius: "100px",
            padding: "6px 16px", fontSize: "11px", letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#C9A84C", marginBottom: "28px",
            background: "rgba(201,168,76,0.05)"
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C",
              animation: "pulse 2s ease-in-out infinite"
            }}/>
            Startup Intelligence
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(42px,7vw,68px)", fontWeight: 400,
            lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "16px"
          }}>
            Validate before<br/>you <em style={{ fontStyle: "italic", color: "#C9A84C" }}>build</em>
          </h1>
          <p style={{ color: "#6B6880", fontSize: "16px", fontWeight: 300, maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            Real internet signals. Honest scores. No fluff — just data on whether your idea has legs.
          </p>
        </header>

        <IdeaInput onAnalyze={analyze} loading={loading} />

        {error && (
          <div style={{
            background: "#0F0808", border: "1px solid rgba(245,101,101,0.3)",
            borderRadius: "12px", padding: "16px 20px", color: "#F56565",
            fontSize: "13px", marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {result && <Dashboard data={result} />}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(0.8)}
        }
        @keyframes spin {
          to{transform:rotate(360deg)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>
    </main>
  );
}