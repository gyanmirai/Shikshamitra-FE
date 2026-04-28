'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, CardHeader, IconButton, Typography } from '@mui/material';

// -----------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    label: 'Mark Attendance',
    icon: 'mdi:calendar-check-outline',
    color: 'primary',
    href: hrPaths.attendance.markAttendance,
  },
  {
    label: 'Approve Leaves',
    icon: 'mdi:clipboard-check-outline',
    color: 'success',
    href: hrPaths.leaveManagement.approvals,
  },
  {
    label: 'Shift Settings',
    icon: 'mdi:clock-outline',
    color: 'info',
    href: hrPaths.attendance.setting.attendanceConfiguration,
  },
  {
    label: 'Download Report',
    icon: 'mdi:download-outline',
    color: 'warning',
    href: hrPaths.reports,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
};

const AttendanceQuickActions = () => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 2,
      boxShadow: 'none',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <CardHeader
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Quick Actions</Typography>
          <CustomTooltip title="Common attendance management actions" placement="top">
            <IconButton size="small">
              <Iconify icon="solar:info-circle-linear" width={18} sx={{ color: 'text.disabled' }} />
            </IconButton>
          </CustomTooltip>
        </Stack>
      }
      sx={{ p: 2 }}
    />

    <Box sx={{ px: 1, pb: 1 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {QUICK_ACTIONS.map((action) => (
            <motion.div
              key={action.label}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                component={Link}
                href={action.href}
                disableRipple
                color="inherit"
                sx={{
                  flex: 1,
                  minWidth: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  color: 'text.primary',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    borderColor: (theme) => alpha(theme.palette.grey[500], 0.16),
                  },
                }}
              >
                <Iconify icon={action.icon} width={20} sx={{ color: `${action.color}.main` }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {action.label}
                </Typography>
              </Button>
            </motion.div>
          ))}
        </Stack>
      </motion.div>
    </Box>
  </Card>
);

export default AttendanceQuickActions;
