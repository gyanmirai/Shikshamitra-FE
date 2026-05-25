import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Typography } from '@mui/material';

const AttendanceLeaveNotificationManagement = () => (
  <Box sx={{ height: '100%' }}>
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Iconify icon="solar:bell-off-linear" width={24} />
        <Box>
          <Typography variant="subtitle2">
            Attendance and leave notification templates are not connected.
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            This screen is disabled until template configuration is backed by a real HR notification
            API.
          </Alert>
        </Box>
      </Stack>
    </Card>
  </Box>
);

export default AttendanceLeaveNotificationManagement;
