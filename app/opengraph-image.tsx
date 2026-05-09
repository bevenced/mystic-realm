import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mystic Realm — Ancient Wisdom, Modern Magic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0A0A20 0%, #12101A 50%, #1A1525 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Glow orb background */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "25%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Decorative line */}
        <div
          style={{
            width: 80,
            height: 2,
            background: "#FFD700",
            marginBottom: 40,
            opacity: 0.6,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "#FFD700",
            letterSpacing: "0.05em",
            textShadow: "0 0 30px rgba(255,215,0,0.3)",
            marginBottom: 16,
          }}
        >
          Mystic Realm
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#9B8EC4",
            letterSpacing: "0.1em",
            marginBottom: 40,
          }}
        >
          Ancient Wisdom, Modern Magic
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: 80,
            height: 2,
            background: "#FFD700",
            marginTop: 8,
            opacity: 0.6,
          }}
        />

        {/* Six themes */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 28,
            fontSize: 18,
            color: "#6A80A0",
          }}
        >
          <span>Meditation</span>
          <span>Healing</span>
          <span>Feng Shui</span>
          <span>BaZi</span>
          <span>Tarot</span>
          <span>Astrology</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
