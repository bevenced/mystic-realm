"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

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
  tenGods: string[];
  naYin: string[];
  hiddenStems: HiddenStemData[][];
  dayMasterIndex: number;
  dayMasterElement: string;
  dayMasterYinYang: string;
  elementCounts: Record<string, number>;
  zodiac: string;
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
}: BaziChartProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const pillarLabels = [t.bazi.yearPillar, t.bazi.monthPillar, t.bazi.dayPillar, t.bazi.hourPillar];
  const rowLabels = [t.bazi.heavenlyStem, t.bazi.tenGod, t.bazi.earthlyBranch, t.bazi.hiddenStem, t.bazi.naYin];
  const maxElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];
  const elementTotal = Object.values(elementCounts).reduce((s, c) => s + c, 0);

  const elLabel = (elem: string) => (t.dailyFortune.elements as Record<string, string>)[elem] || elem;
  const zodiacName = (z: string) => {
    const name = z.split(" ")[0];
    return (t.dailyFortune.zodiacs as Record<string, string>)[name] || name;
  };
  const yy = (v: string) => (t.dailyFortune.yinYang as Record<string, string>)[v] || v;

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
          {yy(dayMasterYinYang)}
        </span>
        <div>
          <div className="text-xs" style={{ color: c.textMuted }}>
            {t.bazi.dayMaster}
          </div>
          <div className="text-sm font-bold" style={{ color: c.text }}>
            {t.bazi.dayMaster}: {yy(dayMasterYinYang)} {elLabel(dayMasterElement)} / {zodiacName(zodiac)}
          </div>
        </div>
      </div>

      {/* ── Four Pillars Table ── */}
      <div className="overflow-x-auto relative">
        {/* Corner brackets */}
        <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l rounded-tl" style={{ borderColor: `${c.primary}40` }} />
        <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t border-r rounded-tr" style={{ borderColor: `${c.primary}40` }} />
        <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-b border-l rounded-bl" style={{ borderColor: `${c.primary}40` }} />
        <span className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r rounded-br" style={{ borderColor: `${c.primary}40` }} />
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr] gap-px rounded-lg overflow-hidden" style={{ background: c.primary + "18" }}>
          {/* Column headers — first cell empty for row label column */}
          <div className="text-center py-2" style={{ background: `${c.primary}0D` }} />
          {pillarKeys.map((key, i) => (
            <div
              key={`hdr-${key}`}
              className="text-center py-2"
              style={{ background: `${c.primary}0D` }}
            >
              <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: c.primary }}>
                {pillarLabels[i]}
              </div>
            </div>
          ))}

          {/* Row 1: Heavenly Stems */}
          <div className="flex items-center justify-center py-2.5" style={{ background: `${c.primary}08` }}>
            <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{rowLabels[0]}</span>
          </div>
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
                  {isDayMaster ? "DM" : elLabel(p.stemElement)}
                </div>
              </div>
            );
          })}

          {/* Row 2: Ten Gods */}
          <div className="flex items-center justify-center py-1.5" style={{ background: `${c.primary}06` }}>
            <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{rowLabels[1]}</span>
          </div>
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

          {/* Row 3: Earthly Branches */}
          <div className="flex items-center justify-center py-2.5" style={{ background: `${c.primary}08` }}>
            <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{rowLabels[2]}</span>
          </div>
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
                  {zodiacName(p.zodiac)}
                </div>
              </div>
            );
          })}

          {/* Row 4: Hidden Stems (with qi) */}
          <div className="flex items-center justify-center py-1.5" style={{ background: `${c.primary}06` }}>
            <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{rowLabels[3]}</span>
          </div>
          {pillarKeys.map((key, i) => (
            <div
              key={`hs-${key}`}
              className="text-center py-1.5"
              style={{ background: key === "day" ? `${c.primary}0A` : "transparent" }}
            >
              <span className="text-[11px] leading-relaxed" style={{ color: c.textMuted }}>
                {hiddenStems[i] && hiddenStems[i].length > 0
                  ? hiddenStems[i].map((h) => `${h.stem}${h.qi ? h.qi[0] : ""}`).join(" ")
                  : "—"}
              </span>
            </div>
          ))}

          {/* Row 5: Na Yin */}
          <div className="flex items-center justify-center py-1.5" style={{ background: `${c.primary}06` }}>
            <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{rowLabels[4]}</span>
          </div>
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
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase" style={{ color: c.textMuted }}>
          <span className="inline-block w-1 h-1 rotate-45 rounded-sm flex-shrink-0" style={{ background: c.primary }} />
          {t.bazi.fiveElements}
        </div>
        <div className="flex h-3 rounded-full overflow-hidden">
          {Object.entries(elementCounts).map(([elem, count]) => (
            <div
              key={elem}
              title={`${elLabel(elem)}: ${count}`}
              style={{
                width: `${elementTotal > 0 ? (count / elementTotal) * 100 : 0}%`,
                background: ELEMENT_COLORS[elem],
                opacity: count > 0 ? 1 : 0.15,
              }}
            />
          ))}
        </div>
        <div className="flex gap-3 text-[10px] flex-wrap">
          {Object.entries(elementCounts).map(([elem, count]) => {
            const pct = elementTotal > 0 ? Math.round((count / elementTotal) * 100) : 0;
            return (
              <span key={elem} style={{ color: ELEMENT_COLORS[elem] }}>
                <span className="font-semibold">{elLabel(elem)}</span> {count}
                <span style={{ opacity: 0.7 }}>（{pct}%）</span>
                {maxElement && maxElement[0] === elem ? " ★" : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
