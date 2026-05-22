"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

interface Particle {
  id: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  left: number;
  peakOpacity: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: 2 + seededRandom(i * 7 + 1) * 2.5,
      duration: 6 + seededRandom(i * 11 + 3) * 5,
      delay: seededRandom(i * 13 + 5) * 6,
      drift: -30 + seededRandom(i * 17 + 7) * 60,
      left: 5 + seededRandom(i * 19 + 9) * 90,
      peakOpacity: 0.2 + seededRandom(i * 23 + 11) * 0.3,
    });
  }
  return particles;
}

const PARTICLES = generateParticles(10);

export default function AuraParticles() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="aura-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            "--aura-duration": `${p.duration}s`,
            "--aura-delay": `${p.delay}s`,
            "--aura-drift": `${p.drift}px`,
            "--aura-rise": "90vh",
            "--aura-size": `${p.size}px`,
            "--aura-peak-opacity": p.peakOpacity,
            "--aura-color": c.primary,
            "--aura-easing": "ease-in-out",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
