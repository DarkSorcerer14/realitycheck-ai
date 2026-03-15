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
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-1.5 text-xs text-[#7c7cff] mb-6 tracking-widest uppercase">
            Powered by Llama 3.3 · Free via Groq
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Reality<span className="text-[#7c7cff]">Check</span>
          </h1>
          <p className="text-[#888] text-lg">
            Stress-test your startup idea with real internet signals
          </p>
        </header>

        <IdeaInput onAnalyze={analyze} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {result && <Dashboard data={result} />}
      </div>
    </main>
  );
}