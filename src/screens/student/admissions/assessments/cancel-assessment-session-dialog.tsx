import type { AssessmentSession } from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { Button, DialogActions } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useCancelAssessmentSessionMutation } from 'src/redux/student/admissions/admission-assessment-sessions-api';

import { assessmentErrorMessage } from './assessment-utils';

export function CancelAssessmentSessionDialog({
  session,
  onClose,
}: {
  session: AssessmentSession;
  onClose: () => void;
}) {
  const [cancel, state] = useCancelAssessmentSessionMutation();
  const [error, setError] = useState('');
  const submit = async () => {
    try {
      await cancel({ id: session.id, concurrencyStamp: session.concurrencyStamp }).unwrap();
      onClose();
    } catch (failure) {
      setError(assessmentErrorMessage(failure));
    }
  };
  return (
    <CustomDialog
      open
      title={`Cancel ${session.name}`}
      handleClose={onClose}
      guardUnsavedChanges={false}
      disableClose={state.isLoading}
    >
      <DialogScrollContent>
        <StudentFeedback notificationKey="STU-0289" presentation="inline" severity="warning">
          The session will no longer accept bookings. Existing bookings must be resolved before
          cancellation.
        </StudentFeedback>
        {error && (
          <StudentFeedback
            notificationKey="STU-0290"
            presentation="persistent"
            severity="error"
            sx={{ mt: 2 }}
          >
            {error}
          </StudentFeedback>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" variant="outlined" onClick={onClose} disabled={state.isLoading}>
          Keep session
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={submit}
          disabled={state.isLoading}
        >
          Cancel session
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
