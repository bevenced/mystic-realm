export default function GlowOrb({
  size = 200,
  color,
  top = "20%",
  left = "10%",
  delay = 0,
}: {
  size?: number;
  color?: string;
  top?: string;
  left?: string;
  delay?: number;
}) {
  const bg = color || "var(--color-glow)";
  return (
    <div
      className="absolute rounded-full pointer-events-none animate-float-slow"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`,
        filter: "blur(40px)",
        animationDelay: `${delay}s`,
        opacity: 0.6,
      }}
    />
  );
}
