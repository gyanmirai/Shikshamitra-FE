// sections/RecentActivities.tsx
import React from 'react';

import { Box, Card, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import ActivityItem from './activityCard';

const RecentActivities = ({ activities }: any) => (
  <Box>
    <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
      <Typography variant="h6" mb={2}>
        Recent Activities
      </Typography>

      <Stack spacing={0}>
        <Scrollbar sx={{ height: '300px' }}>
          {activities.map((activity: any, index: any) => (
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
