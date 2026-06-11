import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

const EnrollmentActivities = () => (
  <Card sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">Recent Activities</Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}>
        View All Activities
      </Button>
    </Box>
    <Typography variant="body2" color="text.secondary" mb={2}>
      Latest enrollment activities and updates
    </Typography>

    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        No recent enrollment activities found.
      </Typography>
    </Stack>
  </Card>
);

export default EnrollmentActivities;
