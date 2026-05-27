"use client";

import type { DayPillarGradeResult } from "@/lib/bazi-engine";
import type { DayPillarProfile as ProfileData } from "@/lib/bazi-engine";

interface DayPillarProfileProps {
  grade: DayPillarGradeResult;
  profile: ProfileData;
}

export default function DayPillarProfile({ grade, profile }: DayPillarProfileProps) {
  const C = {
    cardBg: "#FFFFFF",
    border: "#E8DEC9",
    primary: "#5D4E37",
    text: "#333333",
    muted: "#888888",
    accent: "#C4A040",
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: C.primary }}>日柱解读</span>
        <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: C.accent, color: C.accent }}>i</div>
      </div>

      {/* Grade card */}
      <div className="rounded-lg p-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold" style={{ color: "#333" }}>{grade.name}</div>
          <div style={{ fontSize: 14, color: "#F0AD4E" }}>
            {"★".repeat(grade.stars)}{"☆".repeat(5 - grade.stars)}
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{
            background: grade.grade === "上等" ? "#5CB85C18" : grade.grade === "中等" ? "#F0AD4E18" : "#D9534F18",
            color: grade.grade === "上等" ? "#5CB85C" : grade.grade === "中等" ? "#F0AD4E" : "#D9534F",
            border: `1px solid ${grade.grade === "上等" ? "#5CB85C28" : grade.grade === "中等" ? "#F0AD4E28" : "#D9534F28"}`,
          }}>{grade.grade}</span>
        </div>

        {/* Poetry */}
        <div className="mb-3 p-2 rounded text-center" style={{ background: "#FBF8F2" }}>
          <p className="text-sm font-serif italic leading-relaxed" style={{ color: C.primary }}>{profile.poetry}</p>
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
              <span className="text-xs font-semibold shrink-0" style={{ color: C.muted, minWidth: 64 }}>喜用元素</span>
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
