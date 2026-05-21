"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({ src, name, size = 36, className = "", onClick }: AvatarProps) {
  const { t } = useLocale();
  const [imgError, setImgError] = useState(false);
  const letter = (name || "?").charAt(0).toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || t.common.avatar}
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
      className={`relative rounded-full flex-shrink-0 ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "var(--color-primary)", opacity: 0.13 }}
      />
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center font-bold select-none"
        style={{ color: "var(--color-primary)", fontSize: Math.round(size * 0.45) }}
      >
        {letter}
      </div>
    </div>
  );
}
