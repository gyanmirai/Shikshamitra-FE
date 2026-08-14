'use client';

import { Alert, Button } from '@mui/material';

type AdmissionQueryErrorProps = {
  onRetry: () => void;
};

export function AdmissionQueryError({ onRetry }: AdmissionQueryErrorProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      Unable to load this enrollment data.
    </Alert>
  );
}
