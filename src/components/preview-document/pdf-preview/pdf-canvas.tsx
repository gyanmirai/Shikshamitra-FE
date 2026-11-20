import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Alert, Button, Skeleton, IconButton, Typography } from '@mui/material';

import { usePdfPage } from './use-pdf-page';

export default function PdfCanvas({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
  usePageSelector = false,
  initialPage = 1,
  onPageChange,
  onPageCountChange,
  preservePageOnUpdate = false,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
  usePageSelector?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (count: number) => void;
  preservePageOnUpdate?: boolean;
}) {
  const [page, setPage] = useState(initialPage);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(false);
  const pdf = usePdfPage(url, page, retry, preservePageOnUpdate);
  useEffect(() => {
    if (pdf.hasRendered) onPageCountChange?.(pdf.pageCount);
  }, [onPageCountChange, pdf.hasRendered, pdf.pageCount]);
  const showRenderedPage = pdf.hasRendered && preservePageOnUpdate;
  const currentPage = Math.min(page, pdf.pageCount);
  const changePage = (next: number) => {
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
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0.75 }}
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
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0.75 }}
        disabled={pdf.loading || pdf.error || currentPage >= pdf.pageCount}
        onClick={() => changePage(currentPage + 1)}
      >
        <Iconify icon="solar:arrow-right-bold" width={18} />
      </IconButton>
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
          overflow: 'auto',
          display: pdf.loading || pdf.error ? (showRenderedPage ? 'block' : 'none') : 'block',
        }}
      >
        <Box
          component="canvas"
          ref={pdf.canvasRef}
          role="img"
          aria-label={`${title}, page ${pdf.renderedPage ?? currentPage}`}
          sx={{
            display: 'block',
            width: zoom ? '150%' : '100%',
            height: 'auto',
            bgcolor: 'common.white',
          }}
        />
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
