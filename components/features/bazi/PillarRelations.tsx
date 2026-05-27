"use client";

import type { PillarRelation } from "@/lib/bazi-engine";

interface PillarRelationsProps {
  relations: PillarRelation[];
  pillarNames?: string[];
}

const RELATION_CONFIG: Record<string, { color: string; label: string; width: number }> = {
  combine: { color: "#5CB85C", label: "合", width: 2.5 },
  clash: { color: "#D9534F", label: "冲", width: 2.5 },
  harm: { color: "#F0AD4E", label: "害", width: 2.5 },
  punish: { color: "#9B59B6", label: "刑", width: 2.5 },
  tripleCombine: { color: "#428BCA", label: "三合", width: 2 },
};

const LABELS = ["年柱", "月柱", "日柱", "时柱"];

export default function PillarRelations({ relations }: PillarRelationsProps) {
  if (!relations || relations.length === 0) return null;

  return (
    <div className="space-y-3" style={{ marginBottom: 32 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "#F0AD4E" }} />
          <span className="text-base font-bold" style={{ color: "#3A2F26" }}>四柱关系</span>
        </div>
        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>

      <div className="rounded-lg p-5" style={{
        background: "#FFFFFF",
        border: "1px solid #F0EBE3",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        {/* Pillar nodes + connections */}
        <div className="relative flex items-center justify-center gap-3 py-8 mb-4">
          {LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: "#FBF8F2", border: "2px solid #3A2F26", color: "#3A2F26" }}>
                {label}
              </div>
            </div>
          ))}

          {/* SVG connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {relations.map((rel, idx) => {
              const cfg = RELATION_CONFIG[rel.type];
              if (!cfg) return null;
              const x1 = (rel.fromIndex * 25 + 12.5) + "%";
              const x2 = (rel.toIndex * 25 + 12.5) + "%";
              const y1 = rel.fromIndex % 2 === 0 ? "35%" : "65%";
              const y2 = rel.toIndex % 2 === 0 ? "35%" : "65%";
              return (
                <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={cfg.color} strokeWidth={cfg.width}
                  strokeDasharray={rel.type === "tripleCombine" ? "6,3" : "none"}
                  opacity={0.8} />
              );
            })}
          </svg>
        </div>

        {/* Relation tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {relations.map((rel, idx) => {
            const cfg = RELATION_CONFIG[rel.type];
            if (!cfg) return null;
            return (
              <div key={idx} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
                style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}28` }}>
                <span className="font-semibold" style={{ color: cfg.color }}>
                  {rel.pillars.map((p: string) => ({ Year: "年", Month: "月", Day: "日", Hour: "时" })[p] || p).join("")}
                </span>
                <span style={{ color: cfg.color }}>{rel.label}</span>
                {rel.description && (
                  <span className="hidden sm:inline" style={{ color: "#888888" }}>{rel.description.slice(0, 30)}</span>
                )}
              </div>
            );
          })}
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
