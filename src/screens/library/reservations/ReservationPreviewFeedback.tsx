import { Alert, Button, LinearProgress } from '@mui/material';

export function ReservationPreviewFeedback({
  data,
  fetching,
  error,
  onRetry,
  mode = 'create',
}: {
  data?: {
    requiresExplicitExpiry: boolean;
    blockedReasons: string[];
    canCreate?: boolean;
    canReview?: boolean;
  };
  fetching: boolean;
  error?: unknown;
  onRetry: () => void;
  mode?: 'create' | 'review';
}) {
  return (
    <>
      {fetching && <LinearProgress aria-label="Checking reservation policy" />}
      {Boolean(error) && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Could not check the current reservation policy. Your draft is retained.
        </Alert>
      )}
      {data && (
        <Alert severity={data.canCreate || data.canReview ? 'info' : 'warning'}>
          {data.requiresExplicitExpiry
            ? 'This policy requires an explicit request expiry date. '
            : 'This policy permits a request without an explicit expiry. '}
          {data.blockedReasons.join(' ')}{' '}
          {mode === 'create'
            ? 'Submitting creates a request; an assigned copy and pickup deadline appear only when allocated.'
            : 'Review saves the proposed member and school dates while retaining original evidence. Allocation is determined by the server after save.'}
        </Alert>
      )}
    </>
  );
}
