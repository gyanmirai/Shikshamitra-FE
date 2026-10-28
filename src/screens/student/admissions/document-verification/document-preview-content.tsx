import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';

import { useDocumentPreview } from './use-document-preview';
import { DocumentFileControl } from './document-file-control';
import { DocumentDownloadButton } from './document-download-button';

/** Authorized file viewer shared by read-only preview and document review. */
export function DocumentPreviewContent({
  evidence,
  name,
  showFileName = true,
}: {
  evidence: AdmissionDocumentEvidence;
  name: string;
  showFileName?: boolean;
}) {
  const { preview, retry } = useDocumentPreview(evidence);
  const [zoom, setZoom] = useState<number | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const imageReady = preview.status === 'ready' && preview.contentType !== 'application/pdf';
  const retryPreview = () => {
    setImageFailed(false);
    setZoom(null);
    retry();
  };
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Stack spacing={1} sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        {showFileName && (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {evidence.fileName} · Copy version {evidence.versionNumber}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" gap={1} useFlexGap flexWrap="wrap">
          {imageReady && !imageFailed && (
            <>
              <DocumentFileControl
                label="Zoom out"
                icon="mdi:magnify-minus-outline"
                disabled={zoom !== null && zoom <= 0.25}
                reason="Minimum zoom reached."
                onClick={() => setZoom((value) => Math.max(0.25, (value ?? 1) - 0.25))}
              />
              <Typography variant="body2" aria-live="polite">
                {zoom === null ? 'Fit' : `${Math.round(zoom * 100)}%`}
              </Typography>
              <DocumentFileControl
                label="Zoom in"
                icon="mdi:magnify-plus-outline"
                disabled={zoom !== null && zoom >= 3}
                reason="Maximum zoom reached."
                onClick={() => setZoom((value) => Math.min(3, (value ?? 1) + 0.25))}
              />
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:fit-to-screen-outline" />}
                onClick={() => setZoom(null)}
              >
                Fit to page
              </Button>
            </>
          )}
          <Box sx={{ ml: 'auto' }}>
            <DocumentDownloadButton evidenceId={evidence.id} fileName={evidence.fileName!} />
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {preview.status === 'loading' ? (
          <Skeleton
            variant="rounded"
            aria-label="Loading document preview"
            sx={{ flex: 1, height: 1 }}
          />
        ) : preview.status === 'error' || imageFailed ? (
          <StudentFeedback
            notificationKey="STU-0316"
            presentation="persistent"
            severity="error"
            action={
              <Button size="small" color="inherit" onClick={retryPreview}>
                Retry preview
              </Button>
            }
          >
            Unable to preview this document.
          </StudentFeedback>
        ) : preview.status === 'unsupported' ? (
          <StudentFeedback notificationKey="STU-0317" presentation="inline" severity="info">
            Preview is unavailable for this format. Download the document to open it.
          </StudentFeedback>
        ) : preview.contentType === 'application/pdf' ? (
          <Box
            component="object"
            data={preview.url}
            type="application/pdf"
            title={`${name} document preview`}
            aria-label={`${name} document preview`}
            sx={{ width: 1, flex: 1, minHeight: 0, border: 0 }}
          >
            <Typography variant="body2">
              Your browser cannot display this PDF. Download it to open it.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto', p: 2, display: 'flex' }}>
              <Box
                component="img"
                src={preview.url}
                alt={`${name} document preview`}
                onLoad={(event) => {
                  if (event.target instanceof HTMLImageElement)
                    setImageWidth(event.target.naturalWidth);
                }}
                onError={() => setImageFailed(true)}
                sx={{
                  display: 'block',
                  m: 'auto',
                  flexShrink: 0,
                  objectFit: 'contain',
                  width: zoom === null || !imageWidth ? 1 : imageWidth * zoom,
                  height: zoom === null ? 1 : 'auto',
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
