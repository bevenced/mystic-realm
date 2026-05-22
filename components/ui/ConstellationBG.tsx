"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface Star {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
  duration: number;
}

interface Line {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

// Deterministic pseudo-random based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: seededRandom(i * 7 + 1) * 100,
      y: seededRandom(i * 13 + 3) * 100,
      r: 1 + seededRandom(i * 17 + 5) * 3,
      delay: seededRandom(i * 19 + 7) * 4,
      duration: 2 + seededRandom(i * 23 + 9) * 3,
    });
  }
  return stars;
}

function generateLines(stars: Star[], count: number): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(seededRandom(i * 11 + 2) * stars.length);
    let b = Math.floor(seededRandom(i * 31 + 5) * stars.length);
    if (b === a) b = (a + 1) % stars.length;
    const dx = stars[a].x - stars[b].x;
    const dy = stars[a].y - stars[b].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 35) {
      lines.push({
        id: i,
        x1: stars[a].x,
        y1: stars[a].y,
        x2: stars[b].x,
        y2: stars[b].y,
        delay: seededRandom(i * 37 + 6) * 5,
      });
    }
  }
  return lines;
}

const STARS = generateStars(38);
const LINES = generateLines(STARS, 18);

export default function ConstellationBG() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let angle = 0;
    let raf: number;
    const animate = () => {
      angle += 0.008;
      svg.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute"
        style={{
          width: "140%",
          height: "140%",
          top: "-20%",
          left: "-20%",
          transformOrigin: "center center",
        }}
      >
        <defs>
          <style>{`
            @keyframes linePulse {
              0%, 100% { opacity: 0.25; }
              50% { opacity: 1; }
            }
            @keyframes starTwinkle {
              0%, 100% { opacity: 0.2; }
              40% { opacity: 1; }
              70% { opacity: 0.4; }
            }
          `}</style>
        </defs>

        {/* Constellation lines */}
        {LINES.map((line) => (
          <line
            key={`l${line.id}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={c.primary}
            strokeWidth="0.08"
            strokeDasharray="0.6 1.2"
            opacity="0.3"
            style={{
              animation: `linePulse ${3 + line.delay * 0.7}s ease-in-out infinite`,
              animationDelay: `${line.delay}s`,
            }}
          />
        ))}

        {/* Orbital ring — large subtle circle */}
        <ellipse
          cx="50"
          cy="50"
          rx="38"
          ry="38"
          fill="none"
          stroke={c.primary}
          strokeWidth="0.05"
          strokeDasharray="1 3"
          opacity="0.08"
        />

        {/* Stars */}
        {STARS.map((star) => (
          <g key={`s${star.id}`}>
            {/* Glow halo */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 2.5}
              fill={c.primary}
              opacity="0.6"
              style={{
                animation: `starTwinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
            {/* Core */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 0.6}
              fill={c.primary}
              opacity="0.9"
              style={{
                animation: `starTwinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay + 0.3}s`,
              }}
            />
          </g>
        ))}

        {/* Larger accent stars (brighter, fewer) */}
        {[12, 25, 31].map((idx) => {
          const s = STARS[idx];
          return (
            <g key={`as${idx}`}>
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r * 3.5}
                fill={c.primary}
                opacity="0.4"
                style={{
                  animation: `starTwinkle ${s.duration * 1.5}s ease-in-out infinite`,
                  animationDelay: `${s.delay + 1}s`,
                }}
              />
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r * 1.2}
                fill="white"
                opacity="0.9"
                style={{
                  animation: `starTwinkle ${s.duration * 1.5}s ease-in-out infinite`,
                  animationDelay: `${s.delay + 1.2}s`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
