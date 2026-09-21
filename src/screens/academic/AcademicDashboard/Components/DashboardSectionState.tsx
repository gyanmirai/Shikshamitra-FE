import type { ReactNode } from 'react';

import { Alert, Button, Skeleton } from '@mui/material';

type DashboardSectionStateProps = {
  dataAvailable: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: ReactNode;
  height?: number;
};

export function DashboardSectionState({
  dataAvailable,
  isLoading,
  isError,
  onRetry,
  children,
  height = 300,
}: DashboardSectionStateProps) {
  if (isLoading && !dataAvailable) {
    return <Skeleton variant="rounded" height={height} />;
  }

  if (isError && !dataAvailable) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
        sx={{ minHeight: height, alignItems: 'center' }}
      >
        This dashboard section could not be loaded.
      </Alert>
    );
  }

  return children;
}
