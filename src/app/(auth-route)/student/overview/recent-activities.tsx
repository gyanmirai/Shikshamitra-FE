// sections/RecentActivities.tsx
import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button, Typography } from '@mui/material';

import ActivityItem from './activityCard';

const RecentActivities = ({ activities }: any) => (
  <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" mb={2}>
        Recent Activities
      </Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
        View All Activities
      </Button>
    </Box>

    {activities.slice(0, 4).map((activity: any, index: any) => (
      <ActivityItem key={index} {...activity} />
    ))}
  </Card>
);

export default RecentActivities;
