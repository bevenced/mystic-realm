"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { PillarRelation, DayPillarGradeResult, ElementStrengthResult, PatternResult, ShenShaResult } from "@/lib/bazi-engine";
import { FORTUNE_STAGE_INFO, getShenshaCategory } from "@/lib/bazi-engine";

export const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#5CB85C", Fire: "#D9534F", Earth: "#8B5A2B", Metal: "#F0AD4E", Water: "#428BCA",
};
const ELEMENT_LABELS: Record<string, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
const ELEMENT_KEYS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

function getKongWang(stemIndex: number, branchIndex: number): string {
  const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
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
  shenshaByPillar?: ShenShaResult[][];
}

const RELATION_SYMBOLS: Record<string, { sym: string; color: string }> = {
  combine: { sym: "合", color: "#2ECC71" },
  clash: { sym: "冲", color: "#E74C3C" },
  harm: { sym: "害", color: "#FF9800" },
  punish: { sym: "刑", color: "#9B59B6" },
  tripleCombine: { sym: "三合", color: "#3498DB" },
};

const QI_LABELS: Record<string, string> = { primary: "主气", secondary: "中气", tertiary: "余气" };

export default function BaziChart({
  pillars, naYin, hiddenStems, fortuneStages = [],
  dayMasterElement, dayMasterYinYang, elementCounts, zodiac,
  tenGods, tenGodElements, selfSitting,
  pillarRelations, dayPillarGrade, elementStrength, pattern, shenshaByPillar,
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

  const TABLE_HEAD_BG = "#8B6F47";
  const TABLE_ROW_ALT = "#FDFAF5";
  const TABLE_BORDER = "#E8DEC9";

  return (
    <div className="space-y-4" style={{ color: c.text }}>
      {/* ===== 1. Day Master & Element Summary Card ===== */}
      <div className="rounded-lg p-4" style={{ background: c.surface, border: `1px solid ${TABLE_BORDER}` }}>
        <div className="flex items-start gap-4 flex-wrap">
          {/* Day Master large display */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 36, fontWeight: 700, color: ELEMENT_COLORS[dayMasterElement] || c.text }}>
              {pillars.day.stem}
            </span>
            <div>
              <div className="text-xs" style={{ color: c.primary }}>日主</div>
              <div className="text-sm font-semibold" style={{ color: c.text }}>{dayMasterYinYang} {dayMasterElement} · {zodiac}</div>
            </div>
          </div>

          {/* Element distribution */}
          <div className="flex items-center gap-3 ml-auto">
            {ELEMENT_KEYS.map(el => {
              const pct = totalEl > 0 ? ((elementCounts?.[el] || 0) / totalEl) * 100 : 0;
              return (
                <div key={el} className="text-center">
                  <div className="text-xs font-semibold" style={{ color: ELEMENT_COLORS[el] }}>{ELEMENT_LABELS[el]}</div>
                  <div className="text-xs" style={{ color: c.textMuted }}>{pct.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 2. Four Pillars Table ===== */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${TABLE_BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 600 }}>
            {/* Header row */}
            <thead>
              <tr style={{ background: TABLE_HEAD_BG }}>
                {pillarKeys.map((key, pi) => (
                  <th key={key} className="px-3 py-2.5 text-center text-sm font-bold"
                    style={{
                      color: "#FFF",
                      background: key === "day" ? "#6B4E2E" : TABLE_HEAD_BG,
                      borderRight: pi < 3 ? `1px solid rgba(255,255,255,0.15)` : "none",
                    }}>
                    {pillarLabels[pi]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Heavenly Stems + Ten Gods */}
              <tr>
                {pillarKeys.map((key, pi) => {
                  const p = pillars[key];
                  const isDay = key === "day";
                  return (
                    <td key={key} className="px-2 py-2 text-center align-middle"
                      style={{
                        background: isDay ? "#FDF8F0" : TABLE_ROW_ALT,
                        borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                      }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: ELEMENT_COLORS[p.stemElement] || c.text, lineHeight: 1.2 }}>
                        {p.stem}
                      </div>
                      {tenGods && (
                        <div style={{ fontSize: 13, color: tenGodElements ? ELEMENT_COLORS[tenGodElements[pi]] || c.textMuted : c.textMuted, lineHeight: 1.3 }}>
                          {tenGods[pi]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Earthly Branches + Hidden Stems */}
              <tr>
                {pillarKeys.map((key, pi) => {
                  const p = pillars[key];
                  const hs = hiddenStems[pi] || [];
                  const isDay = key === "day";
                  return (
                    <td key={key} className="px-2 py-2 text-center align-middle"
                      style={{
                        borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                      }}>
                      <div style={{ fontSize: 20, fontWeight: 600, color: ELEMENT_COLORS[p.branchElement] || c.text, lineHeight: 1.2 }}>
                        {p.branch}
                      </div>
                      {hs.length > 0 && (
                        <div className="flex flex-col items-center mt-0.5" style={{ gap: 0 }}>
                          {hs.map((h, j) => (
                            <span key={j} style={{ fontSize: 12, color: ELEMENT_COLORS[h.element] || c.textMuted, lineHeight: 1.4 }}>
                              {h.stem}{h.qi !== "primary" ? <span style={{ fontSize: 10 }}>{QI_LABELS[h.qi]}</span> : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Na Yin */}
              <tr>
                {pillarKeys.map((key, pi) => (
                  <td key={key} className="px-2 py-1.5 text-center text-xs" style={{
                    color: c.textMuted,
                    background: TABLE_ROW_ALT,
                    borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                  }}>
                    {naYin[pi]}
                  </td>
                ))}
              </tr>

              {/* Row 4: Fortune Stages (星运) */}
              {hasFortune && (
                <tr>
                  {pillarKeys.map((key, pi) => {
                    const fs = fortuneStages[pi];
                    const info = FORTUNE_STAGE_INFO[fs];
                    return (
                      <td key={key} className="px-2 py-1.5 text-center text-xs" style={{
                        color: info?.quality === "auspicious" ? "#5CB85C" : info?.quality === "sinister" ? "#D9534F" : c.textMuted,
                        borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                      }}>
                        {fs}{info ? <span style={{ fontSize: 10, marginLeft: 2 }}>({info.en})</span> : ""}
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Row 5: Self Sitting (自坐十二运) */}
              {hasSelfSitting && (
                <tr>
                  {pillarKeys.map((key, pi) => {
                    const ss = selfSitting![pi];
                    const info = FORTUNE_STAGE_INFO[ss];
                    return (
                      <td key={key} className="px-2 py-1.5 text-center text-xs" style={{
                        color: info?.quality === "auspicious" ? "#5CB85C" : info?.quality === "sinister" ? "#D9534F" : c.textMuted,
                        background: TABLE_ROW_ALT,
                        borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                      }}>
                        自坐{ss}
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Row 6: Kong Wang (空亡) */}
              <tr>
                {pillarKeys.map((key, pi) => {
                  const p = pillars[key];
                  const kw = getKongWang(p.stemIndex, p.branchIndex);
                  return (
                    <td key={key} className="px-2 py-1.5 text-center text-xs" style={{
                      color: "#C0392B",
                      borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                    }}>
                      空{kw}
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Shen Sha tags */}
              {shenshaByPillar && shenshaByPillar.some(ss => ss.length > 0) && (
                <tr>
                  {pillarKeys.map((key, pi) => {
                    const stars = shenshaByPillar[pi] || [];
                    return (
                      <td key={key} className="px-2 py-1.5 text-center" style={{
                        background: TABLE_ROW_ALT,
                        borderRight: pi < 3 ? `1px solid ${TABLE_BORDER}` : "none",
                      }}>
                        {stars.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-1">
                            {stars.map((s) => {
                              const sc = s.type === "auspicious" ? "#5CB85C" : s.type === "sinister" ? "#D9534F" : "#888";
                              return (
                                <span key={s.name} className="text-xs px-1.5 py-0.5 rounded" style={{
                                  fontSize: 11,
                                  background: `${sc}14`,
                                  color: sc,
                                  border: `1px solid ${sc}28`,
                                }}>{s.name}</span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: c.textMuted }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 3. Pillar Relations Bar ===== */}
      {pillarRelations && pillarRelations.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {pillarRelations.map((rel, idx) => {
            const info = RELATION_SYMBOLS[rel.type];
            if (!info) return null;
            const labelMap: Record<string, string> = { Year: "年", Month: "月", Day: "日", Hour: "时" };
            return (
              <span key={idx} className="text-xs font-semibold px-2 py-1 rounded"
                style={{ background: `${info.color}14`, color: info.color, border: `1px solid ${info.color}28` }}>
                {rel.pillars.map((p: string) => labelMap[p] || p).join("")}{info.sym}
              </span>
            );
          })}
        </div>
      )}

      {/* ===== 4. Three Key Metrics ===== */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${TABLE_BORDER}` }}>
          <div className="text-xs font-semibold mb-1" style={{ color: c.textMuted }}>日柱等级</div>
          {dayPillarGrade ? (
            <>
              <div style={{ fontSize: 16, color: "#F0AD4E", lineHeight: 1.2 }}>
                {"★".repeat(dayPillarGrade.stars)}{"☆".repeat(5 - dayPillarGrade.stars)}
              </div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: c.text }}>{dayPillarGrade.grade}</div>
            </>
          ) : (<span className="text-xs" style={{ color: c.textMuted }}>—</span>)}
        </div>

        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${TABLE_BORDER}` }}>
          <div className="text-xs font-semibold mb-1" style={{ color: c.textMuted }}>身强身弱</div>
          {elementStrength ? (
            <>
              <div className="text-sm font-semibold" style={{ color: c.text }}>{dmScore}</div>
              <div className="h-1.5 rounded-full mt-1 mx-2" style={{ background: `${c.primary}14` }}>
                <div className="h-full rounded-full" style={{ width: `${dmScore}%`, background: dmScore >= 55 ? `linear-gradient(90deg, ${c.primary}, ${c.accent})` : `linear-gradient(90deg, ${c.primary}60, ${c.primary})` }} />
              </div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: dmIsStrong ? "#D9534F" : "#428BCA" }}>
                {dmIsStrong ? "身强" : "身弱"}
              </div>
            </>
          ) : (<span className="text-xs" style={{ color: c.textMuted }}>—</span>)}
        </div>

        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: c.surface, border: `1px solid ${TABLE_BORDER}` }}>
          <div className="text-xs font-semibold mb-1" style={{ color: c.textMuted }}>格局</div>
          {pattern ? (
            <>
              <span className="text-xs font-semibold px-2 py-0.5 rounded mb-1 inline-block" style={{
                background: pattern.category === "standard" ? "#428BCA18" : pattern.category === "jianLu" ? "#5CB85C18" : "#D9534F18",
                color: pattern.category === "standard" ? "#428BCA" : pattern.category === "jianLu" ? "#5CB85C" : "#D9534F",
                border: `1px solid ${pattern.category === "standard" ? "#428BCA22" : pattern.category === "jianLu" ? "#5CB85C22" : "#D9534F22"}`,
              }}>{pattern.name}</span>
              <div className="text-xs mt-1" style={{ color: c.textMuted }}>{pattern.description.slice(0, 20)}</div>
            </>
          ) : (<span className="text-xs" style={{ color: c.textMuted }}>—</span>)}
        </div>
      </div>
    </div>
  );
}
