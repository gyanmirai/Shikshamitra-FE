'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useEnableStudentAppAccessMutation } from 'src/redux/student/onboarding/student-onboarding-api';

import { getOnboardingErrorMessage } from './student-onboarding-messages';

type Props = {
  caseId: string;
  caseLabel: string;
  concurrencyStamp: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function StudentAppAccessDialog({
  caseId,
  caseLabel,
  concurrencyStamp,
  onClose,
  onSaved,
}: Props) {
  const router = useRouter();
  const [enable, mutation] = useEnableStudentAppAccessMutation();
  const submitting = useRef(false);
  const mounted = useRef(true);
  const reasonRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .min(3, 'Explain the correction.')
        .max(400, 'Keep the reason within 400 characters.')
        .required('Enter a correction reason.'),
    }),
    onSubmit: async ({ reason }, helpers) => {
      if (submitting.current || !mounted.current) return;
      submitting.current = true;
      try {
        await enable({ id: caseId, reason: reason.trim(), concurrencyStamp }).unwrap();
        if (!mounted.current) return;
        helpers.resetForm();
        shikshaMitraToast.success({
          message: 'Student login enabled. Select Student to send login details.',
        });
        onSaved();
        onClose();
      } catch (error) {
        if (mounted.current)
          helpers.setStatus(
            getOnboardingErrorMessage(
              error,
              'Student login could not be enabled. Refresh App Login and try again.'
            )
          );
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = mutation.isLoading || formik.isSubmitting;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    push: router.push,
  });
  const close = () => requestNavigation(onClose);
  const reasonError = Boolean(formik.touched.reason && formik.errors.reason);
  return (
    <>
      <CustomDialog
        open
        title="Enable Student Login"
        maxWidth="xs"
        handleClose={close}
        disableClose={busy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: async (event) => {
            event.preventDefault();
            if (busy || submitting.current) return;
            const errors = await formik.validateForm();
            if (errors.reason) {
              await formik.setTouched({ reason: true });
              reasonRef.current?.focus();
              return;
            }
            await formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy} label="Enabling student login…">
            <FormSectionCard
              title="Student Access"
              icon={GlobalIcons.admissionStudent}
              descriptionTooltip="Enable optional app access for this student and record the reason in history."
            >
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {caseLabel}
                </Typography>
                <Typography variant="body2">
                  Enables optional Student login for this case. Send login details separately after
                  saving.
                </Typography>
                <ShakingTextField error={reasonError}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Correction reason"
                    name="reason"
                    inputRef={reasonRef}
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    error={reasonError}
                    helperText={reasonError ? formik.errors.reason : undefined}
                    slotProps={{ htmlInput: { maxLength: 400 } }}
                  />
                </ShakingTextField>
                {formik.status && (
                  <Typography role="alert" variant="body2" color="error.main">
                    {formik.status}
                  </Typography>
                )}
              </Stack>
            </FormSectionCard>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            color="inherit"
            loading={busy}
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
