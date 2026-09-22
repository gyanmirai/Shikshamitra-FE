import { Box, Stack, Skeleton } from '@mui/material';

export function WorkflowBuilderLoading() {
  return (
    <Box
      role="status"
      aria-label="Loading workflow builder"
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Skeleton width={240} height={32} />
        <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 0 }} />
      </Stack>
    </Box>
  );
}
