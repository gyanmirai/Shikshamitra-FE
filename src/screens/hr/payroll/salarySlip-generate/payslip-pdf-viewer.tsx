'use client';

import type { RefObject } from 'react';
import type { RenderTask, PDFDocumentLoadingTask } from 'pdfjs-dist';

import { useRef, useState, useEffect } from 'react';
import { Box, Alert, Button, Skeleton } from '@mui/material';

type Props = {
  url: string;
  title: string;
  contentRef: RefObject<HTMLDivElement | null>;
  onReady: (url: string | null) => void;
};

// Render the issued bytes, never a second template built from payroll fields.
export default function PayslipPdfViewer({ url, title, contentRef, onReady }: Props) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    let render: RenderTask | undefined;
    let worker: Worker | undefined;
    const container = pagesRef.current;
    container?.replaceChildren();
    setError(false);
    setLoading(true);
    onReady(null);

    const load = async () => {
      const pdfjs = await import('pdfjs-dist');
      if (cancelled) return;
      worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
      const pdfWorker = pdfjs.PDFWorker.create({ port: worker });
      task = pdfjs.getDocument({ url, worker: pdfWorker });
      const pdf = await task.promise;
      // Render sequentially to bound canvas memory and retain PDF page order.
      /* eslint-disable no-await-in-loop */
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.cssText = 'display:block;width:100%;height:auto;';
        canvas.setAttribute('aria-hidden', 'true');
        render = page.render({ canvas, viewport });
        await render.promise;
        const text = await page.getTextContent();
        if (cancelled) return;
        const section = document.createElement('section');
        section.className = 'payslip-pdf-page';
        section.setAttribute('aria-label', `Page ${pageNumber}`);
        const accessibleText = document.createElement('div');
        accessibleText.className = 'payslip-pdf-text';
        accessibleText.textContent = text.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        section.append(canvas, accessibleText);
        container?.append(section);
      }
      /* eslint-enable no-await-in-loop */
      if (!cancelled) { setLoading(false); onReady(url); }
    };
    load().catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => {
      cancelled = true;
      render?.cancel();
      task?.destroy().catch(() => { /* A cancelled document cannot publish pages. */ });
      worker?.terminate();
      container?.replaceChildren();
    };
  }, [url, retry, onReady]);

  return <Box>
    {loading && <Skeleton aria-label="Rendering payslip PDF" variant="rounded" height={560} />}
    {error && <Alert severity="error" action={<Button size="small" onClick={() => setRetry((value) => value + 1)}>Retry</Button>}>
      The payslip PDF could not be displayed.
    </Alert>}
    <Box ref={contentRef} aria-label={title} aria-busy={loading} sx={{
      display: loading || error ? 'none' : 'block', width: '100%', maxWidth: 850, mx: 'auto',
      '& .payslip-pdf-page': { mb: 1, border: 1, borderColor: 'divider', bgcolor: 'common.white' },
      '& .payslip-pdf-text': { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' },
      '@media print': { maxWidth: 'none', '& .payslip-pdf-page': { border: 0, mb: 0, breakAfter: 'page' }, '& .payslip-pdf-page:last-child': { breakAfter: 'auto' } },
    }}><div ref={pagesRef} /></Box>
  </Box>;
}
