"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { PillarRelation, DayPillarGradeResult, ElementStrengthResult, PatternResult } from "@/lib/bazi-engine";

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50", Fire: "#FF5722", Earth: "#FFC107", Metal: "#909090", Water: "#42A5F5",
};
const ELEMENT_LABELS: Record<string, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
const ELEMENT_KEYS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

function getKongWang(stemIndex: number, branchIndex: number): string {
  const j = stemIndex + 10 * (((stemIndex - branchIndex) / 2 + 6) % 6);
  const xun = Math.floor(j / 10);
  return BRANCHES[(12 - 2 * xun) % 12] + BRANCHES[(13 - 2 * xun) % 12];
}

interface PillarData { stem: string; stemIndex: number; branch: string; branchIndex: number; stemElement: string; branchElement: string; zodiac: string; }
interface HiddenStemData { stem: string; stemIndex: number; qi: string; element: string; }

interface BaziChartProps {
  pillars: { year: PillarData; month: PillarData; day: PillarData; hour: PillarData };
  naYin: string[];
  hiddenStems: HiddenStemData[][];
  fortuneStages?: string[];
  dayMasterElement: string;
  dayMasterYinYang: string;
  elementCounts: Record<string, number>;
  zodiac: string;
  tenGods?: string[];
  tenGodElements?: string[];
  selfSitting?: string[];
  pillarRelations?: PillarRelation[];
  dayPillarGrade?: DayPillarGradeResult;
  elementStrength?: ElementStrengthResult;
  pattern?: PatternResult;
}

const RELATION_SYMBOLS: Record<string, { sym: string; color: string }> = {
  combine: { sym: "合", color: "#2ECC71" },
  clash: { sym: "冲", color: "#E74C3C" },
  harm: { sym: "害", color: "#FF9800" },
  punish: { sym: "刑", color: "#9B59B6" },
  tripleCombine: { sym: "三合", color: "#3498DB" },
};

export default function BaziChart({
  pillars, naYin, hiddenStems, fortuneStages = [],
  dayMasterElement, dayMasterYinYang, elementCounts, zodiac,
  tenGods, tenGodElements, selfSitting,
  pillarRelations, dayPillarGrade, elementStrength, pattern,
}: BaziChartProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const pillarLabels = ["年柱", "月柱", "日柱", "时柱"];
  const hasFortune = fortuneStages.length === 4;
  const hasSelfSitting = selfSitting && selfSitting.length === 4;
  const totalEl = ELEMENT_KEYS.reduce((s, k) => s + (elementCounts?.[k] || 0), 0);
  const dmScore = elementStrength?.dayMasterStrength?.score ?? 0;
  const dmIsStrong = elementStrength?.dayMasterStrength?.isStrong;

  return (
    <div className="space-y-5">
      {/* ===== ① Day Master Hero Card ===== */}
      <div className="rounded-lg p-5 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}14` }}>
        {/* Seal stamp badge */}
        <div className="flex justify-center mb-3">
          <span style={{
            display: "inline-block",
            background: "#C0392B",
            color: "#FFF",
            fontSize: 12,
            fontWeight: 700,
            padding: "3px 10px",
            transform: "rotate(-3deg)",
            letterSpacing: 3,
          }}>日 主</span>
        </div>

        {/* Day Master large character */}
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, color: ELEMENT_COLORS[dayMasterElement] || c.text }}>
          {pillars.day.stem}{ELEMENT_LABELS[dayMasterElement] || ""}
        </div>

        {/* Subtitle */}
        <div className="mt-2" style={{ fontSize: 17, color: c.textMuted }}>
          {dayMasterYinYang} {dayMasterElement} · {zodiac}
        </div>

        {/* Element distribution thin bar */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: c.textMuted, whiteSpace: "nowrap" }}>五行</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden flex" style={{ background: `${c.primary}0F` }}>
            {ELEMENT_KEYS.map(el => {
              const pct = totalEl > 0 ? ((elementCounts?.[el] || 0) / totalEl) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div key={el} style={{
                  width: `${pct}%`, height: "100%", background: ELEMENT_COLORS[el],
                  transition: "width 0.5s ease",
                }} />
              );
            })}
          </div>
        </div>
        {/* Element percentages */}
        <div className="flex justify-center gap-3 mt-1.5">
          {ELEMENT_KEYS.map(el => {
            const pct = totalEl > 0 ? ((elementCounts?.[el] || 0) / totalEl) * 100 : 0;
            return (
              <span key={el} className="text-xs font-semibold" style={{ color: ELEMENT_COLORS[el] }}>
                {ELEMENT_LABELS[el]}{pct.toFixed(0)}%
              </span>
            );
          })}
        </div>
      </div>

      {/* ===== ② Four Pillars Horizontal Scroll ===== */}
      <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}14` }}>
        {/* Section title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
          <span className="text-base font-bold" style={{ color: c.text }}>四柱</span>
        </div>

        {/* Four pillar cards in a row */}
        <div className="flex gap-1.5">
          {pillarKeys.map((key, pi) => {
            const p = pillars[key];
            const isDay = key === "day";
            const stemEl = ELEMENT_COLORS[p.stemElement] || c.text;
            const branchEl = ELEMENT_COLORS[p.branchElement] || c.text;
            const tgEl = tenGodElements ? (ELEMENT_COLORS[tenGodElements[pi]] || c.text) : c.text;
            const hs = hiddenStems[pi] || [];

            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-1" style={{
                padding: "8px 4px 6px",
                borderRadius: 8,
                background: isDay ? `${c.primary}0C` : "transparent",
                border: isDay ? `1.5px solid ${c.primary}40` : `1px solid ${c.primary}0C`,
                boxShadow: isDay ? `0 0 12px ${c.primary}18` : "none",
                minWidth: 0,
              }}>
                {/* Pillar label */}
                <span className="text-xs font-semibold mb-0.5" style={{ color: c.primary, opacity: 0.7 }}>
                  {pillarLabels[pi]}
                </span>

                {/* Stem */}
                <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: stemEl }}>
                  {p.stem}
                </span>

                {/* Branch */}
                <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: branchEl }}>
                  {p.branch}
                </span>

                {/* Ten God */}
                {tenGods && (
                  <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: tgEl }}>
                    {tenGods[pi]}
                  </span>
                )}

                {/* Hidden stems */}
                {hs.length > 0 && (
                  <span style={{ fontSize: 13, lineHeight: 1.4, color: c.textMuted }}>
                    {hs.map((h, j) => (
                      <span key={j} style={{ color: ELEMENT_COLORS[h.element] || c.textMuted }}>
                        {h.stem}{j < hs.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </span>
                )}

                {/* Na Yin */}
                <span className="text-xs" style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.4 }}>
                  {naYin[pi]}
                </span>

                {/* Fortune stage (optional) */}
                {hasFortune && (
                  <span style={{ fontSize: 13, color: c.text, lineHeight: 1.4 }}>
                    {fortuneStages[pi]}
                  </span>
                )}

                {/* Self-sitting (optional) */}
                {hasSelfSitting && (
                  <span style={{ fontSize: 13, color: c.text, lineHeight: 1.4 }}>
                    {selfSitting![pi]}
                  </span>
                )}

                {/* Kong Wang */}
                <span style={{ fontSize: 13, color: "#C0392B", lineHeight: 1.4 }}>
                  空{getKongWang(p.stemIndex, p.branchIndex)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pillar relations between cards */}
        {pillarRelations && pillarRelations.length > 0 && (
          <div className="flex justify-center gap-1 mt-2">
            {pillarRelations.map((rel, idx) => {
              const info = RELATION_SYMBOLS[rel.type];
              if (!info) return null;
              return (
                <span key={idx} className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}28` }}>
                  {rel.pillars.map(p => ({ Year: "年", Month: "月", Day: "日", Hour: "时" })[p] || p).join("")}{info.sym}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== ③ Three Key Metrics Row ===== */}
      <div className="flex gap-2">
        {/* Day Pillar Grade */}
        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}10` }}>
          <div className="text-sm font-bold mb-1" style={{ color: c.textMuted }}>日柱等级</div>
          {dayPillarGrade ? (
            <>
              <div style={{ fontSize: 18, color: c.accent, lineHeight: 1.2 }}>
                {"★".repeat(dayPillarGrade.stars)}{"☆".repeat(5 - dayPillarGrade.stars)}
              </div>
              <div className="text-base font-semibold mt-0.5" style={{ color: c.text }}>{dayPillarGrade.grade}</div>
            </>
          ) : (
            <span className="text-sm" style={{ color: c.textMuted }}>—</span>
          )}
        </div>

        {/* Day Master Strength */}
        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}10` }}>
          <div className="text-sm font-bold mb-1" style={{ color: c.textMuted }}>身强身弱</div>
          {elementStrength ? (
            <>
              <div className="text-base font-semibold" style={{ fontSize: 15, color: c.text }}>
                {dmScore}
              </div>
              <div className="h-1.5 rounded-full mt-1 mx-2" style={{ background: `${c.primary}14` }}>
                <div className="h-full rounded-full" style={{
                  width: `${dmScore}%`,
                  background: dmScore >= 55 ? `linear-gradient(90deg, ${c.primary}, ${c.accent})` : `linear-gradient(90deg, ${c.primary}60, ${c.primary})`,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div className="text-base font-semibold mt-0.5" style={{ color: dmIsStrong ? "#E74C3C" : "#3498DB" }}>
                {dmIsStrong ? "身强" : "身弱"}
              </div>
            </>
          ) : (
            <span className="text-sm" style={{ color: c.textMuted }}>—</span>
          )}
        </div>

        {/* Chart Pattern */}
        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}10` }}>
          <div className="text-sm font-bold mb-1" style={{ color: c.textMuted }}>格局</div>
          {pattern ? (
            <>
              <span className="text-xs font-semibold px-2 py-0.5 rounded mb-1"
                style={{
                  fontSize: 13,
                  background: pattern.category === "standard" ? "#3498DB18" : pattern.category === "jianLu" ? "#2ECC7118" : "#E74C3C18",
                  color: pattern.category === "standard" ? "#3498DB" : pattern.category === "jianLu" ? "#2ECC71" : "#E74C3C",
                  border: `1px solid ${pattern.category === "standard" ? "#3498DB22" : pattern.category === "jianLu" ? "#2ECC7122" : "#E74C3C22"}`,
                }}>
                {pattern.name}
              </span>
              <div className="text-xs mt-1" style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.3 }}>
                {pattern.description.slice(0, 20)}
              </div>
            </>
          ) : (
            <span className="text-sm" style={{ color: c.textMuted }}>—</span>
          )}
        </div>
      </div>
    </div>
  );
}
