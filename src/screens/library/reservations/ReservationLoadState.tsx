import { EmptyContent } from 'src/components/empty-content';
import { Alert, Button, Skeleton, LinearProgress } from '@mui/material';

export function ReservationLoadState({
  fetching,
  initial,
  error,
  onRetry,
  empty,
}: {
  fetching: boolean;
  initial: boolean;
  error?: unknown;
  onRetry: () => void;
  empty?: boolean;
}) {
  return (
    <>
      {fetching && <LinearProgress aria-label="Loading reservation data" />}
      {fetching && initial && <Skeleton variant="rounded" height={100} />}
      {Boolean(error) && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Could not load the current reservation data.
        </Alert>
      )}
      {!fetching && !error && empty && <EmptyContent title="No events recorded" />}
    </>
  );
}
