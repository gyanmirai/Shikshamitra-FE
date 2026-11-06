'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
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
  const router = useRouter();
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
  const closeGuard = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    guardContextChanges: true,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy }),
  });
  const requestClose = () => closeGuard.requestNavigation(onClose);
  return (
    <CustomDialog
      open
      title="Enable Parent Credential Email"
      titleInfo="Enable parent email for this case and record the correction reason. This action does not send an email."
      maxWidth="sm"
      handleClose={requestClose}
      disableClose={busy}
      guardUnsavedChanges={false}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          formik.submitForm();
        },
        noValidate: true,
      }}
    >
      <DialogScrollContent dividers>
        <FormSectionCard
          title="Case Email Delivery"
          icon={GlobalIcons.email}
          descriptionTooltip="Review the affected case and explain why parent credential email should be enabled."
        >
          <Stack spacing={2}>
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
              <StudentFeedback
                notificationKey="STU-0946"
                presentation="persistent"
                severity="error"
              >
                {formik.status}
              </StudentFeedback>
            )}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={requestClose}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="small"
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mdi:email-check-outline" />}
          loading={busy}
          disabled={busy}
        >
          Enable for this case
        </Button>
      </DialogActions>
      {closeGuard.confirmation}
    </CustomDialog>
  );
}
