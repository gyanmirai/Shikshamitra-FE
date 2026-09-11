import type {
  StudentOnboardingDocument,
  StudentOnboardingDocuments,
} from 'src/redux/student/admissions/student-onboarding-documents-api';

import { useState } from 'react';
import { Chip, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetStudentOnboardingDocumentsQuery } from 'src/redux/student/admissions/student-onboarding-documents-api';

import { OnboardingDocumentUpload } from './onboarding-document-upload';

export function OnboardingDocuments({ caseId }: { caseId: string }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetStudentOnboardingDocumentsQuery(caseId);
  const [selection, setSelection] = useState<{
    workspace: StudentOnboardingDocuments;
    document: StudentOnboardingDocument;
  } | null>(null);
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {isLoading ? (
        <Skeleton variant="rounded" height={96} />
      ) : isError || !data ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Unable to load onboarding documents.
        </Alert>
      ) : (
        <>
          {isFetching && <LinearProgress aria-label="Refreshing onboarding documents" />}
          {!data.documents.length && (
            <Typography variant="body2" color="text.secondary">
              No student document categories are configured.
            </Typography>
          )}
          {data.documents.map((document) => {
            const present = document.hasStudentUpload || document.hasAcceptedAdmissionEvidence;
            return (
              <Stack
                key={document.documentTypeId}
                spacing={0.5}
                sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography variant="subtitle2">{document.name}</Typography>
                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={document.isRequired ? 'Required' : 'Optional'}
                  />
                  <Chip
                    size="small"
                    color={present ? 'success' : 'default'}
                    label={
                      document.hasStudentUpload
                        ? 'Student upload on file'
                        : document.hasAcceptedAdmissionEvidence
                          ? 'Accepted admission evidence'
                          : 'Missing'
                    }
                  />
                  {data.canUpload && (
                    <Button
                      size="small"
                      disabled={isFetching || document.allowedExtensions.length === 0}
                      onClick={() => setSelection({ workspace: data, document })}
                    >
                      {document.hasStudentUpload
                        ? `Replace ${document.name}`
                        : `Upload ${document.name}`}
                    </Button>
                  )}
                </Stack>
                {document.fileName && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {document.fileName}
                  </Typography>
                )}
                {!document.allowedExtensions.length && data.canUpload && (
                  <Typography variant="caption" color="error.main">
                    Configure an allowed file format for this document category before uploading.
                  </Typography>
                )}
              </Stack>
            );
          })}
          {!data.canUpload && data.documents.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Uploads require an active onboarding case and permission to edit it.
            </Typography>
          )}
        </>
      )}
      {selection && <OnboardingDocumentUpload {...selection} onClose={() => setSelection(null)} />}
    </Stack>
  );
}
