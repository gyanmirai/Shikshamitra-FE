import { Stack, Skeleton } from '@mui/material';

export function WorkflowBuilderLoading() {
  return (
    <Stack spacing={2}>
      <Skeleton height={80} />
      <Skeleton variant="rounded" height={420} />
    </Stack>
  );
}
