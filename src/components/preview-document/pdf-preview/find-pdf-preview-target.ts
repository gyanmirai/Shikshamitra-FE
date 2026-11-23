import type { PDFDocumentProxy } from 'pdfjs-dist';

export type PdfPreviewTarget = {
  destination?: string;
  page?: number | 'last';
  edge?: 'bottom';
  text?: string[];
  afterText?: string;
};

export type PdfPreviewReveal = {
  id: number;
  label: string;
  target: PdfPreviewTarget;
};

export type PdfPreviewLocation = {
  page: number;
  top: number;
  left?: number;
  width?: number;
  height?: number;
};

const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF]/g, '');

export async function findPdfPreviewTarget(
  document: PDFDocumentProxy,
  target: PdfPreviewTarget,
  currentPage: number,
  isActive: () => boolean
) {
  const destination = target.destination ? await document.getDestination(target.destination) : null;
  if (!isActive()) return undefined;
  const reference = destination?.[0];
  const destinationPage =
    typeof reference === 'number'
      ? reference + 1
      : reference && typeof reference === 'object'
        ? (await document.getPageIndex(reference)) + 1
        : undefined;
  if (!isActive()) return undefined;
  const fallback: PdfPreviewLocation = {
    page: Math.min(
      destinationPage ??
        (target.page === 'last' ? document.numPages : (target.page ?? currentPage)),
      document.numPages
    ),
    top: target.edge === 'bottom' ? 94 : 5,
  };
  const anchors = target.text?.map(normalize).filter(Boolean) ?? [];
  if (!anchors.length) return fallback;

  const after = target.afterText && normalize(target.afterText);
  // Read physical pages in order because a field can carry over to a page after its heading.
  async function findPage(
    number: number,
    afterFound: boolean,
    firstMatch?: typeof fallback
  ): Promise<typeof fallback | undefined> {
    if (!isActive()) return undefined;
    if (number > document.numPages) return firstMatch ?? fallback;
    const page = await document.getPage(number);
    if (!isActive()) return undefined;
    const content = await page.getTextContent();
    if (!isActive()) return undefined;
    let text = '';
    const tokens = content.items.flatMap((item) => {
      if (!('str' in item)) return [];
      const start = text.length;
      text += normalize(item.str);
      return start === text.length
        ? []
        : [{ end: text.length, transform: item.transform, width: item.width }];
    });
    const headingIndex = after && !afterFound ? text.indexOf(after) : -1;
    const searchFrom = headingIndex >= 0 && after ? headingIndex + after.length : 0;
    const foundHeading = afterFound || headingIndex >= 0;
    const locate = (start: number): PdfPreviewLocation | undefined => {
      const match = anchors
        .map((anchor) => ({ index: text.indexOf(anchor, start), length: anchor.length }))
        .find(({ index }) => index >= 0);
      if (!match) return undefined;
      const first = tokens.findIndex(({ end }) => match.index < end);
      const last = tokens.findIndex(({ end }) => match.index + match.length <= end);
      if (first < 0 || last < first) return undefined;
      const viewport = page.getViewport({ scale: 1 });
      const positions = tokens.slice(first, last + 1).map(({ transform, width }) => {
        const [x, y] = viewport.convertToViewportPoint(transform[4], transform[5]);
        return { x, y, end: x + width };
      });
      const top = Math.max(
        0,
        Math.min(94, (Math.min(...positions.map(({ y }) => y)) / viewport.height) * 100 - 1)
      );
      if (!viewport.width || !positions.every(({ end }) => Number.isFinite(end))) {
        return { page: number, top };
      }
      const left = Math.max(
        0,
        (Math.min(...positions.map(({ x }) => x)) / viewport.width) * 100 - 1
      );
      const right = Math.min(
        100,
        (Math.max(...positions.map(({ end }) => end)) / viewport.width) * 100 + 1
      );
      const bottom = (Math.max(...positions.map(({ y }) => y)) / viewport.height) * 100 + 0.8;
      return { page: number, top, left, width: right - left, height: Math.max(2.4, bottom - top) };
    };
    const match = foundHeading && locate(searchFrom);
    if (destinationPage) return match || locate(0) || fallback;
    return match || findPage(number + 1, foundHeading, firstMatch ?? locate(0));
  }
  return findPage(destinationPage ?? 1, !after);
}
