import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Button, Skeleton, Typography } from '@mui/material';

import { useDocumentPreview } from './use-document-preview';

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
  const [imageFailed, setImageFailed] = useState(false);
  const retryPreview = () => {
    setImageFailed(false);
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
      {showFileName && (
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {evidence.fileName}
        </Typography>
      )}
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {preview.status === 'loading' ? (
          <Skeleton
            variant="rounded"
            aria-label="Loading Document Preview"
            sx={{ flex: 1, height: 1 }}
          />
        ) : preview.status === 'error' || imageFailed ? (
          <StudentFeedback
            notificationKey="STU-0316"
            presentation="persistent"
            severity="error"
            action={
              <Button size="small" color="inherit" onClick={retryPreview}>
                Retry Preview
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
            title={`${name} Document Preview`}
            aria-label={`${name} Document Preview`}
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
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                overflow: 'auto',
                p: { xs: 1, sm: 2 },
                display: 'flex',
              }}
            >
              <Box
                component="img"
                src={preview.url}
                alt={`${name} Document Preview`}
                onError={() => setImageFailed(true)}
                sx={{
                  display: 'block',
                  m: 'auto',
                  flexShrink: 0,
                  objectFit: 'contain',
                  width: 1,
                  height: 1,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
