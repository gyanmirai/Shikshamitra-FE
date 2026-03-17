'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

// -----------------------------------------------------------------------

type AlertSeverity = 'error' | 'warning' | 'info';

interface HRAlert {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  icon: string;
  count?: number;
}

const ALERTS: HRAlert[] = [
  {
    id: 1,
    title: 'Low Attendance',
    description: '3 employees have attendance below 75% this month.',
    severity: 'error',
    icon: 'mdi:account-off-outline',
    count: 3,
  },
  {
    id: 2,
    title: 'Contracts Expiring',
    description: '4 contracts expire within the next 30 days.',
    severity: 'warning',
    icon: 'mdi:file-alert-outline',
    count: 4,
  },
  {
    id: 3,
    title: 'Missing Documents',
    description: '6 employees have incomplete document submissions.',
    severity: 'warning',
    icon: 'mdi:file-remove-outline',
    count: 6,
  },
  {
    id: 4,
    title: 'Pending Leave Approvals',
    description: '5 leave requests are waiting for approval.',
    severity: 'info',
    icon: 'mdi:clipboard-clock-outline',
    count: 5,
  },
];

const SEVERITY_COLORS: Record<AlertSeverity, 'error' | 'warning' | 'info'> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const BG_COLORS: Record<AlertSeverity, string> = {
  error: 'error.lighter',
  warning: 'warning.lighter',
  info: 'info.lighter',
};

const HRAlertsWidget = () => (
  <Card sx={{ height: '100%' }}>
    <CardHeader
      title="HR Alerts"
      subheader="Items requiring your attention"
      action={
        <Label color="error" variant="soft">
          {ALERTS.length} alerts
        </Label>
      }
    />
    <Scrollbar sx={{ maxHeight: 320 }}>
      <Stack spacing={1} sx={{ px: 2.5, pb: 2.5 }}>
        {ALERTS.map((alert) => (
          <Stack
            key={alert.id}
            direction="row"
            alignItems="flex-start"
            spacing={1.5}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: BG_COLORS[alert.severity],
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.85 },
            }}
          >
            <Iconify
              icon={alert.icon}
              width={22}
              sx={{
                color: `${SEVERITY_COLORS[alert.severity]}.main`,
                flexShrink: 0,
                mt: 0.25,
              }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {alert.title}
                </Typography>
                {alert.count !== undefined && (
                  <Label
                    color={SEVERITY_COLORS[alert.severity]}
                    variant="filled"
                    sx={{ height: 18, fontSize: '0.65rem', px: 0.75 }}
                  >
                    {alert.count}
                  </Label>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                {alert.description}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Scrollbar>
  </Card>
);

export default HRAlertsWidget;
