"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { ShenShaResult } from "@/lib/bazi-engine";

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50", Fire: "#FF5722", Earth: "#FFC107", Metal: "#909090", Water: "#42A5F5",
};
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
  shenshaByPillar?: ShenShaResult[][];
  dayMasterIndex: number;
  dayMasterElement: string;
  dayMasterYinYang: string;
  elementCounts: Record<string, number>;
  zodiac: string;
  tenGods?: string[];
  tenGodElements?: string[];
  selfSitting?: string[];
}

export default function BaziChart({ pillars, naYin, hiddenStems, fortuneStages = [], shenshaByPillar = [[], [], [], []], dayMasterIndex, dayMasterElement, dayMasterYinYang, elementCounts, zodiac, tenGods, tenGodElements, selfSitting }: BaziChartProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const pillarLabels = ["年柱", "月柱", "日柱", "时柱"];
  const hasShensha = shenshaByPillar.some(arr => arr.length > 0);
  const hasFortune = fortuneStages.length === 4;
  const hasSelfSitting = selfSitting && selfSitting.length === 4;
  const elementLabels: Record<string, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
  const elementKeys = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
  const totalEl = elementKeys.reduce((s, k) => s + (elementCounts?.[k] || 0), 0);
  const maxEl = Math.max(...elementKeys.map(k => elementCounts?.[k] || 0), 1);

  // Table row data
  const tableRows: { label: string; render: (key: keyof typeof pillars, i: number) => React.ReactNode }[] = [
    {
      label: "天干",
      render: (key) => {
        const p = pillars[key];
        return (
          <span style={{ fontSize: 18, fontWeight: 700, color: ELEMENT_COLORS[p.stemElement] }}>
            {p.stem}
          </span>
        );
      },
    },
    ...(tenGods && tenGodElements ? [{
      label: "十神",
      render: (_key: keyof typeof pillars, i: number) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: ELEMENT_COLORS[tenGodElements[i]] || c.text }}>
          {tenGods[i]}
        </span>
      ),
    }] : []),
    {
      label: "地支",
      render: (key) => {
        const p = pillars[key];
        return (
          <span style={{ fontSize: 18, fontWeight: 700, color: ELEMENT_COLORS[p.branchElement] }}>
            {p.branch}
          </span>
        );
      },
    },
    {
      label: "藏干",
      render: (_key, i) => {
        const hs = hiddenStems[i] || [];
        if (hs.length === 0) return <span style={{ fontSize: 11, color: c.textMuted }}>—</span>;
        return (
          <span style={{ fontSize: 11, letterSpacing: 1 }}>
            {hs.map((h, j) => (
              <span key={j} style={{ color: ELEMENT_COLORS[h.element] || c.textMuted }}>
                {h.stem}{j < hs.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        );
      },
    },
    {
      label: "纳音",
      render: (_, i) => (
        <span style={{ fontSize: 12, color: c.textMuted }}>{naYin[i]}</span>
      ),
    },
    ...(hasFortune ? [{
      label: "星运",
      render: (_key: keyof typeof pillars, i: number) => (
        <span style={{ fontSize: 12, color: c.text }}>{fortuneStages[i]}</span>
      ),
    }] : []),
    ...(hasSelfSitting ? [{
      label: "自坐",
      render: (_key: keyof typeof pillars, i: number) => (
        <span style={{ fontSize: 12, color: c.text }}>{selfSitting![i]}</span>
      ),
    }] : []),
    {
      label: "空亡",
      render: (key, i) => {
        const p = pillars[key];
        return (
          <span style={{ fontSize: 12, color: "#C0392B" }}>
            {getKongWang(p.stemIndex, p.branchIndex)}
          </span>
        );
      },
    },
    ...(hasShensha ? [{
      label: "神煞",
      render: (_key: keyof typeof pillars, i: number) => {
        const stars = shenshaByPillar[i] || [];
        if (stars.length === 0) return <span style={{ fontSize: 11, color: c.textMuted }}>—</span>;
        return (
          <div className="flex flex-wrap gap-0.5">
            {stars.slice(0, 5).map((s) => (
              <span key={s.name}
                style={{
                  fontSize: 10, padding: "0 3px", borderRadius: 2,
                  background: s.type === "auspicious" ? "#2ECC7118" : s.type === "sinister" ? "#E74C3C18" : "#FFC10718",
                  color: s.type === "auspicious" ? "#2ECC71" : s.type === "sinister" ? "#E74C3C" : "#FFC107",
                }}>
                {s.name.replace(/[吉凶]/g, "")}
              </span>
            ))}
          </div>
        );
      },
    }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Day Master identifier */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: c.primary }}>
          日主:{" "}
          <span style={{ color: ELEMENT_COLORS[dayMasterElement] }}>
            {dayMasterYinYang}{dayMasterElement}
          </span>
        </span>
        <span className="text-xs" style={{ color: c.textMuted }}>
          ({zodiac})
        </span>
      </div>

      {/* Four Pillars Table */}
      <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${c.primary}20` }}>
        <table className="w-full text-center" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: c.primary }}>
              <th style={{ padding: "6px 8px", color: "#FFF", fontSize: 12, fontWeight: 600, borderRight: `1px solid ${c.primary}30` }}>
                四柱
              </th>
              {pillarLabels.map((label, i) => (
                <th key={label} style={{
                  padding: "6px 8px", color: "#FFF", fontSize: 12, fontWeight: 600,
                  borderLeft: i > 0 ? `1px solid ${c.primary}30` : "none",
                }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={row.label}
                style={{
                  background: ri % 2 === 0 ? "#FFF" : "#F5F0E8",
                  borderTop: `1px solid ${c.primary}10`,
                }}>
                <td style={{
                  padding: "5px 8px", fontSize: 11, fontWeight: 600,
                  color: c.primary, whiteSpace: "nowrap",
                  borderRight: `1px solid ${c.primary}10`,
                }}>
                  {row.label}
                </td>
                {pillarKeys.map((key, ci) => (
                  <td key={key} style={{
                    padding: "5px 8px", minWidth: 64,
                    borderLeft: ci > 0 ? `1px solid ${c.primary}08` : "none",
                  }}>
                    {row.render(key, ci)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Element Distribution */}
      <div className="rounded-lg p-4" style={{ background: c.surface, border: `1px solid ${c.primary}10` }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
          <span className="text-[11px] font-bold tracking-wider" style={{ color: c.textMuted }}>五行分布</span>
        </div>
        <div className="flex items-end justify-around px-1">
          {elementKeys.map((el) => {
            const count = elementCounts?.[el] || 0;
            const pct = totalEl > 0 ? (count / totalEl) * 100 : 0;
            const barH = maxEl > 0 ? Math.max(20, (count / maxEl) * 100) : 20;
            return (
              <div key={el} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                <span className="text-[11px] font-bold" style={{ color: ELEMENT_COLORS[el] }}>
                  {pct.toFixed(0)}%
                </span>
                <div className="w-full rounded-t-md" style={{
                  height: barH,
                  background: `linear-gradient(to top, ${ELEMENT_COLORS[el]} 0%, ${ELEMENT_COLORS[el]}80 100%)`,
                  borderRadius: "4px 4px 0 0",
                  minWidth: 24,
                  maxWidth: 44,
                  transition: "height 0.5s ease",
                }} />
                <span className="text-[11px]" style={{ color: c.textMuted }}>
                  {elementLabels[el]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
