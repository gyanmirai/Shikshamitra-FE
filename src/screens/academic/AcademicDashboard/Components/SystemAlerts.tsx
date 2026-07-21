'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertItem {
  id: string;
  message: string;
  severity: AlertSeverity;
  time: string;
  icon: string;
}

const ALERTS: AlertItem[] = [
  {
    id: 'a1',
    message: 'Timetable conflict detected in Class 9B — overlapping lecture slots',
    severity: 'critical',
    time: '30 min ago',
    icon: 'solar:danger-triangle-bold',
  },
  {
    id: 'a2',
    message: '3 teachers have pending grade entry overdue by 5+ days',
    severity: 'critical',
    time: '2 hours ago',
    icon: 'solar:bell-bing-bold',
  },
  {
    id: 'a3',
    message: 'Class 10A syllabus is 45% behind schedule — intervention needed',
    severity: 'warning',
    time: '4 hours ago',
    icon: 'solar:chart-square-bold',
  },
  {
    id: 'a4',
    message: 'Exam seating plan not generated for upcoming Final Exam',
    severity: 'warning',
    time: '1 day ago',
    icon: 'solar:chair-bold',
  },
  {
    id: 'a5',
    message: '24 homework evaluations overdue — teacher action required',
    severity: 'warning',
    time: '1 day ago',
    icon: 'solar:notebook-bold',
  },
  {
    id: 'a6',
    message: 'Lecture slots not configured for Timetable module',
    severity: 'info',
    time: '2 days ago',
    icon: 'solar:info-circle-bold',
  },
];

type LabelSeverity = 'error' | 'warning' | 'info';
const SEVERITY_LABEL: Record<AlertSeverity, LabelSeverity> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
};
const BG_COLOR: Record<AlertSeverity, string> = {
  critical: 'error.lighter',
  warning: 'warning.lighter',
  info: 'info.lighter',
};

// ----------------------------------------------------------------------

export default function SystemAlerts() {
  const criticalCount = ALERTS.filter((a) => a.severity === 'critical').length;

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        title="System Alerts & Issues"
        action={
          <Label color="error" variant="soft">
            {criticalCount} Critical
          </Label>
        }
        sx={{ p: 0, mb: 1.5 }}
      />

      <Scrollbar sx={{ maxHeight: 340 }}>
        <Stack spacing={1}>
          {ALERTS.map((alert) => (
            <Stack
              key={alert.id}
              direction="row"
              alignItems="flex-start"
              spacing={1}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: BG_COLOR[alert.severity],
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.85 },
              }}
            >
              <Iconify
                icon={alert.icon}
                width={22}
                sx={{ color: `${SEVERITY_LABEL[alert.severity]}.main`, flexShrink: 0, mt: 0.25 }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {alert.message}
                  </Typography>
                  <Label
                    color={SEVERITY_LABEL[alert.severity]}
                    variant="filled"
                    sx={{ height: 18, fontSize: '0.6rem', px: 0.75, flexShrink: 0 }}
                  >
                    {alert.severity}
                  </Label>
                </Stack>
                <Typography variant="caption" color="text.disabled">
                  {alert.time}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
