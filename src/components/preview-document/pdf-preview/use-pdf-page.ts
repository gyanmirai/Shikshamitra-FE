import type { RenderTask, PDFDocumentLoadingTask } from 'pdfjs-dist';

import { useRef, useState, useEffect } from 'react';

import {
  findPdfPreviewTarget,
  type PdfPreviewReveal,
  type PdfPreviewLocation,
} from './find-pdf-preview-target';

export function usePdfPage(
  url: string,
  pageNumber: number,
  retry: number,
  preservePage = false,
  reveal?: PdfPreviewReveal
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayed = useRef<{ url: string; page: number; retry: number }>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [renderedPage, setRenderedPage] = useState<number>();
  const [text, setText] = useState('');
  const [revealLocation, setRevealLocation] = useState<
    PdfPreviewLocation & { id: number; url: string }
  >();
  const [failedReveal, setFailedReveal] = useState<{ id: number; url: string }>();
  useEffect(() => {
    if (
      preservePage &&
      !reveal &&
      displayed.current?.url === url &&
      displayed.current.page === pageNumber &&
      displayed.current.retry === retry
    ) {
      setLoading(false);
      setError(false);
      return undefined;
    }
    let active = true;
    let task: PDFDocumentLoadingTask | undefined;
    let render: RenderTask | undefined;
    let worker: Worker | undefined;
    setLoading(true);
    setError(false);
    setFailedReveal(undefined);
    const load = async () => {
      const pdfjs = await import('./pdfjs');
      if (!active) return;
      worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), {
        type: 'module',
      });
      task = pdfjs.getDocument({
        url,
        worker: pdfjs.PDFWorker.create({ port: worker }),
        useSystemFonts: true,
      });
      const document = await task.promise;
      if (!active) return;
      if (!preservePage) setPageCount(document.numPages);
      const location = reveal
        ? await findPdfPreviewTarget(
            document,
            reveal.target,
            displayed.current?.page ?? pageNumber,
            () => active
          )
        : undefined;
      if (!active) return;
      const nextPage = location?.page ?? Math.min(pageNumber, document.numPages);
      const page = await document.getPage(nextPage);
      if (!active || !canvasRef.current) return;
      const original = page.getViewport({ scale: 1 });
      const longestSide = Math.max(original.width, original.height);
      if (!Number.isFinite(longestSide) || longestSide <= 0)
        throw new Error('Invalid PDF page dimensions.');
      const viewport = page.getViewport({ scale: Math.min(1.5, 3072 / longestSide) });
      // Render off-screen while the previously drawn page stays in the viewer.
      const canvas = preservePage ? window.document.createElement('canvas') : canvasRef.current;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      render = page.render({ canvas, viewport });
      await render.promise;
      const content = await page.getTextContent();
      if (active) {
        if (preservePage) {
          const visible = canvasRef.current;
          const context = visible?.getContext('2d');
          if (!visible || !context) throw new Error('Unable to update the preview canvas.');
          visible.width = canvas.width;
          visible.height = canvas.height;
          context.drawImage(canvas, 0, 0);
        }
        setPageCount(document.numPages);
        displayed.current = { url, page: nextPage, retry };
        setRenderedPage(nextPage);
        setRevealLocation(reveal && location ? { id: reveal.id, url, ...location } : undefined);
        setText(content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join(' '));
        setLoading(false);
      }
    };
    load().catch(() => {
      if (active) {
        setError(true);
        if (reveal) setFailedReveal({ id: reveal.id, url });
        setLoading(false);
      }
    });
    return () => {
      active = false;
      render?.cancel();
      task?.destroy().catch(() => undefined);
      worker?.terminate();
    };
  }, [url, pageNumber, retry, preservePage, reveal]);
  return {
    canvasRef,
    loading,
    error,
    pageCount,
    text,
    renderedPage,
    revealLocation,
    failedReveal,
    hasRendered: renderedPage !== undefined,
  };
}
