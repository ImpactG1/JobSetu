/**
 * PDF text extraction via pdf.js loaded from CDN (no npm dependency).
 */

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (params: { data: ArrayBuffer }) => {
        promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<{
            getTextContent: () => Promise<{ items: { str?: string }[] }>;
          }>;
        }>;
      };
    };
  }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

let loadPromise: Promise<void> | null = null;

function loadPdfJs(): Promise<void> {
  if (window.pdfjsLib) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-pdfjs="main"]`);
    if (existing && window.pdfjsLib) {
      resolve();
      return;
    }

    const mainScript = document.createElement('script');
    mainScript.src = `${PDFJS_CDN}/pdf.min.js`;
    mainScript.dataset.pdfjs = 'main';
    mainScript.async = true;

    mainScript.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        resolve();
      } else {
        reject(new Error('pdf.js failed to initialize'));
      }
    };
    mainScript.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));

    document.head.appendChild(mainScript);
  });

  return loadPromise;
}

async function extractTextFromArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  await loadPdfJs();
  const pdfjs = window.pdfjsLib!;
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) pages.push(pageText);
  }

  return pages.join('\n\n').trim();
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return extractTextFromArrayBuffer(buffer);
}

export async function extractTextFromPdfUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not download resume PDF');
  const buffer = await res.arrayBuffer();
  return extractTextFromArrayBuffer(buffer);
}
