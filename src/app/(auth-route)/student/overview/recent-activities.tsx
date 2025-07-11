// sections/RecentActivities.tsx
import React from 'react';

import { Box, Card, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import ActivityItem from './activityCard';

const activities = [
  {
    color: 'success',
    title: 'Roll No. assigned to Yuvraj Singh',
    subtitle: 'Class 5-B · Roll No.-12',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'info',
    title: 'Division Changed for Meera Patel',
    subtitle: 'Class 4-B ➝ 4-C',
    timeAgo: '4 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'New Student added to Blue House',
    subtitle: 'Anjali Sharma · Class 3-A',
    timeAgo: '6 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'GR No. generated for Kiran Kumar',
    subtitle: 'GR2025001847',
    timeAgo: '1 day ago',
    date: '05-07-2025',
  },
  {
    color: 'warning',
    title: 'House change request pending',
    subtitle: 'Anjali Sharma · Green to Red House',
    timeAgo: '2 days ago',
    date: '04-07-2025',
  },
  {
    color: 'error',
    title: 'Attendance marked absent',
    subtitle: 'Rahul Verma · Class 6-A',
    timeAgo: '3 days ago',
    date: '03-07-2025',
  },
  {
    color: 'info',
    title: 'Fee payment received',
    subtitle: 'Priya Shah · Term 2 Fees',
    timeAgo: '4 days ago',
    date: '02-07-2025',
  },
  {
    color: 'success',
    title: 'Sports team selection',
    subtitle: 'Arjun Kumar · Football Team',
    timeAgo: '5 days ago',
    date: '01-07-2025',
  },
  {
    color: 'warning',
    title: 'Parent meeting scheduled',
    subtitle: 'Neha Gupta · Class 7-B',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
  {
    color: 'info',
    title: 'Academic achievement',
    subtitle: 'Sanya Malhotra · Science Quiz Winner',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
] as const;

const RecentActivities = () => (
  <Box>
    <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
      <Typography variant="h6" mb={2}>
        Recent Activities
      </Typography>

      <Stack spacing={0}>
        <Scrollbar sx={{ height: '440px' }}>
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </Scrollbar>
      </Stack>

      <Button
        size="small"
        color="inherit"
        onClick={() => {}}
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
      >
        View All Activities
      </Button>
    </Card>
  </Box>
);

export default RecentActivities;
