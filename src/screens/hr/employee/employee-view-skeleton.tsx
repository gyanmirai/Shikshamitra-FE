import { Box, Paper, Skeleton } from '@mui/material';

export default function EmployeeViewSkeleton() {
  return (
    <Box role="status" aria-label="Loading staff profile">
      {/* Profile header card */}
      <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Skeleton width={180} height={28} sx={{ maxWidth: '100%' }} />
              <Skeleton width={48} height={24} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                columnGap: 2,
                rowGap: 0.5,
                mt: 0.5,
              }}
            >
              <Skeleton width={180} height={22} sx={{ maxWidth: '100%' }} />
              <Skeleton width={100} height={22} sx={{ maxWidth: '100%' }} />
            </Box>
            <Skeleton width={360} height={22} sx={{ mt: 0.5, maxWidth: '100%' }} />
          </Box>
        </Box>
      </Paper>

      {/* Tabs skeleton */}
      <Paper elevation={2} sx={{ mb: 1, overflow: 'hidden' }}>
        <Box sx={{ px: 0.5, display: 'flex', gap: 0.5, overflow: 'hidden' }}>
          {Array.from({ length: 10 }, (_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                minHeight: 48,
                flexShrink: 0,
              }}
            >
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={76} height={22} />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Content area — mirrors dashboard tab layout */}
      <Paper sx={{ p: 2.5 }}>
        {/* Stat cards row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Skeleton width="50%" height={13} />
                <Skeleton variant="circular" width={28} height={28} />
              </Box>
              <Skeleton width="65%" height={28} sx={{ mb: 0.5 }} />
              <Skeleton width="45%" height={12} />
            </Paper>
          ))}
        </Box>

        {/* Chart + sidebar row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Chart card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Skeleton width="35%" height={18} />
              <Skeleton width={80} height={28} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1, mb: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Skeleton variant="circular" width={10} height={10} />
                  <Skeleton width={50} height={12} />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* List card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Skeleton width="55%" height={18} sx={{ mb: 2 }} />
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
                <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="72%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton width="50%" height={12} />
                </Box>
                <Skeleton width={40} height={22} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Bottom detail row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Skeleton width="50%" height={16} sx={{ mb: 1.5 }} />
              {[...Array(3)].map((__, j) => (
                <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Skeleton width="40%" height={13} />
                  <Skeleton width="35%" height={13} />
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
