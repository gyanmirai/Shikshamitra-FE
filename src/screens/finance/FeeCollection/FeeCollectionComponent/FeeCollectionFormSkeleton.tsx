import { Box, Paper, Stack, Skeleton } from '@mui/material';

const FeeCollectionFormSkeleton = () => (
  <Stack
    role="status"
    aria-label="Loading fee collection"
    spacing={1}
    sx={{ flex: 1, minHeight: 0, p: 1, overflow: 'hidden' }}
  >
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 2, flexShrink: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="65%" height={24} />
            <Skeleton width="85%" height={20} />
          </Box>
        </Stack>
        <Box sx={{ minWidth: 140 }}>
          <Skeleton width="80%" height={18} />
          <Skeleton width="90%" height={28} />
        </Box>
      </Stack>
    </Paper>
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.8fr) minmax(300px, 1fr)' },
        alignItems: 'start',
      }}
    >
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton width="45%" height={28} />
            <Skeleton variant="rounded" width={80} height={30} />
          </Stack>
        </Paper>
        {[0, 1, 2, 3].map((group) => (
          <Paper key={group} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="rounded" width={20} height={20} />
              <Skeleton width="40%" height={28} />
              <Skeleton width="20%" height={24} sx={{ ml: 'auto !important' }} />
            </Stack>
            {group === 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Skeleton variant="rounded" width="100%" height={40} />
                {[0, 1].map((row) => (
                  <Stack key={row} direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="rounded" width={20} height={20} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="65%" height={24} />
                      <Skeleton width="50%" height={18} />
                    </Box>
                    <Skeleton width="15%" height={24} />
                    <Skeleton variant="rounded" width={70} height={24} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <Skeleton width="65%" height={28} />
          <Skeleton variant="rounded" width="100%" height={30} />
          {[0, 1].map((row) => (
            <Skeleton key={row} variant="rounded" width="100%" height={40} />
          ))}
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width="50%" height={40} />
            <Skeleton variant="rounded" width="50%" height={40} />
          </Stack>
          <Skeleton variant="rounded" width="100%" height={40} />
          <Skeleton variant="rounded" width="100%" height={40} />
          <Skeleton variant="rounded" width="100%" height={52} />
          <Skeleton variant="rounded" width="100%" height={30} />
          <Skeleton variant="rounded" width="100%" height={30} />
        </Stack>
      </Paper>
    </Box>
  </Stack>
);

export default FeeCollectionFormSkeleton;
