import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Alert, Button, Skeleton, IconButton, Typography } from '@mui/material';

import { usePdfPage } from './use-pdf-page';

import type { PdfPreviewReveal } from './find-pdf-preview-target';

const revealIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const pageButtonSx = {
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  p: 0.75,
  color: 'text.primary',
  '&:hover': { bgcolor: 'action.hover' },
  '&.Mui-disabled': {
    color: 'action.disabled',
    pointerEvents: 'auto',
    cursor: 'not-allowed',
    '&:hover': { bgcolor: 'transparent' },
  },
};

function AdjacentPage({ url, title, page }: { url: string; title: string; page: number }) {
  const pdf = usePdfPage(url, page, 0, false, undefined, 1.5);
  return (
    <Box sx={{ minWidth: 0 }}>
      {pdf.loading && (
        <Skeleton aria-label="Rendering next PDF page" variant="rounded" height={400} />
      )}
      {pdf.error && (
        <Alert severity="error">The next page could not be displayed. Select it to retry.</Alert>
      )}
      <Box
        component="canvas"
        ref={pdf.canvasRef}
        role="img"
        aria-label={`${title}, page ${page}`}
        sx={{
          display: pdf.loading || pdf.error ? 'none' : 'block',
          width: 1,
          height: 'auto',
          bgcolor: 'common.white',
        }}
      />
    </Box>
  );
}

export default function PdfCanvas({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
  usePageSelector = false,
  separateZoomControls = false,
  showAdjacentPage = false,
  initialPage = 1,
  onPageChange,
  onPageCountChange,
  preservePageOnUpdate = false,
  reveal,
  onReveal,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
  usePageSelector?: boolean;
  separateZoomControls?: boolean;
  showAdjacentPage?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (count: number) => void;
  preservePageOnUpdate?: boolean;
  reveal?: PdfPreviewReveal;
  onReveal?: (id: number, page?: number, marker?: HTMLDivElement | null) => void;
}) {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));
  const [page, setPage] = useState(initialPage);
  const [dismissedReveal, setDismissedReveal] = useState<number>();
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const activeReveal = reveal?.id === dismissedReveal ? undefined : reveal;
  const target = activeReveal?.target;
  const showMarker = Boolean(
    target?.destination || target?.text?.length || target?.page || target?.edge
  );
  const pdf = usePdfPage(
    url,
    activeReveal ? initialPage : page,
    retry,
    preservePageOnUpdate,
    activeReveal,
    separateZoomControls ? 3 : 1.5
  );
  const markRef = useRef<HTMLDivElement>(null);
  const revealed = useRef<{ id: number; url: string; page?: number }>(undefined);
  const marked =
    !pdf.error && pdf.revealLocation?.id === activeReveal?.id && pdf.revealLocation?.url === url
      ? pdf.revealLocation
      : undefined;
  const failed =
    pdf.failedReveal?.id === activeReveal?.id && pdf.failedReveal?.url === url
      ? pdf.failedReveal
      : undefined;
  useEffect(() => {
    const result = marked ?? failed;
    if (
      !result ||
      (revealed.current?.id === result.id &&
        revealed.current.url === result.url &&
        revealed.current.page === marked?.page)
    )
      return;
    revealed.current = { id: result.id, url: result.url, page: marked?.page };
    if (marked) setPage(marked.page);
    onReveal?.(result.id, marked?.page, markRef.current);
  }, [marked, failed, onReveal]);
  useEffect(() => {
    if (pdf.hasRendered) onPageCountChange?.(pdf.pageCount);
  }, [onPageCountChange, pdf.hasRendered, pdf.pageCount]);
  const showRenderedPage = pdf.hasRendered && preservePageOnUpdate;
  const currentPage = Math.min(marked?.page ?? page, pdf.pageCount);
  const changePage = (next: number) => {
    setDismissedReveal(reveal?.id);
    setPage(next);
    onPageChange?.(next);
  };
  const showControls = !hideControlsForSinglePage || pdf.pageCount > 1;
  const controls = (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      useFlexGap
    >
      <IconButton
        size="small"
        aria-label="Previous page"
        sx={pageButtonSx}
        disabled={pdf.loading || pdf.error || currentPage === 1}
        onClick={() => changePage(currentPage - 1)}
      >
        <Iconify icon="solar:arrow-left-bold" width={18} />
      </IconButton>
      {usePageSelector ? (
        <CustomSelect
          label="Page"
          size="small"
          disabled={pdf.loading || pdf.error || pdf.pageCount < 2}
          value={currentPage}
          options={Array.from({ length: pdf.pageCount }, (_, index) => ({
            value: index + 1,
            label: `Page ${index + 1} of ${pdf.pageCount}`,
          }))}
          formControlProps={{ sx: { width: 148 } }}
          onChange={(value) => changePage(Number(value))}
        />
      ) : (
        <Typography variant="body2" role="status">
          Page {currentPage} of {pdf.pageCount}
        </Typography>
      )}
      <IconButton
        size="small"
        aria-label="Next page"
        sx={pageButtonSx}
        disabled={pdf.loading || pdf.error || currentPage >= pdf.pageCount}
        onClick={() => changePage(currentPage + 1)}
      >
        <Iconify icon="solar:arrow-right-bold" width={18} />
      </IconButton>
      {separateZoomControls ? (
        <Stack
          direction="row"
          alignItems="center"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}
        >
          <CustomTooltip title="Zoom out">
            <span>
              <IconButton
                aria-label="Zoom out"
                disabled={zoomPercent <= 50 || ((pdf.loading || pdf.error) && !showRenderedPage)}
                onClick={() => setZoomPercent((value) => Math.max(50, value - 25))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:minus" width={20} />
              </IconButton>
            </span>
          </CustomTooltip>
          <Button
            size="small"
            aria-label="Reset zoom"
            disabled={(pdf.loading || pdf.error) && !showRenderedPage}
            onClick={() => setZoomPercent(100)}
          >
            {zoomPercent}%
          </Button>
          <CustomTooltip title="Zoom in">
            <span>
              <IconButton
                aria-label="Zoom in"
                disabled={zoomPercent >= 300 || ((pdf.loading || pdf.error) && !showRenderedPage)}
                onClick={() => setZoomPercent((value) => Math.min(300, value + 25))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:plus" width={20} />
              </IconButton>
            </span>
          </CustomTooltip>
        </Stack>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={
            <Iconify
              icon={zoom ? 'solar:minimize-square-linear' : 'solar:magnifer-zoom-in-linear'}
              width={18}
            />
          }
          disabled={(pdf.loading || pdf.error) && !showRenderedPage}
          onClick={() => setZoom(!zoom)}
        >
          {zoom ? 'Fit Width' : 'Zoom In'}
        </Button>
      )}
    </Stack>
  );
  return (
    <Stack spacing={1}>
      {controlsPosition === 'top' && showControls && controls}
      {pdf.loading && !showRenderedPage && (
        <Skeleton aria-label="Rendering PDF page" variant="rounded" height={400} />
      )}
      {pdf.error && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => setRetry(retry + 1)}>
              Retry PDF
            </Button>
          }
        >
          This PDF could not be displayed. Retry the preview or download the file.
        </Alert>
      )}
      <Box
        role="region"
        aria-label={`${title} PDF pages`}
        tabIndex={0}
        aria-busy={pdf.loading}
        sx={{
          minWidth: 0,
          overflow: separateZoomControls ? 'visible' : 'auto',
          display: pdf.loading || pdf.error ? (showRenderedPage ? 'block' : 'none') : 'block',
        }}
      >
        <Box
          sx={{
            width: separateZoomControls ? `${zoomPercent}%` : zoom ? '150%' : '100%',
            ...(separateZoomControls && { mx: 'auto' }),
            display: 'grid',
            gap: 2,
            gridTemplateColumns:
              showAdjacentPage && isWide && currentPage < pdf.pageCount
                ? 'minmax(0, 1fr) minmax(0, 1fr)'
                : 'minmax(0, 1fr)',
          }}
        >
          <Box sx={{ position: 'relative', minWidth: 0 }}>
            <Box
              component="canvas"
              ref={pdf.canvasRef}
              role="img"
              aria-label={`${title}, page ${pdf.renderedPage ?? currentPage}`}
              sx={{ display: 'block', width: 1, height: 'auto', bgcolor: 'common.white' }}
            />
            {marked && showMarker && (
              <Box
                ref={markRef}
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: `${marked.top}%`,
                  left: `${marked.left ?? 0}%`,
                  width: `${marked.width ?? 100}%`,
                  height: `${marked.height ?? 5}%`,
                  minHeight: 14,
                  border: 1,
                  borderColor: 'info.main',
                  bgcolor: (paletteTheme) => alpha(paletteTheme.palette.info.main, 0.1),
                  borderRadius: 0.5,
                  pointerEvents: 'none',
                  animation: `${revealIn} 280ms ease-out`,
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              />
            )}
          </Box>
          {showAdjacentPage &&
            isWide &&
            currentPage < pdf.pageCount &&
            (pdf.loading ? (
              <Skeleton aria-label="Rendering next PDF page" variant="rounded" height={400} />
            ) : (
              <AdjacentPage
                key={`${url}-${currentPage + 1}`}
                url={url}
                title={title}
                page={currentPage + 1}
              />
            ))}
        </Box>
        {showPageText && pdf.text && (
          <Box component="details" sx={{ p: 1 }}>
            <Box component="summary" sx={{ typography: 'body2', cursor: 'pointer' }}>
              Page Text
            </Box>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', mt: 1 }}
            >
              {pdf.text}
            </Typography>
          </Box>
        )}
      </Box>
      {controlsPosition === 'bottom' && showControls && controls}
    </Stack>
  );
}
