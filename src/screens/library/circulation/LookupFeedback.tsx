import { Alert, Button, LinearProgress } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function LookupFeedback({
  pending,
  error,
  onRetry,
  label,
  retryLabel = 'Retry',
  retryDisabled = false,
}: {
  pending: boolean;
  error?: unknown;
  onRetry: () => void;
  label: string;
  retryLabel?: string;
  retryDisabled?: boolean;
}) {
  return (
    <>
      {pending && <LinearProgress aria-label={`Looking up ${label}`} />}
      {Boolean(error) && (
        <Alert
          severity="error"
          action={
            <Button type="button" size="small" disabled={retryDisabled} onClick={onRetry}>
              {retryLabel}
            </Button>
          }
        >
          {parseApiProblemDetail(error).detail || `Could not look up ${label}.`}
        </Alert>
      )}
    </>
  );
}
