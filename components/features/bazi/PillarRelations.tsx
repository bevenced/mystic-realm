"use client";

import type { PillarRelation } from "@/lib/bazi-engine";

interface PillarRelationsProps {
  relations: PillarRelation[];
  pillarNames?: string[];
}

const RELATION_CONFIG: Record<string, { color: string; label: string; width: number }> = {
  combine: { color: "#5CB85C", label: "合", width: 2 },
  clash: { color: "#D9534F", label: "冲", width: 2 },
  harm: { color: "#F0AD4E", label: "害", width: 2 },
  punish: { color: "#9B59B6", label: "刑", width: 2 },
  tripleCombine: { color: "#428BCA", label: "三合", width: 1.5 },
};

const LABELS = ["年柱", "月柱", "日柱", "时柱"];

export default function PillarRelations({ relations }: PillarRelationsProps) {
  if (!relations || relations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "#5D4E37" }}>四柱关系</span>
        <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>

      <div className="rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid #E8DEC9" }}>
        {/* Pillar nodes + connections */}
        <div className="relative flex items-center justify-center gap-3 py-6 mb-3">
          {LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "#FBF8F2", border: "2px solid #5D4E37", color: "#5D4E37" }}>
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
              const y1 = rel.fromIndex % 2 === 0 ? "30%" : "70%";
              const y2 = rel.toIndex % 2 === 0 ? "30%" : "70%";
              return (
                <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={cfg.color} strokeWidth={cfg.width}
                  strokeDasharray={rel.type === "tripleCombine" ? "6,3" : "none"}
                  opacity={0.7} />
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
      </div>
    </div>
  );
}
