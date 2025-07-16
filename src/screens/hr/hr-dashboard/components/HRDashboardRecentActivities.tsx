import React from 'react';

import { Box, Card, Chip, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const employeeActivities = [
  {
    title: 'Leave Request form Deepa Singh',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
    status: 'Pending',
    statusColor: 'warning',
  },
  {
    title: 'Salary Slip generated for may 2025',
    timeAgo: '5 hours ago',
    date: '06-07-2025',
    status: '148 Staff Paid',
    statusColor: 'success',
  },
  {
    title: 'New non-teaching employee added',
    timeAgo: '1 day ago',
    date: '05-07-2025',
    status: 'Sunil Thakur',
    statusColor: 'info',
  },
];

const EmployeeRecentActivities = () => (
  <Card sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">Recent Activities</Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}>
        View All Activities
      </Button>
    </Box>

    <Stack spacing={2}>
      {employeeActivities.map((activity, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="subtitle2">{activity.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.timeAgo} • {activity.date}
            </Typography>
          </Box>
          <Chip
            label={activity.status}
            color={activity.statusColor as any}
            variant="soft"
            size="small"
          />
        </Box>
      ))}
    </Stack>
  </Card>
);

export default EmployeeRecentActivities;
