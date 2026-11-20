import type { PortalPage } from 'src/redux/library/library-portal-api';

import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

export const portalPageSize = 20;

export function PortalPageStatus({
  busy,
  error,
  retry,
}: {
  busy: boolean;
  error: boolean;
  retry: () => void;
}) {
  if (error)
    return (
      <Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
        Could not load this Library view.
      </Alert>
    );
  return busy ? <LinearProgress aria-label="Loading Library records" /> : null;
}

export function PortalPageControls({
  data,
  setPage,
}: {
  data?: PortalPage<unknown>;
  setPage: (page: number) => void;
}) {
  if (!data || data.totalCount <= data.pageSize) return null;
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
      <Typography variant="body2">
        Page {data.currentPage} of {Math.ceil(data.totalCount / data.pageSize)}
      </Typography>
      <Button
        size="small"
        disabled={data.currentPage <= 1}
        onClick={() => setPage(data.currentPage - 1)}
      >
        Previous
      </Button>
      <Button
        size="small"
        disabled={data.currentPage * data.pageSize >= data.totalCount}
        onClick={() => setPage(data.currentPage + 1)}
      >
        Next
      </Button>
    </Stack>
  );
}
