'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

type Props = {
  busy: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<boolean>;
};

export function CollectLaterDialog({ busy, onClose, onSubmit }: Props) {
  const router = useRouter();
  const submitting = useRef(false);
  const [error, setError] = useState<string>();
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Enter a reason for collecting later.')
        .max(512, 'Use 512 characters or fewer.'),
    }),
    onSubmit: async ({ reason }, helpers) => {
      if (submitting.current || busy) return;
      submitting.current = true;
      setError(undefined);
      try {
        if (await onSubmit(reason.trim())) {
          helpers.resetForm();
          onClose();
        } else {
          setError(
            'Fee collection could not be deferred. Your reason is preserved. Review the application and try again.'
          );
        }
      } catch {
        setError('Fee collection could not be deferred. Your reason is preserved. Try again.');
      } finally {
        submitting.current = false;
      }
    },
  });
  const loading = busy || formik.isSubmitting;
  const guard = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: loading,
    guardContextChanges: true,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy: loading }),
  });
  const close = () => guard.requestNavigation(onClose);
  return (
    <CustomDialog
      open
      title="Collect Later in Onboarding"
      titleInfo="Record why fee collection will be handled after admission finalization."
      maxWidth="sm"
      handleClose={close}
      disableClose={loading}
      guardUnsavedChanges={false}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          formik.submitForm();
        },
        noValidate: true,
      }}
    >
      <DialogScrollContent>
        <FormSectionCard
          title="Collection Deferral"
          icon={GlobalIcons.admissionDetails}
          descriptionTooltip="Explain why collection should remain pending in Onboarding after admission is finalized."
        >
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Move to the next admission step. Fee setup and collection remain pending in Onboarding
              after admission is finalized.
            </Typography>
            <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                size="small"
                label="Reason"
                {...formik.getFieldProps('reason')}
                disabled={loading}
                inputProps={{ maxLength: 512 }}
                error={Boolean(formik.touched.reason && formik.errors.reason)}
                helperText={
                  (formik.touched.reason && formik.errors.reason) ||
                  `${formik.values.reason.length}/512 characters`
                }
              />
            </ShakingTextField>
            {error && (
              <StudentFeedback
                notificationKey="STU-0443"
                presentation="persistent"
                severity="error"
              >
                {error}
              </StudentFeedback>
            )}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={loading}
          onClick={close}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          color="inherit"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={loading}
        >
          Submit
        </LoadingButton>
      </DialogActions>
      {guard.confirmation}
    </CustomDialog>
  );
}
