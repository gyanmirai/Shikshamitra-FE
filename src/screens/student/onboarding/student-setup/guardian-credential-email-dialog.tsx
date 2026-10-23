'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useEnableGuardianCredentialEmailMutation } from 'src/redux/student/onboarding/student-onboarding-api';

export default function GuardianCredentialEmailDialog({
  caseId,
  concurrencyStamp,
  caseLabel,
  onClose,
}: {
  caseId: string;
  concurrencyStamp: string;
  caseLabel?: string;
  onClose: () => void;
}) {
  const [enable, mutation] = useEnableGuardianCredentialEmailMutation();
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .min(3, 'Explain the correction.')
        .max(400, 'Keep the reason within 400 characters.')
        .required('Enter a correction reason.'),
    }),
    onSubmit: async ({ reason }) => {
      try {
        await enable({ id: caseId, concurrencyStamp, reason: reason.trim() }).unwrap();
        shikshaMitraToast.success({
          message: 'Parent credential email enabled for this case. Correction added to history.',
        });
        onClose();
      } catch (error) {
        formik.setStatus(
          parseApiProblemDetail(error).detail ||
            'Unable to save the correction. Refresh the case and retry.'
        );
      }
    },
  });
  const busy = mutation.isLoading || formik.isSubmitting;
  return (
    <CustomDialog
      open
      title="Enable Parent Credential Email"
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent dividers>
        <Stack spacing={1}>
          {caseLabel && (
            <Typography variant="body2" fontWeight={600}>
              {caseLabel}
            </Typography>
          )}
          <Typography variant="body2">
            Enables parent/guardian email for this case and records your reason. School settings
            stay unchanged. Saving this correction does not send an email.
          </Typography>
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              required
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Correction reason"
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
              slotProps={{ htmlInput: { maxLength: 400 } }}
            />
          </ShakingTextField>
          {formik.status && (
            <StudentFeedback notificationKey="STU-0946" presentation="persistent" severity="error">
              {formik.status}
            </StudentFeedback>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={() => {
            if (!formik.dirty || window.confirm('Are you sure you want to leave this page?'))
              onClose();
          }}
          disabled={busy}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:email-check-outline" />}
          loading={busy}
          disabled={busy}
          onClick={() => {
            if (!busy) formik.handleSubmit();
          }}
        >
          Enable for this case
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
