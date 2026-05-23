"use client";

const ELEMENT_COLORS: Record<string, string> = {
  metal: "#D4C5A9",
  wood: "#7BAE7F",
  water: "#6A8EB0",
  fire: "#D4675B",
  earth: "#B8915A",
};

const ELEMENTS = [
  { char: "金", key: "metal", angle: 270 },
  { char: "木", key: "wood", angle: 342 },
  { char: "水", key: "water", angle: 54 },
  { char: "火", key: "fire", angle: 126 },
  { char: "土", key: "earth", angle: 198 },
] as const;

const BAGUA: { trigram: [number, number, number]; angle: number }[] = [
  { trigram: [1, 1, 1], angle: 22.5 },   // ☰乾 Heaven
  { trigram: [0, 1, 1], angle: 67.5 },   // ☱兑 Lake
  { trigram: [1, 0, 1], angle: 112.5 },  // ☲离 Fire
  { trigram: [0, 0, 1], angle: 157.5 },  // ☳震 Thunder
  { trigram: [1, 1, 0], angle: 202.5 },  // ☴巽 Wind
  { trigram: [0, 1, 0], angle: 247.5 },  // ☵坎 Water
  { trigram: [1, 0, 0], angle: 292.5 },  // ☶艮 Mountain
  { trigram: [0, 0, 0], angle: 337.5 },  // ☷坤 Earth
];

// Stars at outer edge: deterministic positions
const STARS = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 7 + 1;
  const rng = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };
  const angle = rng(seed) * 360;
  const radius = 130 + rng(seed + 3) * 55;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    x: 200 + Math.cos(rad) * radius,
    y: 200 + Math.sin(rad) * radius,
    r: 1 + rng(seed + 7) * 2.5,
    delay: rng(seed + 11) * 5,
    duration: 2 + rng(seed + 13) * 3,
  };
});

// Constellation lines connecting nearby stars
const LINES = (() => {
  const lines: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
  const seed = 42;
  const rng = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };
  for (let i = 0; i < STARS.length; i++) {
    for (let j = i + 1; j < STARS.length; j++) {
      const dx = STARS[i].x - STARS[j].x;
      const dy = STARS[i].y - STARS[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 45 && rng(seed + i * 3 + j * 7) > 0.7 && lines.length < 14) {
        lines.push({
          x1: STARS[i].x,
          y1: STARS[i].y,
          x2: STARS[j].x,
          y2: STARS[j].y,
          delay: rng(seed + i + j * 2) * 4,
        });
      }
    }
  }
  return lines;
})();

function YaoLine({ solid, y }: { solid: number; y: number }) {
  if (solid) {
    return (
      <line x1="-9" y1={y} x2="9" y2={y} stroke="#c5a170" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
    );
  }
  return (
    <>
      <line x1="-9" y1={y} x2="-2" y2={y} stroke="#c5a170" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
      <line x1="2" y1={y} x2="9" y2={y} stroke="#c5a170" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
    </>
  );
}

export default function CosmicMandala() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ maxWidth: "110%", maxHeight: "110%" }}
      >
        <defs>
          <radialGradient id="mandala-glow">
            <stop offset="0%" stopColor="#c5a170" stopOpacity="0.07" />
            <stop offset="50%" stopColor="#c5a170" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#c5a170" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="center-glow">
            <stop offset="0%" stopColor="#c5a170" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#c5a170" stopOpacity="0" />
          </radialGradient>
          <style>{`
            @keyframes cm-twinkle {
              0%, 100% { opacity: 0; transform: scale(0.6); transform-origin: center; }
              30% { opacity: 1; transform: scale(1); }
              70% { opacity: 0.4; transform: scale(0.9); }
            }
            @keyframes cm-line-pulse {
              0%, 100% { opacity: 0; }
              50% { opacity: 0.25; }
            }
            @keyframes cm-bagua-breathe {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            @keyframes cm-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
            .cm-taiji {
              animation: cm-rotate-slow 30s linear infinite;
              transform-origin: 200px 200px;
            }
            @keyframes cm-rotate-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </defs>

        {/* Background glow */}
        <circle cx="200" cy="200" r="195" fill="url(#mandala-glow)" />
        <circle cx="200" cy="200" r="60" fill="url(#center-glow)" />

        {/* Constellation lines */}
        {LINES.map((line, i) => (
          <line
            key={`l${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#c5a170"
            strokeWidth="0.25"
            strokeDasharray="1 2"
            style={{
              animation: `cm-line-pulse ${2 + (i % 3)}s ease-in-out ${line.delay}s infinite`,
            }}
          />
        ))}

        {/* Stars */}
        {STARS.map((star) => (
          <g key={`s${star.id}`}>
            {/* Glow */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 3}
              fill="#c5a170"
              style={{
                animation: `cm-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
            {/* Core */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 0.6}
              fill="#fff8ee"
              style={{
                animation: `cm-twinkle ${star.duration}s ease-in-out ${star.delay + 0.3}s infinite`,
              }}
            />
          </g>
        ))}

        {/* Orbit rings */}
        <circle
          cx="200" cy="200" r="72"
          fill="none" stroke="#c5a170" strokeWidth="0.3"
          strokeDasharray="2 4" opacity="0.12"
        />
        <circle
          cx="200" cy="200" r="104"
          fill="none" stroke="#c5a170" strokeWidth="0.3"
          strokeDasharray="2 4" opacity="0.12"
        />
        <circle
          cx="200" cy="200" r="140"
          fill="none" stroke="#c5a170" strokeWidth="0.15"
          strokeDasharray="1 6" opacity="0.08"
        />

        {/* ===== Bagua ring (内环) ===== */}
        {BAGUA.map((b, i) => (
          <g
            key={`b${i}`}
            transform={`rotate(${b.angle}, 200, 200) translate(0, -72)`}
            style={{
              animation: `cm-bagua-breathe 5s ease-in-out ${i * 0.3}s infinite`,
            }}
          >
            {/* yao lines from bottom (y=5) to top (y=-7) */}
            <YaoLine solid={b.trigram[0]} y={5} />
            <YaoLine solid={b.trigram[1]} y={-1} />
            <YaoLine solid={b.trigram[2]} y={-7} />
          </g>
        ))}

        {/* ===== Five Elements ring (外环) ===== */}
        {ELEMENTS.map((el, i) => (
          <g
            key={`e${i}`}
            transform={`rotate(${el.angle}, 200, 200) translate(0, -104)`}
            style={{
              animation: `cm-float 7s ease-in-out ${i * 0.5}s infinite`,
            }}
          >
            <text
              x="0" y="0"
              textAnchor="middle"
              dominantBaseline="central"
              fill={ELEMENT_COLORS[el.key]}
              fontSize="15"
              fontWeight="700"
              fontFamily="Georgia, 'Noto Serif SC', 'Songti SC', serif"
              letterSpacing="0.02em"
            >
              {el.char}
            </text>
          </g>
        ))}

        {/* ===== Taiji (太极) ===== */}
        <g className="cm-taiji">
          {/* Yang half — white */}
          <path
            d="M 200 152 A 48 48 0 0 1 200 248 A 24 24 0 0 0 200 200 A 24 24 0 0 1 200 152 Z"
            fill="#ffffff"
          />
          {/* Yin half — dark */}
          <path
            d="M 200 152 A 24 24 0 0 0 200 200 A 24 24 0 0 1 200 248 A 48 48 0 0 0 200 152 Z"
            fill="#4a3525"
          />
          {/* Yin dot in Yang (dark dot in white) */}
          <circle cx="200" cy="176" r="7" fill="#4a3525" />
          {/* Yang dot in Yin (white dot in dark) */}
          <circle cx="200" cy="224" r="7" fill="#ffffff" />
        </g>

        {/* Subtle gold ring around Taiji */}
        <circle
          cx="200" cy="200" r="50"
          fill="none" stroke="#c5a170" strokeWidth="0.5"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
