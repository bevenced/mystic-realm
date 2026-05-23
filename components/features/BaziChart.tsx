"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50",
  Fire: "#FF5722",
  Earth: "#FFC107",
  Metal: "#B0B0B0",
  Water: "#42A5F5",
};

const ELEMENT_BG: Record<string, string> = {
  Wood: "#4CAF5018",
  Fire: "#FF572218",
  Earth: "#FFC10718",
  Metal: "#B0B0B018",
  Water: "#42A5F518",
};

const COLUMN_LABELS = ["年柱 Year", "月柱 Month", "日柱 Day", "时柱 Hour"];

interface PillarData {
  stem: string;
  stemIndex: number;
  branch: string;
  branchIndex: number;
  stemElement: string;
  branchElement: string;
  zodiac: string;
}

interface HiddenStemData {
  stem: string;
  stemIndex: number;
  qi: string;
  element: string;
}

interface BaziChartProps {
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
  };
  tenGods: string[];       // 4 strings, day pillar is "日主" or similar
  naYin: string[];          // 4 strings
  hiddenStems: HiddenStemData[][]; // 4 arrays
  dayMasterIndex: number;
  dayMasterElement: string;
  dayMasterYinYang: string;
  elementCounts: Record<string, number>;
  zodiac: string;
  locale?: string;
}

export default function BaziChart({
  pillars,
  tenGods,
  naYin,
  hiddenStems,
  dayMasterIndex,
  dayMasterElement,
  dayMasterYinYang,
  elementCounts,
  zodiac,
  locale,
}: BaziChartProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isZh = locale === "zh-CN" || locale === "zh-TW";

  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const maxElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      {/* ── Day Master Summary ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ background: `${c.primary}0A`, border: `1px solid ${c.primary}14` }}
      >
        <span
          className="text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full"
          style={{
            color: ELEMENT_COLORS[dayMasterElement],
            background: ELEMENT_BG[dayMasterElement],
          }}
        >
          {dayMasterYinYang === "Yang" ? "阳" : "阴"}
        </span>
        <div>
          <div className="text-xs" style={{ color: c.textMuted }}>
            {isZh ? "日主" : "Day Master"}
          </div>
          <div className="text-sm font-bold" style={{ color: c.text }}>
            {isZh ? "日主" : "Day Master"}: {dayMasterYinYang} {dayMasterElement} / {zodiac}
          </div>
        </div>
      </div>

      {/* ── Four Pillars Table ── */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-4 gap-px rounded-lg overflow-hidden" style={{ background: c.primary + "18" }}>
          {/* Column headers */}
          {pillarKeys.map((key, i) => (
            <div
              key={`hdr-${key}`}
              className="text-center py-2"
              style={{ background: `${c.primary}0D` }}
            >
              <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: c.primary }}>
                {isZh ? COLUMN_LABELS[i].split(" ")[0] : COLUMN_LABELS[i]}
              </div>
            </div>
          ))}

          {/* Heavenly Stems */}
          {pillarKeys.map((key, i) => {
            const p = pillars[key];
            const isDayMaster = key === "day";
            return (
              <div
                key={`stem-${key}`}
                className="text-center py-2.5"
                style={{
                  background: isDayMaster ? `${c.primary}0F` : c.surface,
                  borderBottom: isDayMaster ? `2px solid ${c.primary}` : "1px solid transparent",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: ELEMENT_COLORS[p.stemElement] }}
                >
                  {p.stem}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>
                  {isDayMaster ? (isZh ? "日主" : "DM") : p.stemElement}
                </div>
              </div>
            );
          })}

          {/* Ten Gods */}
          {pillarKeys.map((key, i) => (
            <div
              key={`tg-${key}`}
              className="text-center py-1.5"
              style={{ background: key === "day" ? `${c.primary}0A` : "transparent" }}
            >
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: key === "day" ? c.primary : c.textMuted,
                  background: key === "day" ? `${c.primary}12` : "transparent",
                }}
              >
                {tenGods[i] || "—"}
              </span>
            </div>
          ))}

          {/* Earthly Branches */}
          {pillarKeys.map((key, i) => {
            const p = pillars[key];
            return (
              <div
                key={`br-${key}`}
                className="text-center py-2.5"
                style={{ background: c.surface }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: ELEMENT_COLORS[p.branchElement] }}
                >
                  {p.branch}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>
                  {p.zodiac.replace(/ [^ ]+$/, "")}
                </div>
              </div>
            );
          })}

          {/* Hidden Stems */}
          {pillarKeys.map((key, i) => (
            <div
              key={`hs-${key}`}
              className="text-center py-1.5"
              style={{ background: key === "day" ? `${c.primary}0A` : "transparent" }}
            >
              <span className="text-[11px]" style={{ color: c.textMuted }}>
                {hiddenStems[i] && hiddenStems[i].length > 0
                  ? hiddenStems[i].map((h) => h.stem).join(" ")
                  : "—"}
              </span>
            </div>
          ))}

          {/* Na Yin */}
          {pillarKeys.map((key, i) => (
            <div
              key={`ny-${key}`}
              className="text-center py-1.5"
              style={{ background: `${c.primary}08` }}
            >
              <span className="text-[10px]" style={{ color: c.textMuted }}>
                {naYin[i] || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Five Elements Bar ── */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: c.textMuted }}>
          {isZh ? "五行分布" : "Five Elements"}
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          {Object.entries(elementCounts).map(([elem, count]) => (
            <div
              key={elem}
              title={`${elem}: ${count}`}
              style={{
                width: `${(count / 8) * 100}%`,
                background: ELEMENT_COLORS[elem],
                opacity: count > 0 ? 1 : 0.2,
              }}
            />
          ))}
        </div>
        <div className="flex gap-3 text-[10px]">
          {Object.entries(elementCounts).map(([elem, count]) => (
            <span key={elem} style={{ color: ELEMENT_COLORS[elem] }}>
              {elem} {count}
              {maxElement && maxElement[0] === elem ? " ★" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
