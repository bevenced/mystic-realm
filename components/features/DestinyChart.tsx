"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useRef, useEffect } from "react";

interface DaYunCycle {
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  stemElement: string;
  branchElement: string;
  isCurrent: boolean;
}

interface DestinyChartProps {
  cycles: DaYunCycle[];
  currentAge?: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50",
  Fire: "#FF5722",
  Earth: "#FFC107",
  Metal: "#9E9E9E",
  Water: "#2196F3",
};

export default function DestinyChart({ cycles, currentAge }: DestinyChartProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = currentTheme.isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cycles.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 20, bottom: 30, left: 40, right: 20 };
    const chartW = W - pad.left - pad.right;
    const barH = 28;
    const gap = 6;
    const startY = pad.top;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 8);
    ctx.fill();

    if (cycles.length === 0) return;

    // Find min/max ages for scaling
    const minAge = cycles[0].startAge;
    const maxAge = cycles[cycles.length - 1].endAge;
    const ageRange = maxAge - minAge || 80;

    cycles.forEach((cycle, i) => {
      const x = pad.left + ((cycle.startAge - minAge) / ageRange) * chartW;
      const w = ((cycle.endAge - cycle.startAge) / ageRange) * chartW;
      const y = startY + i * (barH + gap);

      // Bar
      const color = ELEMENT_COLORS[cycle.branchElement] || c.primary;
      ctx.fillStyle = cycle.isCurrent ? color : color + "60";
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(w, 8), barH, 4);
      ctx.fill();

      // Current cycle glow
      if (cycle.isCurrent) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color + "30";
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, Math.max(w, 8) + 4, barH + 4, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Label
      ctx.fillStyle = isDark ? "#fff" : "#333";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      const label = cycle.stem + cycle.branch;
      ctx.fillText(label, x + w / 2, y + barH / 2 + 4);

      // Age range label
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
      ctx.font = "9px system-ui, sans-serif";
      const ageLabel = `${cycle.startAge}-${cycle.endAge}`;
      ctx.textAlign = "center";
      ctx.fillText(ageLabel, x + w / 2, y + barH + 14);
    });

    // Current age marker
    if (currentAge !== undefined) {
      const ageX = pad.left + ((currentAge - minAge) / ageRange) * chartW;
      if (ageX >= pad.left && ageX <= W - pad.right) {
        ctx.strokeStyle = c.primary;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ageX, pad.top - 5);
        ctx.lineTo(ageX, startY + cycles.length * (barH + gap));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = c.primary;
        ctx.font = "9px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${t.dashboard.nowAge} (${currentAge})`, ageX, pad.top - 8);
      }
    }
  }, [cycles, currentAge, c.primary, isDark, t]);

  if (cycles.length === 0) {
    return (
      <div className="p-6 rounded-xl text-center text-sm" style={{ color: c.textMuted, backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
        {t.dashboard.noDestinyChart}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📈</span>
        <span className="text-sm font-semibold" style={{ color: c.text }}>{t.dashboard.daYunTitle}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ height: `${Math.max(160, cycles.length * 40 + 40)}px`, backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}
      />
      <div className="flex gap-3 mt-2 text-[10px]" style={{ color: c.textMuted }}>
        {Object.entries(ELEMENT_COLORS).map(([el, color]) => (
          <span key={el} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            {el}
          </span>
        ))}
      </div>
    </div>
  );
}
