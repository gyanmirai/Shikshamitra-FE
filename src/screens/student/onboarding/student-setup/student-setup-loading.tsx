import { Box, Stack, Skeleton } from '@mui/material';

type LoadingRowsProps = {
  label: string;
  count?: number;
  withStatus?: boolean;
};

export function StudentSetupLoadingRows({ label, count = 2, withStatus = true }: LoadingRowsProps) {
  return (
    <Stack role="status" aria-label={label} spacing={0}>
      {Array.from({ length: count }, (_, index) => (
        <Stack
          key={index}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ py: 1.25, borderBottom: index < count - 1 ? '1px solid' : 0, borderColor: 'divider' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="55%" height={22} />
            <Skeleton variant="text" width="75%" height={18} />
          </Box>
          {withStatus && <Skeleton variant="rounded" width={64} height={24} sx={{ flexShrink: 0 }} />}
        </Stack>
      ))}
    </Stack>
  );
}

export function StudentSetupLoadingFields({ label }: { label: string }) {
  return (
    <Box
      role="status"
      aria-label={label}
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}
    >
      {[0, 1].map((index) => (
        <Box key={index} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="text" width="45%" height={18} />
          <Skeleton variant="text" width="65%" height={22} />
        </Box>
      ))}
    </Box>
  );
}
