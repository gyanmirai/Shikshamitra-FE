import { Alert, Button, AlertTitle } from '@mui/material';

type Props = {
  isLoading: boolean;
  onRetry: () => unknown;
};

export function RubricListError({ isLoading, onRetry }: Props) {
  return (
    <Alert
      severity="error"
      action={
        <Button size="small" color="inherit" loading={isLoading} onClick={onRetry}>
          Retry
        </Button>
      }
    >
      <AlertTitle>Unable to load rubric templates</AlertTitle>
      The request failed. Please try again.
    </Alert>
  );
}
