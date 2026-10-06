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

import StudentOnboardingDocumentOverrideDialog from './student-onboarding-document-override-dialog';

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
  const [overrideTarget, setOverrideTarget] = useState<
    { documentTypeId: string; name: string } | 'all' | null
  >(null);
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
    <Stack spacing={1}>
      {!enabled && (
        <Typography variant="body2" color="text.secondary">
          Document uploads are disabled for this case. Required evidence and authorized overrides
          can still be reviewed.
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
              {documentsQuery.data?.canOverride && document.isRequired && !satisfied && (
                <Button
                  size="small"
                  color="warning"
                  disabled={uploadState.isLoading || documentsQuery.isFetching}
                  onClick={() => setOverrideTarget(document)}
                >
                  Override {document.name}
                </Button>
              )}
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
      {documentsQuery.data?.canOverride &&
        documents.some(
          (item) =>
            item.isRequired &&
            !item.isValidated &&
            !item.hasAcceptedAdmissionEvidence &&
            !item.isOverridden
        ) && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            sx={{ alignSelf: 'flex-start' }}
            disabled={uploadState.isLoading || documentsQuery.isFetching}
            onClick={() => setOverrideTarget('all')}
          >
            Override all required documents
          </Button>
        )}
      {overrideTarget && documentsQuery.data?.canOverride && (
        <StudentOnboardingDocumentOverrideDialog
          caseId={caseId}
          concurrencyStamp={documentsQuery.data.concurrencyStamp}
          document={overrideTarget === 'all' ? undefined : overrideTarget}
          onClose={() => setOverrideTarget(null)}
        />
      )}
    </Stack>
  );
}
