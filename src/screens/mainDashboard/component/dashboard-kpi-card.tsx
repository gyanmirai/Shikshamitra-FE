'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  total: number | string;
  icon: string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isUp: boolean;
  };
  sx?: any;
};

const fNumber = (n: number) => new Intl.NumberFormat().format(n);

export function DashboardKpiCard({
  title,
  total,
  icon,
  color = 'primary',
  trend,
  sx,
  ...other
}: Props) {
  const theme = useTheme() as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          p: 2,
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.vars.palette.background.paper} 0%, ${theme.vars.palette.background.neutral || theme.vars.palette.background.default} 100%)`,
          ...sx,
        }}
        {...other}
      >
        <Stack spacing={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
              bgcolor: (themes: any) => {
                const mainChannel = themes.palette[color]?.mainChannel || '37 99 235'; // Fallback to blue
                return `rgba(${mainChannel} / 0.12)`;
              },
              mb: 1,
            }}
          >
            <Iconify icon={icon} width={28} />
          </Box>

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {typeof total === 'number' ? fNumber(total) : total}
            </Typography>

            {/* {trend && (
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: '8px',
                  bgcolor: trend.isUp ? 'success.lighter' : 'error.lighter', // Fallback to these if they exist
                  color: trend.isUp ? 'success.dark' : 'error.dark',
                }}
              >
                <Iconify
                  icon={trend.isUp ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                  width={16}
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {fPercent(trend.value)}
                </Typography>
              </Stack>
            )}  */}
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
}
