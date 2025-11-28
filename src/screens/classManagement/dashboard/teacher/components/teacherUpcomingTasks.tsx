'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button, Typography } from '@mui/material';
import ActivityItem from 'src/app/(auth-route)/student/overview/activityCard';

const TeacherUpcomingTasks = ({ tasks }: { tasks: any[] }) => (
  <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" mb={2}>
        Upcoming Tasks
      </Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
        View All Tasks
      </Button>
    </Box>

    {tasks.slice(0, 4).map((task: any, index: any) => (
      <ActivityItem key={index} {...task} />
    ))}
  </Card>
);

export default TeacherUpcomingTasks;
