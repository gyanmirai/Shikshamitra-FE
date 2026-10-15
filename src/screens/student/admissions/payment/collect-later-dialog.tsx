'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

type Props = {
  busy: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<boolean>;
};

export function CollectLaterDialog({ busy, onClose, onSubmit }: Props) {
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
  return (
    <CustomDialog
      open
      title="Collect Later in Onboarding"
      titleInfo="Record why fee collection will be handled after admission finalization."
      maxWidth="sm"
      handleClose={onClose}
      disableClose={loading}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Move to the next admission step. Fee setup and collection remain pending in Onboarding
            after admission is finalized.
          </Typography>
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
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={loading}
          onClick={() => formik.submitForm()}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
