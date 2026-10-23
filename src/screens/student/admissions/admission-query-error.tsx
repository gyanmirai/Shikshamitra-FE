'use client';

import { Button } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

type AdmissionQueryErrorProps = {
  onRetry: () => void;
};

export function AdmissionQueryError({ onRetry }: AdmissionQueryErrorProps) {
  return (
    <StudentFeedback
      notificationKey="STU-0152"
      presentation="toast"
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      Unable to load this enrollment data.
    </StudentFeedback>
  );
}
