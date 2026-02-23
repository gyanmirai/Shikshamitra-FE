import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const SEVERITY_CONFIG: Record<string, { color: string; chipColor: string }> = {
  critical: { color: 'error.main', chipColor: 'error' },
  warning: { color: 'warning.main', chipColor: 'warning' },
  info: { color: 'info.main', chipColor: 'info' },
};

const ALERTS = [
  {
    id: '1',
    message: 'Class 10-A: Attendance Critical',
    detail: 'Attendance dropped to 58% this week. (Threshold: 75%)',
    timestamp: '2 hours ago',
    category: 'Attendance',
    severity: 'critical',
  },
  {
    id: '2',
    message: 'Class 8-B: Teacher Unassigned',
    detail: 'Primary class teacher on leave. Substitute not assigned.',
    timestamp: '4 hours ago',
    category: 'Staffing',
    severity: 'critical',
  },
  {
    id: '3',
    message: 'Class 5-C: Capacity Overload',
    detail: '52 students enrolled in a 45-capacity room.',
    timestamp: '5 hours ago',
    category: 'Resource',
    severity: 'warning',
  },
  {
    id: '4',
    message: 'Class 12-A: Syllabus Lagging',
    detail: 'Chemistry syllabus 15% behind scheduled timeline.',
    timestamp: '6 hours ago',
    category: 'Academic',
    severity: 'warning',
  },
];

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
          height: 480,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title="Critical Alerts"
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
          sx={{ pb: 1, flexShrink: 0, mt: -1, ml: -1 }}
        />

        <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
          <Stack spacing={1.5}>
            {ALERTS.map((alert) => {
              const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
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
                      transform: 'scale(1.01)',
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
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
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
        title="All Critical Alerts"
        maxWidth="lg"
      >
        <CustomizableTable columns={alertColumns} data={ALERTS} tableId="all-alerts-table" />
      </CustomDialog>
    </>
  );
};

export default AlertsPanel;
