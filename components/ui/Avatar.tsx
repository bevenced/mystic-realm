"use client";

import { useState } from "react";

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F0B27A", "#82E0AA",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({ src, name, size = 36, className = "", onClick }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const letter = (name || "?").charAt(0).toUpperCase();
  const bgColor = getAvatarColor(name || "?");

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || "User"}
        width={size}
        height={size}
        onClick={onClick}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover flex-shrink-0 ${className} ${onClick ? "cursor-pointer" : ""}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-full flex items-center justify-center font-bold text-white select-none flex-shrink-0 ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: Math.round(size * 0.45),
      }}
    >
      {letter}
    </div>
  );
}
