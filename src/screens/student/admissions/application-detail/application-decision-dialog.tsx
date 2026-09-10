'use client';

import type {
  AdmissionApplication,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';
import {
  ADMISSION_DECISION_ACTION_LABELS,
  admissionDecisionRequiresReason,
  isDangerousAdmissionDecision,
} from './application-decision-model';

type Props = {
  open: boolean;
  action: AdmissionDecisionAction | null;
  application: AdmissionApplication;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: AdmissionApplicationDecisionInput) => Promise<boolean>;
};

export function ApplicationDecisionDialog({
  open,
  action,
  application,
  busy,
  onClose,
  onSubmit,
}: Props) {
  const requiresReason = admissionDecisionRequiresReason(action);
  const requiresExpiry = action === 'offer';
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: '', offerExpiresAt: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .max(512, 'Use 512 characters or fewer')
        .test(
          'required-reason',
          'Reason is required for this decision',
          (value) => !requiresReason || Boolean(value?.trim())
        ),
      offerExpiresAt: Yup.string().test(
        'future-offer-expiry',
        'Offer expiry must be in the future',
        (value) => !requiresExpiry || Boolean(value && new Date(value).getTime() > Date.now())
      ),
    }),
    onSubmit: async (values, helpers) => {
      const success = await onSubmit({
        reason: values.reason.trim() || undefined,
        offerExpiresAt: values.offerExpiresAt
          ? new Date(values.offerExpiresAt).toISOString()
          : undefined,
        concurrencyStamp: application.concurrencyStamp,
      });
      if (success) {
        helpers.resetForm();
        onClose();
      }
    },
  });

  if (!action) return null;
  const isDangerous = isDangerousAdmissionDecision(action);
  const concurrencyUnavailable = !application.concurrencyStamp;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={ADMISSION_DECISION_ACTION_LABELS[action]}
      maxWidth="sm"
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Alert severity={isDangerous ? 'warning' : 'info'}>
            <Typography variant="body2">
              This decision is recorded in the application history for{' '}
              {application.applicationNumber}.
            </Typography>
          </Alert>
          {concurrencyUnavailable && (
            <Alert severity="warning">
              The application is still loading or has changed. Refresh before recording a decision.
            </Alert>
          )}
          {requiresExpiry && (
            <DateTimePicker
              label="Offer expires at"
              value={formik.values.offerExpiresAt ? dayjs(formik.values.offerExpiresAt) : null}
              minDateTime={dayjs()}
              onChange={(value) =>
                formik.setFieldValue('offerExpiresAt', value?.isValid() ? value.toISOString() : '')
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  size: 'small',
                  onBlur: () => formik.setFieldTouched('offerExpiresAt', true),
                  error: Boolean(formik.touched.offerExpiresAt && formik.errors.offerExpiresAt),
                  helperText: formik.touched.offerExpiresAt && formik.errors.offerExpiresAt,
                },
              }}
            />
          )}
          {action !== 'accept' && (
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label={requiresReason ? 'Reason *' : 'Reason (optional)'}
              {...formik.getFieldProps('reason')}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          disabled={busy}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          disabled={busy || concurrencyUnavailable}
          color={isDangerous ? 'warning' : 'primary'}
          startIcon={<Iconify icon="mdi:check-circle-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          {ADMISSION_DECISION_ACTION_LABELS[action]}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
