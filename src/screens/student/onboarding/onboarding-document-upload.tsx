import type {
  StudentOnboardingDocument,
  StudentOnboardingDocuments,
} from 'src/redux/student/admissions/student-onboarding-documents-api';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useUploadStudentOnboardingDocumentMutation } from 'src/redux/student/admissions/student-onboarding-documents-api';

import { documentActionSchema } from '../admissions/document-verification/document-action-model';

type Props = {
  workspace: StudentOnboardingDocuments;
  document: StudentOnboardingDocument;
  onClose: () => void;
};
export function OnboardingDocumentUpload({ workspace, document, onClose }: Props) {
  const [snapshot] = useState({ workspace, document });
  const [error, setError] = useState('');
  const [upload] = useUploadStudentOnboardingDocumentMutation();
  const { allowedExtensions, maxSizeMb, name } = snapshot.document;
  const formik = useFormik<{ file: File | null; notes: string }>({
    initialValues: { file: null, notes: '' },
    validationSchema: documentActionSchema('upload', allowedExtensions, maxSizeMb),
    onSubmit: async ({ file }) => {
      if (!file) return;
      setError('');
      try {
        await upload({
          caseId: snapshot.workspace.caseId,
          documentTypeId: snapshot.document.documentTypeId,
          concurrencyStamp: snapshot.workspace.concurrencyStamp,
          file,
        }).unwrap();
        shikshaMitraToast.success({
          message: 'Document uploaded. Onboarding readiness refreshed.',
        });
        onClose();
      } catch (failure) {
        const { detail } = parseApiProblemDetail(failure);
        setError(
          detail === 'Something went wrong'
            ? 'Unable to upload this document. Your selected file is still available to retry.'
            : detail
        );
      }
    },
  });
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      title={`Upload ${name}`}
      maxWidth="sm"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">
            This supplies the student document needed for onboarding. Admission review evidence and
            waivers remain in their history.
          </Alert>
          {snapshot.document.hasStudentUpload && (
            <Alert severity="warning">This replaces the existing student upload for {name}.</Alert>
          )}
          <ShakingTextField error={Boolean(formik.touched.file && formik.errors.file)}>
            <TextField
              type="file"
              size="small"
              fullWidth
              required
              label="Document"
              name="file"
              disabled={formik.isSubmitting}
              onChange={(event) =>
                formik.setFieldValue('file', (event.target as HTMLInputElement).files?.[0] ?? null)
              }
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.file && formik.errors.file)}
              helperText={
                formik.touched.file && formik.errors.file
                  ? formik.errors.file
                  : `${allowedExtensions.join(', ').toUpperCase()} · Maximum ${maxSizeMb} MB`
              }
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  accept: allowedExtensions
                    .map((extension) => `.${extension.replace(/^\./, '')}`)
                    .join(','),
                },
              }}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button size="small" variant="outlined" onClick={cancel} disabled={formik.isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={formik.isSubmitting}
          onClick={() => formik.submitForm()}
        >
          Upload document
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
