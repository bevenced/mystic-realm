"use client";

import type { DayPillarGradeResult } from "@/lib/bazi-engine";
import type { DayPillarProfile as ProfileData } from "@/lib/bazi-engine";

interface DayPillarProfileProps {
  grade: DayPillarGradeResult;
  profile: ProfileData;
}

export default function DayPillarProfile({ grade, profile }: DayPillarProfileProps) {
  return (
    <div className="space-y-3" style={{ marginBottom: 32 }}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "#F0AD4E" }} />
          <span className="text-base font-bold" style={{ color: "#3A2F26" }}>日柱解读</span>
        </div>
        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>

      {/* Grade card */}
      <div className="rounded-lg p-5" style={{
        background: "#FFFFFF",
        border: "1px solid #F0EBE3",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold" style={{ color: "#333333" }}>{grade.name}</div>
          <div style={{ fontSize: 14, color: "#F0AD4E" }}>
            {"★".repeat(grade.stars)}{"☆".repeat(5 - grade.stars)}
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{
            background: grade.grade === "上等" ? "#E8F5E9" : grade.grade === "中等" ? "#FFF8E1" : "#FFEBEE",
            color: grade.grade === "上等" ? "#2E7D32" : grade.grade === "中等" ? "#E65100" : "#C62828",
            border: `1px solid ${grade.grade === "上等" ? "#C8E6C9" : grade.grade === "中等" ? "#FFE0B2" : "#FFCDD2"}`,
          }}>{grade.grade}</span>
        </div>

        {/* Poetry */}
        <div className="mb-3 p-3 rounded text-center" style={{ background: "#FBF8F2" }}>
          <p className="text-sm font-serif italic leading-relaxed" style={{ color: "#3A2F26" }}>{profile.poetry}</p>
        </div>

        {/* Detailed sections */}
        <div className="space-y-2">
          <DetailRow label="干支关系" value={profile.ganZhiRelation} />
          <DetailRow label="纳音寓意" value={profile.naYinMeaning} />
          <DetailRow label="性格特征" value={profile.personality} />
          <DetailRow label="事业方向" value={profile.career} />
          <DetailRow label="婚姻感情" value={profile.relationships} />
          {profile.luckyElements.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold shrink-0" style={{ color: "#888888", minWidth: 64 }}>喜用元素</span>
              <div className="flex gap-1.5">
                {profile.luckyElements.map((el) => (
                  <span key={el} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${getElColor(el)}14`, color: getElColor(el), border: `1px solid ${getElColor(el)}28` }}>
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AskAI Button */}
        <div className="flex justify-end mt-4">
          <button type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{ background: "#F0AD4E", color: "#FFFFFF", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E09E3E"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0AD4E"; }}
          >
            问参天AI
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-semibold shrink-0" style={{ color: "#888888", minWidth: 64 }}>{label}</span>
      <p className="text-xs leading-relaxed" style={{ color: "#333333" }}>{value}</p>
    </div>
  );
}

function getElColor(el: string): string {
  const m: Record<string, string> = { Wood: "#5CB85C", Fire: "#D9534F", Earth: "#8B5A2B", Metal: "#F0AD4E", Water: "#428BCA" };
  return m[el] || "#888";
}
