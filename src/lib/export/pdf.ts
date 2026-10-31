import type { Block, ExportDocument } from "./model";

/**
 * Minimal PDF writer with no dependencies.
 * Uses the standard Helvetica fonts that every PDF viewer has built in, so no
 * font files are embedded. Text is encoded as Windows-1252, which covers
 * English, Albanian (ë, ç) and German (ä, ö, ü, ß). Characters outside that
 * set (emoji, other alphabets) are simplified or replaced with "?".
 */

// Character widths (1000 units per em) for Windows-1252 codes 32..255.
const W_REGULAR: number[] = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500];
const W_BOLD: number[] = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556];

const CP1252_HIGH: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

const REPLACEMENTS: Record<string, string> = { "→": "->", "←": "<-", "★": "*", "☆": "*", "✓": "v", "−": "-", "\u2011": "-" };

/** Returns a string where every character code is a valid Windows-1252 byte (32..255). */
function encode(input: string): string {
  let out = "";
  for (const ch of input.normalize("NFC")) {
    const cp = ch.codePointAt(0) as number;
    if (cp === 10) out += "\n";
    else if (cp === 9 || cp === 0xa0 || cp === 0x2009 || cp === 0x202f) out += " ";
    else if (cp < 32) continue;
    else if (cp <= 126 || (cp >= 0xa1 && cp <= 0xff)) out += ch;
    else if (CP1252_HIGH[cp] !== undefined) out += String.fromCharCode(CP1252_HIGH[cp]);
    else if (REPLACEMENTS[ch] !== undefined) out += REPLACEMENTS[ch];
    else if (cp === 0x200d || (cp >= 0xfe00 && cp <= 0xfe0f) || cp >= 0x1f000 || (cp >= 0x2600 && cp <= 0x27bf)) continue;
    else {
      // Try to drop the accent (e.g. "ą" becomes "a"); otherwise use "?".
      const base = ch.normalize("NFD")[0];
      out += base && base.charCodeAt(0) >= 32 && base.charCodeAt(0) <= 126 ? base : "?";
    }
  }
  return out;
}

function width(text: string, bold: boolean, size: number): number {
  const table = bold ? W_BOLD : W_REGULAR;
  let units = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    units += code >= 32 && code <= 255 ? table[code - 32] : 0;
  }
  return (units * size) / 1000;
}

/** Splits text into lines that fit `maxWidth`, breaking very long words (URLs) if needed. */
function wrap(text: string, bold: boolean, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/ +/)) {
      if (word === "") continue;
      let rest = word;
      // Break a single word that is wider than a whole line.
      while (width(rest, bold, size) > maxWidth) {
        let cut = rest.length - 1;
        while (cut > 1 && width(rest.slice(0, cut), bold, size) > maxWidth) cut -= 1;
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      const candidate = line ? `${line} ${rest}` : rest;
      if (width(candidate, bold, size) <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = rest;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function pdfString(encoded: string): string {
  return encoded.replace(/[\\()]/g, (c) => `\\${c}`);
}

/** Document-info strings (title, author) as UTF-16 hex, so any character works. */
function pdfUnicodeString(text: string): string {
  const be = Buffer.from(text, "utf16le").swap16();
  return `<FEFF${be.toString("hex")}>`;
}

function rgb(hex: string): string {
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(3)).join(" ");
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 56;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 62;
const TEXT_W = PAGE_W - MARGIN_X * 2;

export function renderPdf(doc: ExportDocument): Buffer {
  const pages: string[][] = [[]];
  let y = MARGIN_TOP; // distance from the top of the page
  let lastWasHeading = false;

  const ops = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push([]);
    y = MARGIN_TOP;
  };
  const ensure = (height: number) => {
    if (y + height > PAGE_H - MARGIN_BOTTOM) newPage();
  };
  const gap = (pts: number) => {
    if (y > MARGIN_TOP) y += pts;
  };

  function drawText(text: string, x: number, baseline: number, size: number, bold: boolean, color: string) {
    ops().push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${x.toFixed(2)} ${(PAGE_H - baseline).toFixed(2)} Td (${pdfString(text)}) Tj ET`,
    );
  }
  function drawRule(yTop: number, color: string, thickness: number) {
    const yy = (PAGE_H - yTop).toFixed(2);
    ops().push(`${rgb(color)} RG ${thickness} w ${MARGIN_X} ${yy} m ${(PAGE_W - MARGIN_X).toFixed(2)} ${yy} l S`);
  }

  /** Draws wrapped text and moves down. */
  function paragraph(text: string, opt: { size: number; leading: number; bold?: boolean; color: string }) {
    const lines = wrap(encode(text), Boolean(opt.bold), opt.size, TEXT_W);
    for (const line of lines) {
      ensure(opt.leading);
      if (line) drawText(line, MARGIN_X, y + opt.size, opt.size, Boolean(opt.bold), opt.color);
      y += opt.leading;
    }
  }

  const blocks: Block[] = doc.blocks;
  blocks.forEach((block, index) => {
    const wasHeading = lastWasHeading;
    lastWasHeading = false;
    switch (block.type) {
      case "title":
        paragraph(block.text, { size: 26, leading: 31, bold: true, color: "111111" });
        break;
      case "subtitle":
        gap(2);
        paragraph(block.text, { size: 13, leading: 18, color: "444444" });
        break;
      case "meta":
        gap(5);
        paragraph(block.text, { size: 9.5, leading: 13, color: "666666" });
        break;
      case "links":
        gap(wasHeading ? 0 : 3);
        for (const link of block.items) {
          paragraph(`${link.label}: ${link.url}`, { size: 9.5, leading: 13, color: doc.accent });
        }
        break;
      case "heading":
        gap(index === 0 ? 0 : 20);
        ensure(60); // keep the heading together with what follows
        paragraph(block.text.toUpperCase(), { size: 11, leading: 15, bold: true, color: doc.accent });
        drawRule(y + 1, "CCCCCC", 0.6);
        y += 8;
        lastWasHeading = true;
        break;
      case "item": {
        gap(wasHeading ? 0 : 9);
        ensure(44);
        const right = block.right ? encode(block.right) : "";
        const rightW = right ? width(right, false, 9.5) : 0;
        const leftLines = wrap(encode(block.left), true, 11, TEXT_W - (rightW ? rightW + 12 : 0));
        leftLines.forEach((line, i) => {
          ensure(15);
          drawText(line, MARGIN_X, y + 11, 11, true, "111111");
          if (i === 0 && right) drawText(right, PAGE_W - MARGIN_X - rightW, y + 11, 9.5, false, "666666");
          y += 15;
        });
        break;
      }
      case "sub":
        paragraph(block.text, { size: 10, leading: 14, color: "555555" });
        break;
      case "para":
        gap(wasHeading ? 0 : 2);
        paragraph(block.text, { size: 10, leading: 14.5, color: "222222" });
        break;
      case "bullet": {
        gap(1.5);
        const lines = wrap(encode(block.text), false, 10, TEXT_W - 16);
        lines.forEach((line, i) => {
          ensure(14);
          if (i === 0) drawText("\x95", MARGIN_X + 4, y + 10, 10, false, "222222");
          drawText(line, MARGIN_X + 16, y + 10, 10, false, "222222");
          y += 14;
        });
        break;
      }
      case "small":
        gap(2);
        paragraph(block.text, { size: 9, leading: 12.5, color: "666666" });
        break;
    }
  });

  // Page numbers.
  pages.forEach((page, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    const w = width(label, false, 8);
    page.push(`BT /F1 8 Tf ${rgb("999999")} rg ${((PAGE_W - w) / 2).toFixed(2)} 30 Td (${label}) Tj ET`);
  });

  // ---- Assemble the file ----
  const chunks: Buffer[] = [];
  const offsets: number[] = [];
  let position = 0;
  const push = (data: string | Buffer) => {
    const buf = typeof data === "string" ? Buffer.from(data, "latin1") : data;
    chunks.push(buf);
    position += buf.length;
  };
  const object = (id: number, body: string | Buffer) => {
    offsets[id] = position;
    push(`${id} 0 obj\n`);
    push(body);
    push("\nendobj\n");
  };

  push(Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1"));
  const pageIds = pages.map((_, i) => 6 + i * 2);
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  object(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  object(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  object(5, `<< /Title ${pdfUnicodeString(doc.title)} /Author ${pdfUnicodeString(doc.author)} /Producer (MyFolio) >>`);
  pages.forEach((page, i) => {
    const pageId = pageIds[i];
    const contentId = pageId + 1;
    object(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    const content = Buffer.from(page.join("\n"), "latin1");
    object(
      contentId,
      Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "latin1"), content, Buffer.from("\nendstream", "latin1")]),
    );
  });

  const total = 6 + pages.length * 2;
  const xrefAt = position;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let id = 1; id < total; id += 1) xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  push(xref);
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);
  return Buffer.concat(chunks);
}
