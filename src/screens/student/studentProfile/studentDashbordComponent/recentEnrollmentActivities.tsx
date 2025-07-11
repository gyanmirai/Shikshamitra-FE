import React from 'react';

import { Box, Card, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify'; // Or replace with <ArrowForwardIos />
import EnrollmentActivityCard from './enrollmentActivityCard';

const enrollmentActivities = [
  {
    name: 'Kanwar Rajan Rameshbhai',
    type: 'Inquiry',
    date: '08-06-2025',
    timeAgo: '1 hour ago',
  },
  {
    name: 'Jinjala Dharmik Laljibhai',
    type: 'Registration',
    date: '08-06-2025',
    timeAgo: '2 hours ago',
  },
  {
    name: 'Jinjala Jignesh Laljibhai',
    type: 'Scheduled',
    date: '08-06-2025',
    timeAgo: '4 hours ago',
  },
];

const EnrollmentActivities = () => (
  <Card sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="h6">Recent Activities</Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}>
        View All Activities
      </Button>
    </Box>
    <Typography variant="body2" color="text.secondary" mb={2}>
      Latest enrollment activities and updates
    </Typography>

    <Stack spacing={1}>
      {enrollmentActivities.map((activity, index) => (
        <EnrollmentActivityCard key={index} {...activity} />
      ))}
    </Stack>
  </Card>
);

export default EnrollmentActivities;
