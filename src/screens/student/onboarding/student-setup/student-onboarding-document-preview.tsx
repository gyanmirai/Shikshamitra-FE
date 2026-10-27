'use client';

import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Tooltip, Skeleton, Typography, IconButton } from '@mui/material';
import { useDocumentPreview } from 'src/screens/student/admissions/document-verification/use-document-preview';
import { DocumentDownloadButton } from 'src/screens/student/admissions/document-verification/document-download-button';

/** The existing authenticated blob viewer in the shared read-only dialog shell. */
export function StudentOnboardingDocumentPreview({
  evidence,
  name,
  onClose,
}: {
  evidence: AdmissionDocumentEvidence;
  name: string;
  onClose: () => void;
}) {
  const { preview, retry } = useDocumentPreview(evidence);
  const [imageFailed, setImageFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const retryPreview = () => {
    setImageFailed(false);
    setZoom(1);
    retry();
  };
  const imageReady = preview.status === 'ready' && preview.contentType !== 'application/pdf';

  return (
    <CustomDialog
      open
      title={name}
      aria-label={`${name} document preview`}
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {imageReady && !imageFailed && (
              <>
                <Tooltip title="Zoom out">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Zoom out"
                      disabled={zoom <= 0.5}
                      onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
                    >
                      <Iconify icon="mdi:magnify-minus-outline" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="caption" aria-live="polite">
                  {Math.round(zoom * 100)}%
                </Typography>
                <Tooltip title="Zoom in">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Zoom in"
                      disabled={zoom >= 3}
                      onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
                    >
                      <Iconify icon="mdi:magnify-plus-outline" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Fit to page">
                  <IconButton size="small" aria-label="Fit to page" onClick={() => setZoom(1)}>
                    <Iconify icon="mdi:fit-to-screen-outline" width={18} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Box sx={{ flex: 1 }} />
            <DocumentDownloadButton
              compact
              evidenceId={evidence.id}
              fileName={evidence.fileName!}
              label={`Download ${name}`}
            />
          </Stack>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1, overflowWrap: 'anywhere' }}
            >
              {evidence.fileName}
            </Typography>
            {preview.status === 'loading' ? (
              <Skeleton variant="rounded" height={320} aria-label="Loading document preview" />
            ) : preview.status === 'error' || imageFailed ? (
              <StudentFeedback
                notificationKey="STU-0987"
                presentation="toast"
                severity="error"
                action={
                  <Button size="small" color="inherit" onClick={retryPreview}>
                    Retry preview
                  </Button>
                }
              >
                The document could not be opened. Try again or download it.
              </StudentFeedback>
            ) : preview.status === 'unsupported' ? (
              <StudentFeedback notificationKey="STU-0988" presentation="inline" severity="info">
                Preview is unavailable for this format. Download the document to open it.
              </StudentFeedback>
            ) : preview.contentType === 'application/pdf' ? (
              <Box
                component="object"
                data={preview.url}
                type="application/pdf"
                title={`${name} preview`}
                aria-label={`${name} PDF preview`}
                sx={{ width: 1, height: 420, border: 0 }}
              >
                <Typography variant="body2">
                  Your browser cannot display this PDF. Download it to open it.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  overflow: 'auto',
                  bgcolor: 'background.neutral',
                  maxHeight: 480,
                  minHeight: 240,
                  p: 1,
                }}
              >
                <Box
                  component="img"
                  src={preview.url}
                  alt={`${name} preview`}
                  onError={() => setImageFailed(true)}
                  sx={{
                    display: 'block',
                    width: `${zoom * 100}%`,
                    maxWidth: 'none',
                    height: 'auto',
                    mx: 'auto',
                  }}
                />
              </Box>
            )}
          </Box>
        </Stack>
      </DialogScrollContent>
    </CustomDialog>
  );
}
