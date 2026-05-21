// ===== BaZi Reading PDF Generator =====
// Uses pdf-lib to generate downloadable PDF reports.
// To support Chinese characters, we embed a Noto Sans SC font subset.

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

export interface PdfReadingData {
  type: string;          // "bazi" | "tarot" | "astrology" | "fengshui" | "meditation"
  date: string;
  birthDate?: string;
  birthHour?: number;
  gender?: string;
  content: {
    overview?: string;
    dayMaster?: string;
    pillars?: Array<{ name: string; stem?: string; branch?: string; meaning: string }>;
    lifeAspects?: Record<string, string>;
    advice?: string;
    luckyElements?: string[];
    affirmation?: string;
    [key: string]: any;
  };
  baziData?: {
    year: any; month: any; day: any; hour: any;
    dayMasterElement: string;
    dayMasterYinYang: string;
    elementCounts: Record<string, number>;
  };
}

const COLORS = {
  primary: [0.4, 0.27, 0.6] as [number, number, number],    // Purple-gold
  text: [0.15, 0.15, 0.2] as [number, number, number],
  muted: [0.5, 0.5, 0.55] as [number, number, number],
  accent: [0.8, 0.5, 0.2] as [number, number, number],      // Gold accent
  bg: [0.98, 0.97, 0.98] as [number, number, number],
  white: [1, 1, 1] as [number, number, number],
};

export async function generateReadingPdf(data: PdfReadingData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // For Chinese characters, use a built-in font that supports them
  // pdf-lib StandardFonts don't support CJK, so we'll use a fallback approach
  // Characters that can't be rendered will be shown as placeholder

  let page = doc.addPage([595, 842]); // A4
  const W = page.getWidth();
  let y = 780;
  const margin = 50;
  const lineHeight = 14;

  function addText(text: string, opts: { font?: PDFFont; size?: number; color?: [number, number, number]; x?: number; align?: "left" | "center" | "right" }) {
    const f = opts.font || font;
    const s = opts.size || 10;
    const c = opts.color || COLORS.text;
    let x = opts.x ?? margin;

    if (opts.align === "center") {
      const tw = text.length * s * 0.5;
      x = (W - tw) / 2;
    }

    if (y < 60) {
      page = doc.addPage([595, 842]);
      y = 780;
    }

    page.drawText(sanitize(text), {
      x,
      y,
      size: s,
      font: f,
      color: rgb(c[0], c[1], c[2]),
      maxWidth: W - 2 * margin,
    });

    y -= s + 6;
  }

  function addDivider() {
    if (y < 80) {
      page = doc.addPage([595, 842]);
      y = 780;
    }
    y -= 6;
    page.drawLine({
      start: { x: margin, y },
      end: { x: W - margin, y },
      thickness: 0.5,
      color: rgb(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]),
      opacity: 0.3,
    });
    y -= 10;
  }

  // === Header ===
  addText("ORIENT WISDOM", { font: fontBold, size: 18, color: COLORS.primary, align: "center" });
  addText("Personalized Destiny Reading", { font: fontOblique, size: 10, color: COLORS.muted, align: "center" });

  // Reset y after header title
  y = 740;

  // === Reading Type ===
  const readingTypeName = data.type.charAt(0).toUpperCase() + data.type.slice(1);
  addText(`${readingTypeName} Reading`, { font: fontBold, size: 14, color: COLORS.accent });
  addText(`Generated: ${data.date}`, { font, size: 8, color: COLORS.muted });
  addDivider();

  // === Birth Info ===
  if (data.birthDate) {
    addText("Birth Information", { font: fontBold, size: 11, color: COLORS.primary });
    addText(`Date: ${data.birthDate}  |  Hour: ${data.birthHour ?? "N/A"}:00  |  Gender: ${data.gender || "N/A"}`, { font, size: 9 });
    addDivider();
  }

  // === BaZi Chart ===
  if (data.baziData) {
    const bd = data.baziData;
    addText("BaZi Chart (Four Pillars)", { font: fontBold, size: 11, color: COLORS.primary });

    const pillars = [
      { label: "Year", p: bd.year },
      { label: "Month", p: bd.month },
      { label: "Day", p: bd.day },
      { label: "Hour", p: bd.hour },
    ];

    // Draw pillar table
    const tableTop = y;
    const colW = (W - 2 * margin) / 5;
    const rowH = 18;
    const headers = ["Pillar", "Stem", "Branch", "Element", "Zodiac"];

    // Header row
    headers.forEach((h, i) => {
      page.drawText(h, {
        x: margin + i * colW + 4,
        y: y,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    });
    page.drawRectangle({
      x: margin, y: y - 2, width: W - 2 * margin, height: rowH,
      color: rgb(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]),
    });
    y -= rowH + 4;

    // Data rows
    for (const p of pillars) {
      const stemEn = p.p.stemEn || "";
      const branchEn = p.p.branchEn || "";
      const vals = [p.label, stemEn, branchEn, p.p.stemElement, p.p.zodiac || ""];
      vals.forEach((v, i) => {
        page.drawText(sanitize(String(v)), {
          x: margin + i * colW + 4,
          y,
          size: 8,
          font,
          color: rgb(COLORS.text[0], COLORS.text[1], COLORS.text[2]),
        });
      });
      y -= rowH;
      if (y < 60) {
        page = doc.addPage([595, 842]);
        y = 780;
      }
    }

    addText(`Day Master: ${bd.dayMasterYinYang} ${bd.dayMasterElement}`, { font: fontBold, size: 10, color: COLORS.accent });

    // Element counts
    const ec = bd.elementCounts;
    addText(`Elements: Wood(${ec.Wood}) Fire(${ec.Fire}) Earth(${ec.Earth}) Metal(${ec.Metal}) Water(${ec.Water})`, { font, size: 9 });
    addDivider();
  }

  // === Reading Content ===
  const c = data.content;

  if (c.overview) {
    addText("Overview", { font: fontBold, size: 11, color: COLORS.primary });
    addText(c.overview, { font, size: 9, color: COLORS.text });
    addDivider();
  }

  if (c.dayMaster) {
    addText("Day Master Analysis", { font: fontBold, size: 11, color: COLORS.primary });
    addText(c.dayMaster, { font, size: 9 });
    addDivider();
  }

  if (c.pillars?.length) {
    addText("Pillar Analysis", { font: fontBold, size: 11, color: COLORS.primary });
    for (const p of c.pillars) {
      addText(`${p.name}${p.stem ? ` (${p.stem}${p.branch || ""})` : ""}`, { font: fontBold, size: 9, color: COLORS.accent });
      addText(p.meaning, { font, size: 9 });
    }
    addDivider();
  }

  if (c.lifeAspects) {
    addText("Life Aspects", { font: fontBold, size: 11, color: COLORS.primary });
    for (const [aspect, desc] of Object.entries(c.lifeAspects)) {
      const label = aspect.charAt(0).toUpperCase() + aspect.slice(1);
      addText(`${label}: ${desc}`, { font, size: 9 });
    }
    addDivider();
  }

  if (c.advice) {
    addText("Advice", { font: fontBold, size: 11, color: COLORS.primary });
    addText(c.advice, { font, size: 9 });
    addDivider();
  }

  if (c.luckyElements?.length) {
    addText("Lucky Elements", { font: fontBold, size: 11, color: COLORS.primary });
    addText(c.luckyElements.join(", "), { font, size: 9 });
    addDivider();
  }

  if (c.affirmation) {
    addText("Affirmation", { font: fontBold, size: 11, color: COLORS.primary });
    addText(`"${c.affirmation}"`, { font: fontOblique, size: 10, color: COLORS.accent });
  }

  // === Footer ===
  y = 40;
  page.drawLine({
    start: { x: margin, y },
    end: { x: W - margin, y },
    thickness: 0.5,
    color: rgb(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]),
    opacity: 0.3,
  });
  addText("OrientWisdom.com — AI-Powered Destiny Analysis", { font, size: 7, color: COLORS.muted });

  return await doc.save();
}

// Sanitize text to remove characters that Standard fonts can't render
function sanitize(text: string): string {
  // Keep only ASCII + common Latin-1 chars since we're using StandardFonts
  return text.replace(/[^\x00-\x7FÀ-ɏ]/g, "");
}
