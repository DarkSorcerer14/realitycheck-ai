"use client";

function ScoreCard({ label, value, color, description }) {
  return (
    <div className="bg-[#111120] border border-[#222240] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#888] text-sm">{label}</span>
        <span className="text-white font-semibold text-lg">
          {value.toFixed(1)}
          <span className="text-[#444] text-sm font-normal">/10</span>
        </span>
      </div>
      <div className="h-1.5 bg-[#1e1e35] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
      <p className="text-[#555] text-xs mt-2">{description}</p>
    </div>
  );
}

function viabilityMeta(score) {
  if (score >= 7) return { label: "Strong Signal", color: "#34d399" };
  if (score >= 5) return { label: "Moderate Signal", color: "#fbbf24" };
  if (score >= 3) return { label: "Weak Signal", color: "#f97316" };
  return { label: "Risky Territory", color: "#f87171" };
}

export default function Dashboard({ data }) {
  const { label, color } = viabilityMeta(data.viability_score);
  const circ = 2 * Math.PI * 50;
  const dash = (data.viability_score / 10) * circ;

  return (
    <div className="mt-10 space-y-4">
      {/* Viability Hero */}
      <div className="bg-[#111120] border border-[#222240] rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8">
        <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1e35" strokeWidth="9" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
          <text x="60" y="55" textAnchor="middle" fill="white" fontSize="26" fontWeight="700">
            {data.viability_score.toFixed(1)}
          </text>
          <text x="60" y="72" textAnchor="middle" fill="#555" fontSize="10">
            / 10
          </text>
        </svg>
        <div className="flex-1 text-center sm:text-left">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: `${color}22`, color }}
          >
            {label}
          </div>
          <h2 className="text-2xl font-bold mb-2">Startup Viability Score</h2>
          <p className="text-[#555] text-sm mb-4">
            40% demand · 30% trend · −30% competition
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {data.keywords?.map((kw) => (
              <span
                key={kw}
                className="bg-[#1a1a2e] border border-[#2a2a4a] text-[#7c7cff] text-xs px-2.5 py-1 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard
          label="Demand Score" value={data.demand_score} color="#7c7cff"
          description="Reddit discussion volume & engagement"
        />
        <ScoreCard
          label="Trend Score" value={data.trend_score} color="#34d399"
          description="12-month Google Trends momentum"
        />
        <ScoreCard
          label="Competition Score" value={data.competition_score} color="#f97316"
          description="Market saturation — lower is better for you"
        />
      </div>

      {/* AI Feedback */}
      <div className="bg-[#111120] border border-[#222240] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#7c7cff]" />
          <span className="text-white font-medium text-sm">AI Analyst Verdict</span>
        </div>
        <p className="text-[#aaa] text-sm leading-relaxed whitespace-pre-line">
          {data.ai_feedback}
        </p>
      </div>

      {/* Roast Mode */}
      {data.roast && (
        <div className="bg-[#1a0f00] border border-orange-900/40 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <span className="text-orange-400 font-medium text-sm">Roast Mode</span>
          </div>
          <p className="text-orange-200/70 text-sm leading-relaxed italic">
            {data.roast}
          </p>
        </div>
      )}
    </div>
  );
}