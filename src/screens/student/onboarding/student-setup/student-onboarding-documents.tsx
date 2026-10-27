'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  useGetStudentOnboardingDocumentsQuery,
  useUploadStudentOnboardingDocumentMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { StudentSetupLoadingRows } from './student-setup-loading';

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
  const documentsQuery = useGetStudentOnboardingDocumentsQuery(caseId, { skip: !caseId });
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

  if (documentsQuery.isError) {
    return (
      <StudentFeedback
        notificationKey="STU-0991"
        presentation="toast"
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => documentsQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Student documents could not be loaded. Refresh the page.
      </StudentFeedback>
    );
  }

  if (documentsQuery.isFetching && !documentsQuery.data) {
    return <StudentSetupLoadingRows label="Loading document requirements" count={2} />;
  }

  return (
    <Stack spacing={1}>
      {!enabled && (
        <Typography variant="body2" color="text.secondary">
          Document uploads are disabled for this case. Required evidence can still be reviewed.
        </Typography>
      )}
      {documents.length ? (
        documents.map((document) => {
          const satisfied =
            document.isValidated || document.hasAcceptedAdmissionEvidence || document.isOverridden;

          return (
            <Stack
              key={document.documentTypeId}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
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
                {document.isOverridden && document.overrideReason && (
                  <Typography variant="caption" color="text.secondary">
                    Override note: {document.overrideReason}
                  </Typography>
                )}
              </Stack>
              <Label color={satisfied ? 'success' : document.isRequired ? 'warning' : 'default'}>
                {document.isOverridden
                  ? 'Overridden'
                  : satisfied
                    ? 'Verified'
                    : document.hasStudentUpload
                      ? 'Awaiting verification'
                      : document.isRequired
                        ? 'Required'
                        : 'Optional'}
              </Label>
            </Stack>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          No onboarding document requirements are configured.
        </Typography>
      )}

      {enabled && documentsQuery.data?.canUpload && canManage && documents.length ? (
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
            disabled={uploadState.isLoading || documentsQuery.isFetching}
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
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:upload" width={18} />}
            disabled={!selectedDocument || uploadState.isLoading}
            sx={{ flexShrink: 0 }}
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
                    message: `${selectedDocument.name} uploaded.`,
                  });
                } catch {
                  shikshaMitraToast.error({
                    message: `${selectedDocument.name} could not be uploaded. Check the allowed file type and size, then try again.`,
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
