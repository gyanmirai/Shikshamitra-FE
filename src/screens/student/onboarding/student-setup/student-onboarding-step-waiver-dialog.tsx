'use client';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useUpdateStudentOnboardingStepMutation } from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem, OnboardingChecklistItem } from './student-onboarding-model';

type Props = {
  check: OnboardingChecklistItem;
  student: StudentOnboardingItem;
  onClose: () => void;
};

export default function StudentOnboardingStepWaiverDialog({ check, student, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [updateStep, updateState] = useUpdateStudentOnboardingStepMutation();

  useEffect(() => setReason(''), [check.key, student.id]);

  const normalizedReason = reason.trim();

  const handleWaive = async () => {
    if (!normalizedReason) return;

    try {
      await updateStep({
        id: student.id,
        stepKey: check.key,
        concurrencyStamp: student.concurrencyStamp,
        status: 4,
        waiverReason: normalizedReason,
      }).unwrap();
      shikshaMitraToast.success({ message: `${check.label} waived with an audit reason.` });
      onClose();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message:
          problem.detail || 'The requirement could not be waived. Refresh the case and retry.',
      });
    }
  };

  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Review onboarding exception"
      maxWidth="sm"
      disableClose={updateState.isLoading}
      hasUnsavedChanges={Boolean(reason)}
    >
      <DialogScrollContent dividers onSubmit={handleWaive}>
        <Stack spacing={2}>
          <Summary label="Student" value={student.studentName} />
          <Summary label="Requirement" value={check.label} />
          <Alert severity="warning" variant="outlined">
            Waiving this requirement allows activation to continue without resolving the current
            blocker. The reason is retained in the onboarding audit history.
          </Alert>
          <TextField
            required
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Waiver reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            helperText="Explain why this student can proceed without the requirement."
            inputProps={{ maxLength: 1000 }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={updateState.isLoading}>
          Cancel
        </Button>
        <Button
          color="warning"
          variant="contained"
          disabled={!normalizedReason || updateState.isLoading}
          onClick={handleWaive}
        >
          {updateState.isLoading ? 'Saving…' : 'Waive requirement'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}
