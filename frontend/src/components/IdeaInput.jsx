"use client";
import { useState } from "react";

export default function IdeaInput({ onAnalyze, loading }) {
  const [idea, setIdea] = useState("");
  const [roastMode, setRoastMode] = useState(false);

  return (
    <div className="bg-[#111120] border border-[#222240] rounded-2xl p-6">
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your startup idea... e.g. 'An AI meal planner that builds grocery lists from fitness goals'"
        rows={4}
        className="w-full bg-transparent text-white placeholder-[#383850] text-base resize-none outline-none leading-relaxed"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey && idea.trim())
            onAnalyze(idea, roastMode);
        }}
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1a1a2e]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRoastMode(!roastMode)}
            className={`w-8 h-4 rounded-full transition-colors duration-200 relative ${
              roastMode ? "bg-orange-500" : "bg-[#1e1e35]"
            }`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                roastMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[#555] text-xs">🔥 Roast Mode</span>
        </label>
        <button
          onClick={() => idea.trim() && onAnalyze(idea, roastMode)}
          disabled={loading || !idea.trim()}
          className="flex items-center gap-2 bg-[#7c7cff] hover:bg-[#6a6aee] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>Run Analysis →</>
          )}
        </button>
      </div>
    </div>
  );
}