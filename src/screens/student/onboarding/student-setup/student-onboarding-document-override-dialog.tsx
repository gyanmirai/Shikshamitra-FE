'use client';

import * as Yup from 'yup';
import { useId } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useOverrideStudentOnboardingDocumentsMutation } from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

export default function StudentOnboardingDocumentOverrideDialog({
  caseId,
  concurrencyStamp,
  document,
  onClose,
}: {
  caseId: string;
  concurrencyStamp: string;
  document?: { documentTypeId: string; name: string };
  onClose: () => void;
}) {
  const formId = useId();
  const [override, saving] = useOverrideStudentOnboardingDocumentsMutation();
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('An override note is required.')
        .max(1000, 'Keep the note within 1000 characters.'),
    }),
    onSubmit: async (values) => {
      try {
        await override({
          caseId,
          concurrencyStamp,
          documentTypeIds: document ? [document.documentTypeId] : [],
          overrideAll: !document,
          reason: values.reason.trim(),
        }).unwrap();
        shikshaMitraToast.success({ message: 'Document override recorded with your note.' });
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        formik.setStatus(
          problem.detail || 'The override could not be saved. Refresh documents and retry.'
        );
      }
    },
  });

  const busy = saving.isLoading || formik.isSubmitting;
  const submit = () => {
    if (!busy) formik.handleSubmit();
  };

  return (
    <CustomDialog
      open
      title={document ? 'Override Document Requirement' : 'Override All Required Documents'}
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent dividers onSubmit={submit}>
        <Box
          component="form"
          noValidate
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          sx={{ position: 'relative' }}
        >
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              {document?.name || 'All required documents for this student'}
            </Typography>
            <StudentFeedback notificationKey="STU-0985" presentation="inline" severity="warning">
              This bypasses document verification and records the note in the audit history.
            </StudentFeedback>
            <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
              <TextField
                required
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Override note"
                name="reason"
                value={formik.values.reason}
                disabled={busy}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.reason && formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
                inputProps={{ maxLength: 1000 }}
              />
            </ShakingTextField>
            {formik.status && (
              <StudentFeedback
                notificationKey="STU-0986"
                presentation="persistent"
                severity="error"
              >
                {formik.status}
              </StudentFeedback>
            )}
          </Stack>
          {busy && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress aria-label="Saving document override" size={28} />
            </Box>
          )}
        </Box>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          form={formId}
          size="small"
          color="warning"
          variant="contained"
          disabled={busy}
          loading={busy}
          startIcon={<Iconify icon="mdi:check-circle-outline" />}
        >
          {busy ? 'Saving…' : 'Save override'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
