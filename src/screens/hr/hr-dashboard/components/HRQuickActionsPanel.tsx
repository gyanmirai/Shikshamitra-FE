'use client';

import React from 'react';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, CardHeader, IconButton, Typography } from '@mui/material';

// -----------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    label: 'Add Staff',
    icon: 'mdi:account-plus-outline',
    color: 'primary',
    href: hrPaths.employee.list,
  },
  {
    label: 'Approve Leave',
    icon: 'mdi:clipboard-check-outline',
    color: 'success',
    href: hrPaths.leaveManagement.approvals,
  },
  // {
  //   label: 'Mark Attendance',
  //   icon: 'mdi:calendar-check-outline',
  //   color: 'info',
  //   href: hrPaths.attendance.attendanceTracking,
  // },
  {
    label: 'Generate Payroll',
    icon: 'mdi:cash-multiple',
    color: 'warning',
    href: hrPaths.payroll.runPayroll,
  },
  {
    label: 'Download Report',
    icon: 'mdi:download-outline',
    color: 'error',
    href: hrPaths.reports,
  },
];

const HRQuickActionsPanel = () => (
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
          <CustomTooltip title="Perform common HR tasks quickly" placement="top">
            <IconButton size="small">
              <Iconify icon="solar:info-circle-linear" width={18} sx={{ color: 'text.disabled' }} />
            </IconButton>
          </CustomTooltip>
        </Stack>
      }
      sx={{ p: 2 }}
    />
    <Box sx={{ px: 1, pb: 1 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.label}
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
              transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.16),
              },
            }}
          >
            <Iconify icon={action.icon} width={20} sx={{ color: `${action.color}.main` }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
            >
              {action.label}
            </Typography>
          </Button>
        ))}
      </Stack>
    </Box>
  </Card>
);

export default HRQuickActionsPanel;
