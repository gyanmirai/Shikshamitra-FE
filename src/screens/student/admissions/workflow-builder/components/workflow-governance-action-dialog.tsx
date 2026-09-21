'use client';

import type { AdmissionWorkflowApprover } from 'src/redux/student/admissions/admission-workflows-api';

import * as yup from 'yup';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, TextField, Typography, DialogActions } from '@mui/material';

import { ADMISSION_DATE_TIME_FORMAT } from '../../admission-date-formats';

export type WorkflowGovernanceActionMode = 'submit' | 'approve' | 'reject' | 'publish' | 'rollback';

type Payload = { reason: string; approverUserId?: string; effectiveAt?: string };
type FormValues = { reason: string; approverUserId: string; effectiveAt: dayjs.Dayjs | null };
type Props = {
  mode: WorkflowGovernanceActionMode | null;
  workflowName: string;
  approvers: AdmissionWorkflowApprover[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: Payload) => Promise<void>;
};

const TITLES: Record<WorkflowGovernanceActionMode, string> = {
  submit: 'Submit workflow for approval',
  approve: 'Approve workflow',
  reject: 'Request workflow changes',
  publish: 'Publish workflow',
  rollback: 'Create rollback draft',
};

export function WorkflowGovernanceActionDialog({
  mode,
  workflowName,
  approvers,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: { reason: '', approverUserId: '', effectiveAt: null },
    validationSchema: yup.object({
      reason: yup
        .string()
        .trim()
        .max(1000, 'Reason must be 1000 characters or fewer.')
        .test('reason-required', 'Enter a reason before continuing.', (value) =>
          mode === 'approve' ? true : Boolean(value?.trim())
        ),
      approverUserId: yup
        .string()
        .test('approver-required', 'Select an approver.', (value) =>
          mode === 'submit' ? Boolean(value) : true
        ),
      effectiveAt: yup
        .mixed<dayjs.Dayjs>()
        .nullable()
        .test(
          'future-effective-time',
          'Choose a future time or leave this blank to publish now.',
          (value) => !value || value.isAfter(dayjs())
        ),
    }),
    onSubmit: async (values) => {
      await onConfirm({
        reason: values.reason.trim(),
        approverUserId: values.approverUserId || undefined,
        effectiveAt: values.effectiveAt?.toISOString(),
      });
    },
  });

  const resetActionForm = formik.resetForm;
  useEffect(() => {
    if (!mode) return;
    resetActionForm({ values: { reason: '', approverUserId: '', effectiveAt: null } });
  }, [mode, resetActionForm]);

  if (!mode) return null;
  const needsReason = mode !== 'approve';
  const handleCancel = () => {
    if (formik.dirty && !window.confirm('Discard the changes in this dialog?')) return;
    onClose();
  };

  const descriptions: Record<WorkflowGovernanceActionMode, string> = {
    submit: 'Choose the independent checker who must review this validated version.',
    approve:
      'Approval confirms that this version is ready to publish. You cannot approve your own submission.',
    reject: 'The workflow returns to Draft so the owner can make the requested changes.',
    publish:
      'Publish now, or choose a future effective time. Existing applications keep their pinned version.',
    rollback:
      'A new draft is created from this historical version. Nothing is repointed or published automatically.',
  };

  return (
    <CustomDialog
      open
      maxWidth="sm"
      title={TITLES[mode]}
      handleClose={busy ? () => undefined : onClose}
      disableClose={busy}
      hasUnsavedChanges={formik.dirty}
    >
      <DialogScrollContent onSubmit={formik.handleSubmit}>
        <Stack spacing={1.5}>
          <Alert severity={mode === 'reject' || mode === 'rollback' ? 'warning' : 'info'}>
            {descriptions[mode]}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {workflowName}
          </Typography>
          {mode === 'submit' && (
            <ShakingTextField
              error={Boolean(formik.touched.approverUserId && formik.errors.approverUserId)}
            >
              <CustomSelect
                name="approverUserId"
                label="Approver"
                value={formik.values.approverUserId}
                options={approvers.map((approver) => ({
                  value: approver.id,
                  label: approver.name || approver.userName,
                }))}
                onChange={(value) => formik.setFieldValue('approverUserId', String(value))}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.approverUserId && formik.errors.approverUserId)}
                helperText={
                  (formik.touched.approverUserId && formik.errors.approverUserId) ||
                  'The selected user must have workflow approval access.'
                }
                formControlProps={{ required: true }}
                noOptionsMessage="No active users found"
              />
            </ShakingTextField>
          )}
          {mode === 'publish' && (
            <ShakingTextField
              error={Boolean(formik.touched.effectiveAt && formik.errors.effectiveAt)}
            >
              <DateTimePicker
                label="Effective time (optional)"
                format={ADMISSION_DATE_TIME_FORMAT}
                value={formik.values.effectiveAt}
                minDateTime={dayjs()}
                onChange={(value) => formik.setFieldValue('effectiveAt', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    onBlur: () => formik.setFieldTouched('effectiveAt', true),
                    error: Boolean(formik.touched.effectiveAt && formik.errors.effectiveAt),
                    helperText:
                      (formik.touched.effectiveAt && formik.errors.effectiveAt) ||
                      'Leave blank to publish now. The selected time is stored as an absolute instant.',
                  },
                }}
              />
            </ShakingTextField>
          )}
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              fullWidth
              required={needsReason}
              multiline
              minRows={3}
              maxRows={6}
              size="small"
              name="reason"
              label={
                mode === 'reject'
                  ? 'Changes required'
                  : mode === 'approve'
                    ? 'Approval note (optional)'
                    : 'Change reason'
              }
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={
                (formik.touched.reason && formik.errors.reason) ||
                `${formik.values.reason.length}/1000 characters`
              }
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={handleCancel}
          disabled={busy}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          color={mode === 'reject' ? 'warning' : 'primary'}
          loading={busy}
          disabled={busy}
          startIcon={<Iconify icon={mode === 'reject' ? 'mdi:undo-variant' : 'mdi:check'} />}
          onClick={() => formik.handleSubmit()}
        >
          {mode === 'submit'
            ? 'Submit for approval'
            : mode === 'approve'
              ? 'Approve'
              : mode === 'reject'
                ? 'Return to draft'
                : mode === 'rollback'
                  ? 'Create rollback draft'
                  : formik.values.effectiveAt
                    ? 'Schedule publication'
                    : 'Publish now'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
