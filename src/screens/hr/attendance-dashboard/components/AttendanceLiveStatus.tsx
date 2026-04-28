'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { motion, type Variants } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

// -----------------------------------------------------------------------

const LIVE_STATS = [
  {
    id: 1,
    label: 'Total Employees',
    value: 118,
    icon: 'mdi:account-group-outline',
    color: '#637381',
  },
  {
    id: 2,
    label: 'Present',
    value: 96,
    icon: 'mdi:account-check-outline',
    color: '#22C55E',
  },
  {
    id: 3,
    label: 'Absent',
    value: 7,
    icon: 'mdi:account-off-outline',
    color: '#FF5630',
  },
  {
    id: 4,
    label: 'On Leave',
    value: 8,
    icon: 'mdi:beach',
    color: '#00B8D9',
  },
  {
    id: 5,
    label: 'Late',
    value: 5,
    icon: 'mdi:clock-alert-outline',
    color: '#FFAB00',
  },
  {
    id: 6,
    label: 'Half Day',
    value: 2,
    icon: 'mdi:clock-minus-outline',
    color: '#8E33FF',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const AttendanceLiveStatus = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'visible',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography variant="h6">Live Attendance Status</Typography>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#22C55E',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.5)' },
              '70%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
            },
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
          Real-time
        </Typography>
      </Stack>

      <Box sx={{ px: 2, pb: 2 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <Grid container spacing={1}>
            {LIVE_STATS.map((stat) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.id}>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.04 }}>
                  <Stack
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      py: 1.5,
                      px: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(stat.color, 0.06),
                      border: `1px solid ${alpha(stat.color, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(stat.color, 0.1),
                        borderColor: alpha(stat.color, 0.2),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                        boxShadow: `0 4px 12px ${alpha(stat.color, 0.35)}`,
                        transform: 'perspective(400px) rotateX(6deg)',
                      }}
                    >
                      <Iconify icon={stat.icon} width={20} sx={{ color: '#fff' }} />
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}
                    >
                      {stat.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}
                    >
                      {stat.label}
                    </Typography>
                  </Stack>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    </Card>
  );
};

export default AttendanceLiveStatus;
