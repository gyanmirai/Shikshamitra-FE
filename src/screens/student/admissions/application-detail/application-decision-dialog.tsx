'use client';

import type {
  AdmissionApplication,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, TextField, Typography } from '@mui/material';

import { ReviewDialog } from '../review/review-dialog';
import { ReviewRecoveryAlert } from '../review/review-recovery-alert';
import { useApplicationDecisionForm } from './use-application-decision-form';
import { ApplicationDecisionDialogActions } from './application-decision-dialog-actions';
import { formatAdmissionReference } from '../admission-reference';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import {
  isDangerousAdmissionDecision,
  ADMISSION_DECISION_ACTION_LABELS,
} from './application-decision-model';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  open: boolean;
  action: AdmissionDecisionAction | null;
  application: AdmissionApplication;
  busy: boolean;
  onClose: () => void;
  onReload: () => Promise<AdmissionApplication>;
  onSubmit: (input: AdmissionApplicationDecisionInput) => Promise<boolean>;
};

export function ApplicationDecisionDialog({
  open,
  action,
  application,
  busy,
  onClose,
  onSubmit,
  onReload,
}: Props) {
  const { formik, current, recovery, canRecord, requiresReason, requiresExpiry, reload } =
    useApplicationDecisionForm({ action, application, onSubmit, onClose, onReload });
  const isBusy = busy || formik.isSubmitting || recovery.reloading;

  if (!action) return null;
  const isDangerous = isDangerousAdmissionDecision(action);
  const concurrencyUnavailable = !canRecord;

  return (
    <ReviewDialog
      open={open}
      onClose={onClose}
      title={ADMISSION_DECISION_ACTION_LABELS[action]}
      maxWidth="sm"
      dirty={formik.dirty}
      busy={isBusy}
      actions={(cancel) => (
        <ApplicationDecisionDialogActions
          action={action}
          busy={isBusy}
          concurrencyUnavailable={concurrencyUnavailable}
          onCancel={cancel}
          onConfirm={() => formik.handleSubmit()}
        />
      )}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <ReviewRecoveryAlert
            context="application"
            error={recovery.error}
            dirty={formik.dirty}
            busy={isBusy}
            onReload={reload}
          />
          <Alert severity={isDangerous ? 'warning' : 'info'}>
            <Typography variant="body2">
              This decision is recorded in the application history for{' '}
              {formatAdmissionReference(current.applicationNumber)}.
            </Typography>
          </Alert>
          {concurrencyUnavailable && (
            <Alert severity="warning">
              This decision is not available in the current application state. Reload after a failed
              request to check the latest permissions and review requirements.
            </Alert>
          )}
          {requiresExpiry && (
            <DateTimePicker
              label="Offer expires at"
              format={ADMISSION_DATE_TIME_FORMAT}
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
              disabled={isBusy}
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
    </ReviewDialog>
  );
}
