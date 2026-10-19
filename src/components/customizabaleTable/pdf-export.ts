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
  context?: string[];
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

export async function createUnicodeTablePdf({
  title,
  head,
  body,
  context = [],
}: PdfTableData): Promise<jsPDF> {
  const [{ default: JsPDF }, { default: autoTable }, fonts] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadFontData(),
  ]);
  const doc = new JsPDF({ orientation: 'landscape' });
  registerUnicodeFonts(doc, fonts);
  const heading = doc.splitTextToSize([title, ...context].join('\n'), 275) as string[];
  const headerHeight = 12 + heading.length * 4;

  autoTable(doc, {
    columns: head.map((header, index) => ({ header, dataKey: String(index) })),
    head: [head],
    body,
    styles: {
      font: FONT_FAMILY,
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: 2,
      minCellWidth: head.length > 8 ? 28 : 0,
      overflow: 'linebreak',
    },
    headStyles: {
      font: FONT_FAMILY,
      fillColor: [244, 246, 248],
      textColor: 32,
      fontStyle: 'bold',
      halign: 'left',
    },
    horizontalPageBreak: head.length > 8,
    horizontalPageBreakRepeat: head.length > 8 ? [0, 1] : undefined,
    margin: { top: headerHeight, left: 10, right: 10, bottom: 15 },
    didDrawPage: () => {
      doc.setFont(FONT_FAMILY, 'normal');
      doc.setFontSize(9);
      doc.text(heading, 10, 10);
    },
  });
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.text(`Page ${page} of ${totalPages}`, 287, 202, { align: 'right' });
  }

  return doc;
}

export async function saveUnicodeTablePdf(data: PdfTableData): Promise<void> {
  if (
    [data.title, ...(data.context || []), ...data.head, ...data.body.flat()].some((value) =>
      /[\u0900-\u097f\u0a80-\u0aff\ua8e0-\ua8ff]/u.test(value)
    )
  ) {
    const { createIndicTablePdfBlob } = await import('./indic-pdf-export');
    const blob = await createIndicTablePdfBlob(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title}.pdf`;
    link.click();
    // Allow the download to start before releasing its backing blob.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const doc = await createUnicodeTablePdf(data);
  doc.save(`${data.title}.pdf`);
}
