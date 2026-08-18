'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
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

export const DailyKpiStrip: React.FC<Props> = ({ stats }) => {
  const theme = useTheme();

  const items = [
    {
      key: 'total',
      label: 'Total Periods',
      value: stats.total,
      icon: 'solar:calendar-bold',
      color: theme.palette.text.primary,
      bg: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
      border: theme.palette.divider,
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: 'solar:verified-check-bold',
      color: theme.palette.success.dark,
      bg: varAlpha(theme.vars.palette.success.mainChannel, 0.1),
      border: varAlpha(theme.vars.palette.success.mainChannel, 0.25),
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats.inProgress,
      icon: 'solar:play-circle-bold',
      color: theme.palette.info.dark,
      bg: varAlpha(theme.vars.palette.info.mainChannel, 0.1),
      border: varAlpha(theme.vars.palette.info.mainChannel, 0.25),
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      value: stats.needsAttention,
      icon: 'solar:danger-bold',
      color: theme.palette.warning.dark,
      bg: varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
      border: varAlpha(theme.vars.palette.warning.mainChannel, 0.25),
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      value: stats.upcoming,
      icon: 'solar:clock-circle-bold',
      color: theme.palette.text.secondary,
      bg: varAlpha(theme.vars.palette.grey['500Channel'], 0.06),
      border: theme.palette.divider,
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
          spacing={1.25}
          sx={{
            py: 1,
            px: 1.5,
            borderRadius: 1.75,
            bgcolor: item.bg,
            border: `1px solid ${item.border}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 'var(--shadows-2)',
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color,
              flexShrink: 0,
              boxShadow: 'var(--shadows-1)',
            }}
          >
            <Iconify icon={item.icon} width={18} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: item.color, lineHeight: 1.1, fontSize: 16 }}
            >
              {item.value}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: 11, lineHeight: 1, display: 'block', mt: 0.25 }}
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
