"use client";

import { useState } from "react";

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
      className={`rounded-full flex items-center justify-center font-bold select-none flex-shrink-0 ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, white)",
        color: "var(--color-primary)",
        fontSize: Math.round(size * 0.45),
      }}
    >
      {letter}
    </div>
  );
}
