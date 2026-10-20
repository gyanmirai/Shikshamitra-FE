import { Box, Paper, Divider, Skeleton } from '@mui/material';

export default function EmployeeViewSkeleton() {
  return (
    <Box role="status" aria-label="Loading staff profile">
      {/* Profile header card */}
      <Paper
        sx={{
          mb: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: 'var(--shadows-4)',
        }}
      >
        <Paper
          sx={{
            p: 1,
            borderRadius: 1,
            borderLeft: (theme) => `4px solid ${theme.vars.palette.grey[300]}`,
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            {/* Avatar */}
            <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />

            {/* Name */}
            <Box>
              <Skeleton width={36} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={130} height={18} />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />

            {/* Employee Code */}
            <Box>
              <Skeleton width={92} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={80} height={18} />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />

            {/* Role */}
            <Box>
              <Skeleton width={36} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={100} height={18} />
            </Box>
          </Box>
        </Paper>
      </Paper>

      {/* Tabs skeleton */}
      <Paper elevation={2} sx={{ mb: 1 }}>
        <Box
          sx={{
            px: 1.5,
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: 1.25,
                minWidth: 76,
              }}
            >
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={58} height={11} />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Dashboard content */}
      <Paper sx={{ p: 2.5 }}>
        {/* Stat cards row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
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
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
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
