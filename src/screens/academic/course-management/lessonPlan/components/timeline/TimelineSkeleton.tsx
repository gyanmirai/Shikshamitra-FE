'use client';

import React from 'react';
import { Box, Stack, Paper, Skeleton } from '@mui/material';

export const TimelineSkeleton: React.FC = () => (
  <Stack spacing={1.25} sx={{ width: '100%' }}>
    {/* Summary row skeleton */}
    <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1.5, mb: 0.5 }} />

    {/* Timeline card skeletons */}
    {[1, 2, 3, 4].map((i) => (
      <Paper
        key={i}
        variant="outlined"
        sx={{ p: 1.75, borderRadius: 1.5, bgcolor: 'background.paper' }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="30%" height={22} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={18} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <Skeleton variant="rectangular" width={75} height={26} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={90} height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>
      </Paper>
    ))}
  </Stack>
);

export default TimelineSkeleton;
