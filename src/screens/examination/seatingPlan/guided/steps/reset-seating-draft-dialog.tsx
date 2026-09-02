import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import type { GuidedStepProps } from '../types';

export function ResetSeatingDraftDialog({
  open,
  workflow,
  onClose,
}: {
  open: boolean;
  workflow: GuidedStepProps['workflow'];
  onClose: () => void;
}) {
  const [reason, setReason] = useState('Rebuild and regroup all examination seating plans');
  const [submitting, setSubmitting] = useState(false);

  const reset = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await workflow.resetDraft(reason.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={submitting ? () => undefined : onClose}
      icon="warning"
      title="Reset all draft seating?"
      content={
        <Stack spacing={1.5}>
          <Typography variant="body2">
            This removes {workflow.readiness.totalPlanCount} draft plan
            {workflow.readiness.totalPlanCount === 1 ? '' : 's'} and{' '}
            {workflow.readiness.allocatedStudentSeats} saved seat assignment
            {workflow.readiness.allocatedStudentSeats === 1 ? '' : 's'}. Examination subjects and
            schedules are not deleted.
          </Typography>
          <Alert severity="warning">
            You can immediately regroup every subject and create the seating again. This action is
            unavailable after publication.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            required
            label="Reason for reset"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
        </Stack>
      }
      action={
        <LoadingButton
          color="error"
          variant="contained"
          loading={submitting}
          disabled={!reason.trim()}
          onClick={reset}
        >
          Reset draft and start again
        </LoadingButton>
      }
    />
  );
}
