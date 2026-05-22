"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export default function SectionHeader({ eyebrow, title, description, center = true }: Props) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <p
          className="text-[11px] font-semibold tracking-[0.13em] uppercase mb-4"
          style={{ color: "#8e7047" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="heading-fluid-lg"
        style={{ color: "#3e3024" }}
      >
        {title}
      </h2>
      <div
        className="section-accent-line"
        style={{ marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }}
      />
      {description && (
        <p
          className="text-[15px] mt-6 leading-relaxed max-w-[65ch]"
          style={{ color: "#665744", marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
