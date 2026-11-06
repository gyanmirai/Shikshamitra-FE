import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';

import { usePdfPage } from './use-pdf-page';

export default function PdfCanvas({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(false);
  const pdf = usePdfPage(url, page, retry);
  const showControls = !hideControlsForSinglePage || pdf.pageCount > 1;
  const controls = (
    <Stack
      direction="row"
      sx={{ gap: '1px' }}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      useFlexGap
    >
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:arrow-left-bold" width={18} />}
        disabled={pdf.loading || pdf.error || page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous Page
      </Button>
      <Typography variant="body2" role="status">
        Page {page} of {pdf.pageCount}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:arrow-right-bold" width={18} />}
        disabled={pdf.loading || pdf.error || page >= pdf.pageCount}
        onClick={() => setPage(page + 1)}
      >
        Next Page
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon={zoom ? 'solar:minimize-square-linear' : 'solar:magnifer-zoom-in-linear'} width={18} />}
        disabled={pdf.loading || pdf.error}
        onClick={() => setZoom(!zoom)}
      >
        {zoom ? 'Fit Width' : 'Zoom In'}
      </Button>
    </Stack>
  );
  return (
    <Stack spacing={1}>
      {controlsPosition === 'top' && showControls && controls}
      {pdf.loading && <Skeleton aria-label="Rendering PDF page" variant="rounded" height={400} />}
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
        sx={{ minWidth: 0, overflow: 'auto', display: pdf.loading || pdf.error ? 'none' : 'block' }}
      >
        <Box
          component="canvas"
          ref={pdf.canvasRef}
          role="img"
          aria-label={`${title}, page ${page}`}
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
