"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Sparkles, Heart, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";

type Gender = "male" | "female";
interface AnalysisResult {
  overallScore: number;
  dimensions: {
    elementalHarmony: { score: number; analysis: string };
    dayMasterCompatibility: { score: number; analysis: string };
    pillarInteraction: { score: number; analysis: string };
    zodiacCompatibility: { score: number; analysis: string };
    lifeAlignment: { score: number; analysis: string };
  };
  strengths: string[];
  challenges: string[];
  advice: string[];
  summary: string;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#4CAF50" : score >= 60 ? "#FFC107" : score >= 40 ? "#FF9800" : "#E74C3C";
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e0e0e020" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="currentColor" fontSize={size * 0.28} fontWeight="bold" transform="rotate(90, 256, 256)">
        {score}
      </text>
    </svg>
  );
}

export default function CompatibilityClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { locale, t } = useLocale();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [form, setForm] = useState({
    birthDate1: "", birthHour1: 12, gender1: "male" as Gender,
    birthDate2: "", birthHour2: 12, gender2: "female" as Gender,
    partnerName: "",
  });

  const handleSubmit = async () => {
    if (!form.birthDate1 || !form.birthDate2) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai-compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data.analysis);
    } catch (e) {
      console.error(e);
      alert(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: c.bg }}>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Heart size={40} style={{ color: c.primary }} />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: c.text }}>{t.compatibility.title}</h1>
          <p className="text-sm" style={{ color: c.textMuted }}>
            {t.compatibility.subtitle}
          </p>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Person 1 */}
          <div className="p-5 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
            <h3 className="font-semibold mb-4" style={{ color: c.primary }}>{t.compatibility.person1}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.birthDate}</label>
                <input type="date" value={form.birthDate1} onChange={(e) => setForm({ ...form, birthDate1: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.birthHour}</label>
                <input type="number" min={0} max={23} value={form.birthHour1} onChange={(e) => setForm({ ...form, birthHour1: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.gender}</label>
                <select value={form.gender1} onChange={(e) => setForm({ ...form, gender1: e.target.value as Gender })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }}>
                  <option value="male">{t.compatibility.male}</option>
                  <option value="female">{t.compatibility.female}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div className="p-5 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
            <h3 className="font-semibold mb-4" style={{ color: c.primary }}>{t.compatibility.person2}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.birthDate}</label>
                <input type="date" value={form.birthDate2} onChange={(e) => setForm({ ...form, birthDate2: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.birthHour}</label>
                <input type="number" min={0} max={23} value={form.birthHour2} onChange={(e) => setForm({ ...form, birthHour2: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.gender}</label>
                <select value={form.gender2} onChange={(e) => setForm({ ...form, gender2: e.target.value as Gender })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }}>
                  <option value="female">{t.compatibility.female}</option>
                  <option value="male">{t.compatibility.male}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Optional name */}
        <div className="mb-6">
          <label className="text-xs font-medium" style={{ color: c.textMuted }}>{t.compatibility.partnerName}</label>
          <input type="text" value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
            placeholder="e.g., Alex"
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${c.primary}06`, color: c.text, border: `1px solid ${c.primary}15` }} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !form.birthDate1 || !form.birthDate2}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ backgroundColor: c.primary, color: currentTheme.isDark ? c.bg : "#FFFFFF", opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <><Sparkles size={18} className="animate-spin" /> {t.compatibility.analyzing}</>
          ) : (
            <><Heart size={18} /> {t.compatibility.analyze}</>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-12 space-y-8 animate-fade-in">
            {/* Overall Score */}
            <div className="flex flex-col items-center p-8 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
              <ScoreRing score={result.overallScore} size={160} />
              <h2 className="text-xl font-bold mt-4" style={{ color: c.text }}>
                {t.compatibility.overallScore}: {result.overallScore}/100
              </h2>
              <p className="text-sm mt-2 text-center max-w-lg" style={{ color: c.textMuted }}>
                {result.summary}
              </p>
            </div>

            {/* Dimension Scores */}
            <div className="space-y-3">
              {Object.entries(result.dimensions).map(([key, dim]) => (
                <div key={key} className="rounded-xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
                  <button onClick={() => setExpandedDim(expandedDim === key ? null : key)}
                    className="w-full flex items-center gap-4 p-4 text-left">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${c.primary}12`, color: c.primary }}>
                      {dim.score}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: c.text }}>{t.compatibility.dimensions[key as keyof typeof t.compatibility.dimensions] || key}</p>
                      <div className="h-1.5 rounded-full mt-1.5" style={{ backgroundColor: `${c.primary}10` }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${dim.score}%`,
                          backgroundColor: dim.score >= 80 ? "#4CAF50" : dim.score >= 60 ? "#FFC107" : dim.score >= 40 ? "#FF9800" : "#E74C3C",
                        }} />
                      </div>
                    </div>
                    <ChevronDown size={16} style={{ color: c.textMuted, transform: expandedDim === key ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
                  </button>
                  {expandedDim === key && (
                    <div className="px-4 pb-4">
                      <p className="text-sm" style={{ color: c.textMuted }}>{dim.analysis}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Strengths & Challenges */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl" style={{ backgroundColor: `${c.primary}06`, border: `1px solid #4CAF5030` }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} color="#4CAF50" />
                  <h3 className="font-semibold text-sm" style={{ color: c.text }}>{t.compatibility.strengths}</h3>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: c.textMuted }}>
                      <span style={{ color: "#4CAF50" }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl" style={{ backgroundColor: `${c.primary}06`, border: `1px solid #FF980030` }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} color="#FF9800" />
                  <h3 className="font-semibold text-sm" style={{ color: c.text }}>{t.compatibility.challenges}</h3>
                </div>
                <ul className="space-y-2">
                  {result.challenges.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: c.textMuted }}>
                      <span style={{ color: "#FF9800" }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Advice */}
            <div className="p-5 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: c.text }}>{t.compatibility.advice}</h3>
              <ul className="space-y-2">
                {result.advice.map((a, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: c.textMuted }}>
                    <span style={{ color: c.primary }}>{i + 1}.</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
