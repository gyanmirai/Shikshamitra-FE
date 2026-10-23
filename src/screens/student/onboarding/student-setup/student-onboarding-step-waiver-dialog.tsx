'use client';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
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
  const isApproval = check.key === 'approval_review';

  const handleWaive = async () => {
    if (!normalizedReason) return;

    try {
      await updateStep({
        id: student.id,
        stepKey: check.key,
        concurrencyStamp: student.concurrencyStamp,
        status: isApproval ? 2 : 4,
        detail: isApproval ? normalizedReason : undefined,
        waiverReason: isApproval ? undefined : normalizedReason,
      }).unwrap();
      shikshaMitraToast.success({
        message: isApproval
          ? 'Onboarding approval recorded.'
          : `${check.label} waived with an audit reason.`,
      });
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
      title={isApproval ? 'Approve Onboarding' : 'Review Onboarding Exception'}
      maxWidth="sm"
      disableClose={updateState.isLoading}
      hasUnsavedChanges={Boolean(reason)}
    >
      <DialogScrollContent dividers onSubmit={handleWaive}>
        <Stack spacing={2}>
          <Summary label="Student" value={student.studentName} />
          <Summary label="Requirement" value={check.label} />
          <StudentFeedback
            notificationKey="STU-1022"
            presentation="inline"
            severity="warning"
            variant="outlined"
          >
            {isApproval
              ? 'Approval does not bypass other readiness checks.'
              : 'Waiving this requirement removes its activation blocker and records the reason.'}
          </StudentFeedback>
          <TextField
            required
            fullWidth
            multiline
            minRows={3}
            size="small"
            label={isApproval ? 'Approval note' : 'Waiver reason'}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
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
          {updateState.isLoading
            ? 'Saving…'
            : isApproval
              ? 'Approve onboarding'
              : 'Waive requirement'}
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
