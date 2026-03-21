'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertItem {
  id: number;
  severity: AlertSeverity;
  category: string;
  message: string;
  detail: string;
  timestamp: string;
  actionLabel: string;
}

const ALERTS: AlertItem[] = [
  {
    id: 1,
    severity: 'critical',
    category: 'Route Delay',
    message: 'Route R-10 delayed by 22 minutes',
    detail: 'Driver: Rajesh Kumar | Vehicle: GJ-01-AB-1234',
    timestamp: '10 min ago',
    actionLabel: 'View Route',
  },
  {
    id: 2,
    severity: 'critical',
    category: 'Breakdown',
    message: 'Bus GJ-05 breakdown reported near City Center',
    detail: 'Replacement vehicle required immediately',
    timestamp: '25 min ago',
    actionLabel: 'Resolve',
  },
  {
    id: 3,
    severity: 'critical',
    category: 'Driver Absent',
    message: '2 drivers have not reported today',
    detail: 'Routes R-07 and R-11 may be affected',
    timestamp: '1 hr ago',
    actionLabel: 'Assign Backup',
  },
  {
    id: 4,
    severity: 'warning',
    category: 'Insurance Expiry',
    message: 'Vehicle GJ-12-XX-9900 insurance expires in 5 days',
    detail: 'Renew before 23 Feb 2026 to avoid compliance issues',
    timestamp: '2 hrs ago',
    actionLabel: 'View Details',
  },
  {
    id: 5,
    severity: 'warning',
    category: 'License Expiry',
    message: "Driver Suresh P.'s license expires in 12 days",
    detail: 'Renewal reminder sent. Follow up required.',
    timestamp: '3 hrs ago',
    actionLabel: 'Follow Up',
  },
  {
    id: 6,
    severity: 'warning',
    category: 'Unassigned Students',
    message: '3 students unassigned in Route R-04',
    detail: 'New admissions pending route allocation',
    timestamp: '4 hrs ago',
    actionLabel: 'Assign Now',
  },
  {
    id: 7,
    severity: 'info',
    category: 'Pending Fees',
    message: '14 students have pending transport fees',
    detail: 'Total outstanding: ₹28,400',
    timestamp: '5 hrs ago',
    actionLabel: 'Send Reminder',
  },
  {
    id: 8,
    severity: 'info',
    category: 'PUC Expiry',
    message: 'PUC certificate due for 2 vehicles next week',
    detail: 'Vehicles: GJ-01-CD-2244, GJ-01-EF-8899',
    timestamp: '6 hrs ago',
    actionLabel: 'Schedule',
  },
];

const SEVERITY_CONFIG = {
  critical: { color: 'error.main', chipColor: 'error' },
  warning: { color: 'warning.main', chipColor: 'warning' },
  info: { color: 'info.main', chipColor: 'info' },
};

const AlertsPanel = () => {
  const [openViewAll, setOpenViewAll] = useState(false);

  // Columns for the View All dialog table
  const alertColumns: any[] = [
    { id: 'message', label: 'Alert Message', align: 'left' },
    { id: 'category', label: 'Category', align: 'left' },
    {
      id: 'severity',
      label: 'Severity',
      align: 'left',
      render: (value: string) => (
        <Label
          variant="soft"
          color={value === 'critical' ? 'error' : value === 'warning' ? 'warning' : 'info'}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Label>
      ),
    },
    { id: 'timestamp', label: 'Time', align: 'left' },
    { id: 'detail', label: 'Details', align: 'left' },
  ];

  return (
    <>
      <Card
        sx={{
          boxShadow: (theme) => theme.shadows[2],
          borderRadius: 2,
          height: 480, // Matching the height from lists.tsx
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title="Operational Alerts"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          action={
            <Button
              size="small"
              onClick={() => setOpenViewAll(true)}
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              View all
            </Button>
          }
          sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1 }}
        />

        <Scrollbar sx={{ p: 1, flexGrow: 1 }}>
          <Stack spacing={1}>
            {ALERTS.map((alert) => {
              const config = SEVERITY_CONFIG[alert.severity];

              return (
                <Box
                  key={alert.id}
                  sx={{
                    p: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'transparent',
                      bgcolor: 'background.neutral',
                      transform: 'scale(1.02)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {/* Vertical Colored Bar */}
                  <Box
                    sx={{
                      width: 4,
                      height: 48,
                      borderRadius: 0.5,
                      bgcolor: config.color,
                      flexShrink: 0,
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {alert.detail}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: 'wrap' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          typography: 'caption',
                        }}
                      >
                        <Iconify icon="mdi:clock-outline" width={16} sx={{ mr: 0.5 }} />
                        {alert.timestamp}
                      </Box>

                      <Box
                        sx={{ width: 4, height: 4, bgcolor: 'text.disabled', borderRadius: '50%' }}
                      />

                      <Label variant="soft" color={config.chipColor as any}>
                        {alert.category}
                      </Label>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Scrollbar>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="All Operational Alerts"
        maxWidth="lg"
      >
        <CustomizableTable columns={alertColumns} data={ALERTS} tableId="all-alerts-table" />
      </CustomDialog>
    </>
  );
};

export default AlertsPanel;
