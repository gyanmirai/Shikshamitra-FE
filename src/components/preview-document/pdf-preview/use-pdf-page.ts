import type { RenderTask, PDFDocumentLoadingTask } from 'pdfjs-dist';

import { useRef, useState, useEffect } from 'react';

export function usePdfPage(url: string, pageNumber: number, retry: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [text, setText] = useState('');
  useEffect(() => {
    let active = true;
    let task: PDFDocumentLoadingTask | undefined;
    let render: RenderTask | undefined;
    let worker: Worker | undefined;
    setLoading(true);
    setError(false);
    const load = async () => {
      const pdfjs = await import('pdfjs-dist');
      if (!active) return;
      worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), {
        type: 'module',
      });
      task = pdfjs.getDocument({
        url,
        worker: pdfjs.PDFWorker.create({ port: worker }),
        useSystemFonts: true,
      });
      const document = await task.promise;
      if (!active) return;
      setPageCount(document.numPages);
      const page = await document.getPage(pageNumber);
      if (!active || !canvasRef.current) return;
      const original = page.getViewport({ scale: 1 });
      const longestSide = Math.max(original.width, original.height);
      if (!Number.isFinite(longestSide) || longestSide <= 0)
        throw new Error('Invalid PDF page dimensions.');
      const viewport = page.getViewport({ scale: Math.min(1.5, 3072 / longestSide) });
      const canvas = canvasRef.current;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      render = page.render({ canvas, viewport });
      await render.promise;
      const content = await page.getTextContent();
      if (active) {
        setText(content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join(' '));
        setLoading(false);
      }
    };
    load().catch(() => {
      if (active) {
        setError(true);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      render?.cancel();
      task?.destroy().catch(() => undefined);
      worker?.terminate();
    };
  }, [url, pageNumber, retry]);
  return { canvasRef, loading, error, pageCount, text };
}
