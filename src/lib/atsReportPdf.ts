/**
 * Generate downloadable ATS report PDF via jsPDF (CDN).
 */
import type { ATSCheckerReport } from '../types';

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts?: { unit?: string; format?: string }) => JsPDFInstance };
  }
}

interface JsPDFInstance {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  setFontSize(size: number): void;
  setFont(font: string, style?: string): void;
  setTextColor(r: number, g?: number, b?: number): void;
  text(text: string, x: number, y: number, options?: { maxWidth?: number }): void;
  addPage(): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  setDrawColor(r: number, g?: number, b?: number): void;
  save(filename: string): void;
}

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';

let loadPromise: Promise<void> | null = null;

function loadJsPDF(): Promise<void> {
  if (window.jspdf?.jsPDF) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = JSPDF_CDN;
    script.async = true;
    script.onload = () => {
      if (window.jspdf?.jsPDF) resolve();
      else reject(new Error('jsPDF failed to load'));
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (test.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function statusLabel(score: number): string {
  if (score >= 70) return 'PASS';
  if (score >= 45) return 'WARN';
  return 'FAIL';
}

export async function downloadATSReportPdf(report: ATSCheckerReport): Promise<void> {
  await loadJsPDF();
  const doc = new window.jspdf!.jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const maxChars = Math.floor(contentW / 5.2);
  let y = margin;

  const ensureSpace = (needed: number) => {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const printLines = (lines: string[], size: number, bold = false, color: [number, number, number] = [64, 64, 64]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin, y, { maxWidth: contentW });
      y += size + 4;
    }
  };

  printLines(['Elite HR — ATS Resume Report'], 20, true, [23, 23, 23]);
  y += 4;
  printLines(
    [`File: ${report.fileName}`, `Scanned: ${new Date(report.scannedAt).toLocaleString()}`],
    10,
    false,
    [100, 100, 100]
  );
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 16;

  printLines([`Overall ATS Score: ${report.overallScore} / 100  (${report.grade})`], 16, true, [23, 23, 23]);
  y += 4;
  printLines(wrapText(report.executiveSummary, maxChars), 10);

  if (report.topPriorities.length) {
    y += 6;
    printLines(['Top Priorities'], 12, true, [23, 23, 23]);
    report.topPriorities.forEach((p, i) => printLines(wrapText(`${i + 1}. ${p}`, maxChars), 9));
  }

  for (const group of report.groups) {
    y += 8;
    printLines([`${group.label} — ${group.score}/100`], 13, true, [23, 23, 23]);
    printLines(wrapText(group.description, maxChars), 9);

    for (const check of group.checks) {
      y += 2;
      printLines(
        [`${check.label}  [${check.score}] ${statusLabel(check.score)}`],
        10,
        true,
        [23, 23, 23]
      );
      check.findings.forEach(f => printLines(wrapText(`• ${f}`, maxChars), 9));
      check.recommendations.forEach(r => printLines(wrapText(`→ ${r}`, maxChars), 9));
    }
  }

  if (report.missingHardSkills.length) {
    y += 8;
    printLines(wrapText(`Missing hard skills: ${report.missingHardSkills.join(', ')}`, maxChars), 9);
  }
  if (report.missingSoftSkills.length) {
    printLines(wrapText(`Missing soft skills: ${report.missingSoftSkills.join(', ')}`, maxChars), 9);
  }

  ensureSpace(24);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'AI suggestions may contain errors. Review before applying. Elite HR ATS Checker.',
    margin,
    doc.internal.pageSize.getHeight() - 28,
    { maxWidth: contentW }
  );

  const safeName = report.fileName.replace(/\.pdf$/i, '') || 'resume';
  doc.save(`ATS-Report-${safeName}-${report.overallScore}.pdf`);
}
