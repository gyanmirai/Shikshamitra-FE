import { Stack, Skeleton } from '@mui/material';

export default function ChargeViewSkeleton() {
  return (
    <Stack spacing={2} sx={{ p: 2 }} role="status" aria-label="Loading charge details">
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}
