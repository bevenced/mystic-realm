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
    <div className="space-y-3" style={{ marginBottom: 32 }}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "#F0AD4E" }} />
          <span className="text-base font-bold" style={{ color: "#3A2F26" }}>{title}</span>
        </div>
        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>

      {/* Card body */}
      <div className="rounded-lg p-5" style={{
        background: "#FFFFFF",
        border: "1px solid #F0EBE3",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <div className="space-y-3">
          {items.map((item) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            const barWidth = (item.value / max) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3 group">
                <span className="text-xs font-semibold w-8 shrink-0 text-right" style={{ color: item.color }}>
                  {item.label}
                </span>
                <span className="text-xs font-semibold w-14 shrink-0 text-right" style={{ color: item.color }}>
                  {pct.toFixed(1)}%
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden relative" style={{ background: "#F5F0E8" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${Math.max(barWidth, pct > 0 ? 1 : 0)}%`,
                    background: item.color,
                    minWidth: pct > 0 ? "2px" : 0,
                  }} />
                </div>
                {item.subLabel && (
                  <span className="text-xs w-10 shrink-0" style={{ color: "#888888" }}>{item.subLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        {description && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded" style={{ background: "#FFF8E1" }}>
            <span className="text-xs mt-0.5" style={{ color: "#F0AD4E" }}>💡</span>
            <p className="text-xs leading-relaxed" style={{ color: "#5D4037" }}>{description}</p>
          </div>
        )}

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
