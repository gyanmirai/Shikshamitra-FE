import { useState } from 'react';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';

import { usePdfPage } from './use-pdf-page';

export default function PdfCanvas({ url, title }: { url: string; title: string }) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(false);
  const pdf = usePdfPage(url, page, retry);
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Button
          size="small"
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
          disabled={pdf.loading || pdf.error || page >= pdf.pageCount}
          onClick={() => setPage(page + 1)}
        >
          Next Page
        </Button>
        <Button size="small" disabled={pdf.loading || pdf.error} onClick={() => setZoom(!zoom)}>
          {zoom ? 'Fit Width' : 'Zoom In'}
        </Button>
      </Stack>
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
        {pdf.text && (
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
    </Stack>
  );
}
