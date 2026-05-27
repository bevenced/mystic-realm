"use client";

interface BarItem {
  label: string;
  value: number;
  color: string;
  subLabel?: string;
}

interface ElementBarsProps {
  title: string;
  items: BarItem[];
  description?: string;
  maxValue?: number;
}

export default function ElementBars({ title, items, description, maxValue }: ElementBarsProps) {
  const max = maxValue ?? Math.max(...items.map(i => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "#5D4E37" }}>{title}</span>
        <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>

      <div className="rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid #E8DEC9" }}>
        <div className="space-y-2">
          {items.map((item) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            const barWidth = (item.value / max) * 100;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-10 shrink-0 text-right" style={{ color: item.color }}>
                  {item.label}
                </span>
                <div className="flex-1 h-5 rounded-full overflow-hidden relative" style={{ background: "#F5F0E8" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${Math.max(barWidth, pct > 0 ? 2 : 0)}%`,
                    background: item.color,
                    minWidth: pct > 0 ? "4px" : 0,
                  }} />
                </div>
                <span className="text-xs font-semibold w-12 shrink-0" style={{ color: item.color }}>
                  {pct.toFixed(1)}%
                </span>
                {item.subLabel && (
                  <span className="text-xs w-10 shrink-0" style={{ color: "#888888" }}>{item.subLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        {description && (
          <div className="mt-3 flex items-start gap-2 p-2 rounded" style={{ background: "#FBF8F2" }}>
            <span className="text-xs mt-0.5">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
