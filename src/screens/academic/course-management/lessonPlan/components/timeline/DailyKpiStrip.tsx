'use client';

import type { FC } from 'react';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

type DailyKpiStats = {
  total: number;
  completed: number;
  inProgress: number;
  needsAttention: number;
  upcoming: number;
};

type Props = {
  stats: DailyKpiStats;
  onFilterClick?: (status: string) => void;
};

export const DailyKpiStrip: FC<Props> = ({ stats }) => {
  const items = [
    {
      key: 'total',
      label: 'Total Periods',
      value: stats.total,
      icon: 'solar:calendar-bold',
      color: 'primary' as const,
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: 'solar:verified-check-bold',
      color: 'success' as const,
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats.inProgress,
      icon: 'solar:play-circle-bold',
      color: 'info' as const,
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      value: stats.needsAttention,
      icon: 'solar:danger-bold',
      color: 'warning' as const,
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      value: stats.upcoming,
      icon: 'solar:clock-circle-bold',
      color: 'primary' as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(5, 1fr)',
        },
        gap: 1.25,
        mb: 1.5,
      }}
    >
      {items.map((item) => (
        <Stack
          key={item.key}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            minHeight: 66,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => varAlpha(theme.vars.palette[item.color].mainChannel, 0.12),
              color: `${item.color}.main`,
              flexShrink: 0,
            }}
          >
            <Iconify icon={item.icon} width={18} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ lineHeight: 1 }}
            >
              {item.value}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}
              noWrap
            >
              {item.label}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
};

export default DailyKpiStrip;
