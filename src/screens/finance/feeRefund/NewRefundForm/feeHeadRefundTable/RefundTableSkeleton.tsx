import React from 'react';
import { Box, Stack, Skeleton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const RefundTableSkeleton = (): React.ReactElement => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {/* ── 4 KPI Skeleton Cards ── */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: '1 1 130px',
              p: 1.75,
              borderRadius: '14px',
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: alpha(theme.palette.action.hover, 0.5),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '8px' }} />
            </Box>
            <Skeleton variant="text" width={70} height={12} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={90} height={24} sx={{ mb: 0.25 }} />
            <Skeleton variant="text" width={60} height={11} />
          </Box>
        ))}
      </Stack>

      {/* ── Accordion Skeleton Cards ── */}
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            px={1.5}
            py={1.25}
            sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
          >
            <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: '4px' }} />
            <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="rounded" width={70} height={18} sx={{ borderRadius: 999 }} />
            <Box flex={1} />
            <Skeleton variant="rounded" width={80} height={18} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>

          {/* Rows */}
          {[1, 2, 3].map((j) => (
            <Box
              key={j}
              display="flex"
              alignItems="center"
              gap={1}
              px={1.5}
              py={0.75}
              sx={{ minHeight: 52 }}
            >
              <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: '4px' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={80} height={16} />
              </Box>
              {[90, 90, 90, 90, 114, 76].map((w, k) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={k} variant="text" width={w} height={16} />
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
};

export default RefundTableSkeleton;
