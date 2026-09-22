'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  useGetStudentOnboardingDocumentsQuery,
  useUploadStudentOnboardingDocumentMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

type StudentOnboardingDocumentsProps = {
  caseId: string;
  enabled: boolean;
  canManage: boolean;
};

export default function StudentOnboardingDocuments({
  caseId,
  enabled,
  canManage,
}: StudentOnboardingDocumentsProps) {
  const documentsQuery = useGetStudentOnboardingDocumentsQuery(caseId, { skip: !enabled });
  const [uploadDocument, uploadState] = useUploadStudentOnboardingDocumentMutation();
  const [documentTypeId, setDocumentTypeId] = useState('');
  const documents = useMemo(() => documentsQuery.data?.documents ?? [], [documentsQuery.data]);
  const selectedDocument = documents.find((item) => item.documentTypeId === documentTypeId);

  useEffect(() => {
    if (!documents.length) {
      setDocumentTypeId('');
      return;
    }

    setDocumentTypeId((current) =>
      documents.some((item) => item.documentTypeId === current)
        ? current
        : (documents.find((item) => !item.hasStudentUpload)?.documentTypeId ??
          documents[0].documentTypeId)
    );
  }, [documents]);

  if (!enabled) {
    return (
      <Typography variant="body2" color="text.secondary">
        Document uploads are disabled for this case.
      </Typography>
    );
  }

  if (documentsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => documentsQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Onboarding documents could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      {documents.length ? (
        documents.map((document) => {
          const available = document.hasStudentUpload || document.hasAcceptedAdmissionEvidence;

          return (
            <Stack
              key={document.documentTypeId}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {document.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {document.fileName ||
                    (document.hasAcceptedAdmissionEvidence
                      ? 'Accepted admission evidence'
                      : `${document.allowedExtensions.join(', ')} · up to ${document.maxSizeMb} MB`)}
                </Typography>
              </Stack>
              <Label color={available ? 'success' : document.isRequired ? 'warning' : 'default'}>
                {available ? 'Available' : document.isRequired ? 'Required' : 'Optional'}
              </Label>
            </Stack>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          {documentsQuery.isFetching
            ? 'Loading document requirements...'
            : 'No onboarding document requirements are configured.'}
        </Typography>
      )}

      {documentsQuery.data?.canUpload && canManage && documents.length ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'flex-start' }}
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Document type"
            value={documentTypeId}
            onChange={(event) => setDocumentTypeId(event.target.value)}
          >
            {documents.map((document) => (
              <MenuItem key={document.documentTypeId} value={document.documentTypeId}>
                {document.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            component="label"
            variant="outlined"
            startIcon={<Iconify icon="mdi:upload" width={18} />}
            disabled={!selectedDocument || uploadState.isLoading}
            sx={{ minWidth: 150, minHeight: 40 }}
          >
            {uploadState.isLoading ? 'Uploading...' : 'Upload file'}
            <input
              hidden
              type="file"
              accept={selectedDocument?.allowedExtensions.map((item) => `.${item}`).join(',')}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file || !selectedDocument || !documentsQuery.data) return;

                try {
                  await uploadDocument({
                    caseId,
                    documentTypeId: selectedDocument.documentTypeId,
                    concurrencyStamp: documentsQuery.data.concurrencyStamp,
                    file,
                  }).unwrap();
                  shikshaMitraToast.success({
                    message: `${selectedDocument.name} uploaded successfully.`,
                  });
                } catch {
                  shikshaMitraToast.error({
                    message: `${selectedDocument.name} could not be uploaded. Check the file type and size, then retry.`,
                  });
                } finally {
                  event.target.value = '';
                }
              }}
            />
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
