'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Skeleton, Typography } from '@mui/material';

type DailySummaryStats = {
  total: number;
  completed: number;
  inProgress: number;
  needsAttention: number;
  upcoming: number;
};

type Props = {
  stats: DailySummaryStats;
  isLoading?: boolean;
  onOpenSummaryDrawer?: () => void;
};

export const DailySummaryRow: React.FC<Props> = ({ stats, isLoading, onOpenSummaryDrawer }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{
          py: 0.75,
          px: 1.5,
          mb: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          border: (t) => `1px solid ${t.palette.divider}`,
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Skeleton variant="rounded" width={320} height={18} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 0.75,
        px: 1.5,
        mb: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Compact Summary String: 3 Periods · 0 Completed · 0 In Progress · 0 Needs Attention · 3 Upcoming */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ fontSize: { xs: 12, sm: 13 } }}
      >
        <Typography variant="body2" fontWeight={700} color="text.primary" component="span">
          {stats.total} {stats.total === 1 ? 'Period' : 'Periods'}
        </Typography>

        <Typography variant="body2" color="text.disabled" component="span">
          ·
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" component="span">
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'inline-block',
            }}
          />
          <Typography variant="body2" fontWeight={600} color="success.dark" component="span">
            {stats.completed} Completed
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.disabled" component="span">
          ·
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" component="span">
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'info.main',
              display: 'inline-block',
            }}
          />
          <Typography variant="body2" fontWeight={600} color="info.dark" component="span">
            {stats.inProgress} In Progress
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.disabled" component="span">
          ·
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" component="span">
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: stats.needsAttention > 0 ? 'warning.main' : 'text.disabled',
              display: 'inline-block',
            }}
          />
          <Typography
            variant="body2"
            fontWeight={stats.needsAttention > 0 ? 700 : 500}
            color={stats.needsAttention > 0 ? 'warning.dark' : 'text.secondary'}
            component="span"
          >
            {stats.needsAttention} Needs Attention
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.disabled" component="span">
          ·
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" component="span">
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'text.disabled',
              display: 'inline-block',
            }}
          />
          <Typography variant="body2" color="text.secondary" component="span">
            {stats.upcoming} Upcoming
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DailySummaryRow;
