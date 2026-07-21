import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Divider, Skeleton } from '@mui/material';

const FeeCollectionFormSkeleton = (): React.ReactElement => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* ── Main 2-column grid ── */}
      <Box
        sx={{
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
          px: { xs: 1, md: 1.5 },
          pt: 1,
          display: 'grid',
          gap: { xs: 1.5, lg: 0 },
          gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' },
          alignItems: 'start',
        }}
      >
        {/* ═══════════ LEFT HALF ═══════════ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
            pr: { lg: 0.75 },
            borderRight: (t) => ({ lg: `1px solid ${alpha(t.palette.divider, 0.3)}` }),
          }}
        >
          {/* Student Summary Card Skeleton */}
          <Card
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Skeleton variant="circular" width={44} height={44} />
              <Box flex={1}>
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="text" width={100} height={14} sx={{ mt: 0.25 }} />
              </Box>
              <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 999 }} />
            </Box>
            <Divider sx={{ my: 1.25 }} />
            <Stack direction="row" spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} flex={1}>
                  <Skeleton variant="text" width={50} height={12} />
                  <Skeleton variant="text" width={70} height={18} />
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Filter Bar Skeleton */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              mb: 0.85,
            }}
          >
            <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 1 }} />
            <Box flex={1} />
            <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 999 }} />
          </Box>

          {/* Quick Action Toolbar Skeleton */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.85,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" width={90} height={30} sx={{ borderRadius: 1 }} />
            ))}
          </Box>

          {/* Ledger List Skeleton */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {[1, 2, 3].map((group) => (
              <Box
                key={group}
                sx={{
                  mb: 1.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                }}
              >
                {/* Group Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  px={1.5}
                  py={1}
                  sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={18}
                    height={18}
                    sx={{ borderRadius: '4px' }}
                  />
                  <Skeleton variant="text" width={100} height={18} />
                  <Box flex={1} />
                  <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 999 }} />
                  <Skeleton variant="circular" width={22} height={22} />
                </Box>

                {/* Row Items */}
                {[1, 2, 3].map((row) => (
                  <Box
                    key={row}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={1.5}
                    py={0.85}
                    sx={{
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width={16}
                      height={16}
                      sx={{ borderRadius: '3px' }}
                    />
                    <Box flex={1}>
                      <Skeleton variant="text" width={120} height={16} />
                    </Box>
                    <Skeleton variant="text" width={60} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                    <Skeleton variant="rounded" width={55} height={18} sx={{ borderRadius: 999 }} />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ═══════════ RIGHT HALF ═══════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            minHeight: 0,
            height: '100%',
            pl: { lg: 0.75 },
            gap: 1.5,
          }}
        >
          {/* Selected Fees Skeleton */}
          <Card
            sx={{
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 1.25, md: 1.5 },
              boxShadow: 'var(--shadows-4)',
              border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={0.5}
              pb={0.75}
              mb={1}
              sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}
            >
              <Skeleton variant="text" width={180} height={14} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Item rows */}
            <Stack spacing={0.75} flex={1}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} px={1} py={0.5}>
                  <Skeleton
                    variant="rectangular"
                    width={14}
                    height={14}
                    sx={{ borderRadius: '3px' }}
                  />
                  <Box flex={1}>
                    <Skeleton variant="text" width={140} height={16} />
                  </Box>
                  <Skeleton variant="text" width={60} height={16} />
                  <Skeleton variant="circular" width={18} height={18} />
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 0.75 }} />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={0.5}
              py={0.5}
            >
              <Box>
                <Skeleton variant="text" width={90} height={18} />
                <Skeleton variant="text" width={70} height={12} />
              </Box>
              <Skeleton variant="text" width={80} height={22} />
            </Box>
          </Card>

          {/* Checkout Skeleton */}
          <Card
            sx={{
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 1.25, md: 1.5 },
              boxShadow: 'var(--shadows-4)',
              border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Header */}
            <Box
              pb={0.75}
              mb={1}
              sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}
            >
              <Skeleton variant="text" width={80} height={14} />
            </Box>

            {/* Payment Summary */}
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="text" width={130} height={18} />
            </Box>
            <Skeleton variant="text" width={220} height={12} sx={{ mb: 1 }} />
            <Divider sx={{ mb: 1.25 }} />

            {/* Summary rows */}
            {[1, 2].map((i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={0.375}>
                <Skeleton variant="text" width={90} height={14} />
                <Skeleton variant="text" width={60} height={14} />
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" py={0.375}>
              <Skeleton variant="text" width={100} height={18} />
              <Skeleton variant="text" width={80} height={18} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Payment method dropdown */}
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              sx={{ borderRadius: 1, mb: 1.5 }}
            />

            {/* Amount field */}
            <Skeleton variant="text" width={110} height={12} sx={{ mb: 0.75 }} />
            <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 1 }} />

            {/* Balance box */}
            <Skeleton
              variant="rounded"
              width="100%"
              height={50}
              sx={{ borderRadius: 1.25, mt: 1.5 }}
            />
          </Card>
        </Box>
      </Box>

      {/* ── Bottom Actions Skeleton ── */}
      <Box
        sx={{
          px: { xs: 1, md: 1.5 },
          py: 0.9,
          borderTop: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Skeleton variant="rounded" width={150} height={34} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rounded" width={88} height={34} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
};

export default FeeCollectionFormSkeleton;
