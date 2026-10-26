import { Paper, Stack, Skeleton } from '@mui/material';

export function ClassTeacherHistorySkeleton() {
  return (
    <Stack spacing={2} role="status" aria-label="Loading assignment history">
      {[0, 1, 2].map((item) => (
        <Paper key={item} variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-hidden>
          <Stack spacing={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="90%" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
