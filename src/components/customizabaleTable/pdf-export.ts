import type { jsPDF } from 'jspdf';

const FONT_FAMILY = 'ShikshaMitraUnicode';
const REGULAR_FONT_FILE = 'ShikshaMitraUnicode-Regular.ttf';
const BOLD_FONT_FILE = 'ShikshaMitraUnicode-Bold.ttf';
const FONT_BASE_PATH = '/fonts';

type PdfFontData = {
  regular: string;
  bold: string;
};

export type PdfTableData = {
  title: string;
  head: string[];
  body: string[][];
};

let fontDataPromise: Promise<PdfFontData> | null = null;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

async function fetchFont(fileName: string): Promise<string> {
  const response = await fetch(`${FONT_BASE_PATH}/${fileName}`);
  if (!response.ok) {
    throw new Error(`Unable to load PDF font ${fileName}.`);
  }
  return arrayBufferToBase64(await response.arrayBuffer());
}

function loadFontData(): Promise<PdfFontData> {
  fontDataPromise ??= Promise.all([fetchFont(REGULAR_FONT_FILE), fetchFont(BOLD_FONT_FILE)])
    .then(([regular, bold]) => ({ regular, bold }))
    .catch((error: unknown) => {
      fontDataPromise = null;
      throw error;
    });
  return fontDataPromise;
}

function registerUnicodeFonts(doc: jsPDF, fonts: PdfFontData): void {
  doc.addFileToVFS(REGULAR_FONT_FILE, fonts.regular);
  doc.addFont(REGULAR_FONT_FILE, FONT_FAMILY, 'normal', undefined, 'Identity-H');
  doc.addFileToVFS(BOLD_FONT_FILE, fonts.bold);
  doc.addFont(BOLD_FONT_FILE, FONT_FAMILY, 'bold', undefined, 'Identity-H');
  doc.setFont(FONT_FAMILY, 'normal');
}

export async function createUnicodeTablePdf({ head, body }: PdfTableData): Promise<jsPDF> {
  const [{ default: JsPDF }, { default: autoTable }, fonts] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadFontData(),
  ]);
  const doc = new JsPDF({ orientation: 'landscape' });
  registerUnicodeFonts(doc, fonts);

  autoTable(doc, {
    columns: head.map((header, index) => ({ header, dataKey: String(index) })),
    head: [head],
    body,
    styles: {
      font: FONT_FAMILY,
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      font: FONT_FAMILY,
      fillColor: [22, 119, 255],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
    },
    margin: { top: 10, left: 10, right: 10 },
  });

  return doc;
}

export async function saveUnicodeTablePdf(data: PdfTableData): Promise<void> {
  const doc = await createUnicodeTablePdf(data);
  doc.save(`${data.title}.pdf`);
}
