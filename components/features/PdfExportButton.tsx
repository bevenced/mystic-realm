"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useState } from "react";
import { Download } from "lucide-react";

interface PdfExportButtonProps {
  type: string;
  reading: Record<string, any>;
  extraData?: Record<string, any>;
  baziData?: any;
  birthDate?: string;
  birthHour?: number;
  gender?: string;
}

export default function PdfExportButton({
  type, reading, extraData, baziData, birthDate, birthHour, gender,
}: PdfExportButtonProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const res = await fetch("/api/pdf/export-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date: new Date().toISOString().split("T")[0],
          birthDate,
          birthHour,
          gender,
          content: normalizeContent(reading),
          baziData,
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      // Download the PDF
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orient-wisdom-${type}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF export error:", e);
      alert(t.tools.pdfExportFailed);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
      style={{
        backgroundColor: `${c.primary}12`,
        color: c.primary,
        border: `1px solid ${c.primary}20`,
        opacity: exporting ? 0.6 : 1,
      }}
    >
      <Download size={16} className={exporting ? "animate-pulse" : ""} />
      {exporting ? t.tools.generatingPdf : t.tools.downloadPdf}
    </button>
  );
}

function normalizeContent(reading: Record<string, any>): Record<string, any> {
  // Extract the text content from the reading object for PDF
  return {
    overview: typeof reading.overview === "string" ? reading.overview : undefined,
    dayMaster: typeof reading.dayMaster === "string" ? reading.dayMaster : undefined,
    pillars: Array.isArray(reading.pillars) ? reading.pillars : undefined,
    lifeAspects: reading.lifeAspects && typeof reading.lifeAspects === "object" ? reading.lifeAspects : undefined,
    advice: typeof reading.advice === "string" ? reading.advice : undefined,
    luckyElements: Array.isArray(reading.luckyElements) ? reading.luckyElements : undefined,
    affirmation: typeof reading.affirmation === "string" ? reading.affirmation : undefined,
  };
}
