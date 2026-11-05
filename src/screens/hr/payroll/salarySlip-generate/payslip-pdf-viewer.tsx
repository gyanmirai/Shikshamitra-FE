'use client';

import type { RefObject } from 'react';
import type { RenderTask, PDFDocumentLoadingTask } from 'pdfjs-dist';

import { useRef, useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Stack,
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { extractPayslipPdfText } from './payslip-pdf-text';

type Props = {
  url: string;
  title: string;
  contentRef: RefObject<HTMLDivElement | null>;
  onReady: (url: string | null) => void;
  viewportHeight?: string;
  initialZoom?: 'fit' | 'page';
};

// Render the issued bytes, never a second template built from payroll fields.
export default function PayslipPdfViewer({
  url,
  title,
  contentRef,
  onReady,
  viewportHeight,
  initialZoom,
}: Props) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState<string>(initialZoom ?? (viewportHeight ? 'page' : 'fit'));
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(() => {
      setViewportSize({ width: element.clientWidth, height: element.clientHeight });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitWidth = Math.min(viewportSize.width, 850);
  const fitPageWidth = pageHeight
    ? Math.min(fitWidth, (Math.max(0, viewportSize.height - 10) * pageWidth) / pageHeight)
    : 0;
  const currentZoom =
    zoom === 'fit'
      ? (fitWidth / pageWidth) * 100
      : zoom === 'page'
        ? (fitPageWidth / pageWidth) * 100
        : Number(zoom);
  const zoomOut = Math.min(200, Math.max(25, Math.ceil(currentZoom / 25) * 25 - 25));
  const zoomIn = Math.min(200, Math.floor(currentZoom / 25) * 25 + 25);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    let render: RenderTask | undefined;
    let worker: Worker | undefined;
    const container = pagesRef.current;
    container?.replaceChildren();
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
      viewportRef.current.scrollLeft = 0;
    }
    setError(false);
    setLoading(true);
    onReady(null);

    const load = async () => {
      const pdfjs = await import('pdfjs-dist');
      if (cancelled) return;
      worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), {
        type: 'module',
      });
      const pdfWorker = pdfjs.PDFWorker.create({ port: worker });
      task = pdfjs.getDocument({ url, worker: pdfWorker });
      const pdf = await task.promise;
      const emittedSpans = new Set<string>();
      // Render sequentially to bound canvas memory and retain PDF page order.
      /* eslint-disable no-await-in-loop */
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 2 });
        if (pageNumber === 1) {
          setPageWidth(viewport.width / 2);
          setPageHeight(viewport.height / 2);
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.cssText = 'display:block;width:100%;height:auto;';
        canvas.setAttribute('aria-hidden', 'true');
        render = page.render({ canvas, viewport });
        await render.promise;
        const [text, structure] = await Promise.all([
          page.getTextContent({ includeMarkedContent: true }),
          page.getStructTree(),
        ]);
        if (cancelled) return;
        const section = document.createElement('section');
        section.className = 'payslip-pdf-page';
        section.setAttribute('aria-label', `Page ${pageNumber}`);
        const accessibleText = document.createElement('div');
        accessibleText.className = 'payslip-pdf-text';
        const extractedText = extractPayslipPdfText(text, structure, emittedSpans);
        // An explicit NUL glyph mapping loses the source letters. Never guess them or silently drop them.
        accessibleText.textContent = extractedText.includes('\u0000')
          ? `Text extraction is incomplete for this page. ${extractedText.replaceAll('\u0000', '[unmapped PDF glyph]')}`
          : extractedText;
        section.append(canvas, accessibleText);
        container?.append(section);
      }
      /* eslint-enable no-await-in-loop */
      if (!cancelled) {
        setLoading(false);
        onReady(url);
      }
    };
    load().catch(() => {
      if (!cancelled) {
        setError(true);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      render?.cancel();
      task?.destroy().catch(() => {
        /* A cancelled document cannot publish pages. */
      });
      worker?.terminate();
      container?.replaceChildren();
    };
  }, [url, retry, onReady]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        useFlexGap
        sx={{ mb: 1, flexWrap: 'wrap' }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={loading || error || currentZoom <= 25}
          onClick={() => setZoom(String(zoomOut))}
        >
          Zoom out
        </Button>
        <TextField
          select
          label="PDF zoom"
          size="small"
          value={zoom}
          disabled={loading || error}
          sx={{ width: { xs: 110, sm: 150 } }}
          onChange={(event) => setZoom(event.target.value)}
        >
          {viewportHeight && <MenuItem value="page">Fit page</MenuItem>}
          <MenuItem value="fit">Fit width</MenuItem>
          {[25, 50, 75, 100, 125, 150, 175, 200].map((value) => (
            <MenuItem key={value} value={String(value)}>
              {value}%
            </MenuItem>
          ))}
        </TextField>
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={loading || error || currentZoom >= 200}
          onClick={() => setZoom(String(zoomIn))}
        >
          Zoom in
        </Button>
      </Stack>
      <Box
        ref={viewportRef}
        role="region"
        aria-label="Payslip PDF viewer"
        tabIndex={0}
        sx={{
          minWidth: 0,
          overflow: 'auto',
          height: viewportHeight,
          overscrollBehavior: 'contain',
          '@media print': { height: 'auto', overflow: 'visible' },
        }}
      >
        {loading && (
          <Stack role="status" spacing={1} aria-label="Rendering payslip PDF">
            <Typography variant="body2" color="text.secondary">
              Preparing document preview...
            </Typography>
            <Skeleton variant="rounded" height={96} />
          </Stack>
        )}
        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => setRetry((value) => value + 1)}>
                Retry
              </Button>
            }
          >
            The payslip PDF could not be displayed.
          </Alert>
        )}
        <Box
          ref={contentRef}
          aria-label={title}
          aria-busy={loading}
          sx={{
            display: loading || error ? 'none' : 'block',
            width:
              zoom === 'fit'
                ? '100%'
                : zoom === 'page'
                  ? fitPageWidth
                  : (pageWidth * Number(zoom)) / 100,
            maxWidth: zoom === 'fit' ? 850 : 'none',
            mx: 'auto',
            '& .payslip-pdf-page': {
              position: 'relative',
              mb: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'common.white',
            },
            '& .payslip-pdf-text': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
            },
            '@media print': {
              width: '100%',
              maxWidth: 'none',
              '& .payslip-pdf-page': { border: 0, mb: 0, breakAfter: 'page' },
              '& .payslip-pdf-page:last-child': { breakAfter: 'auto' },
            },
          }}
        >
          <div ref={pagesRef} />
        </Box>
      </Box>
    </Box>
  );
}
