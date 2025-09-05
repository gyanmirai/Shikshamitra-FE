'use client';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Switch, Typography } from '@mui/material';

const NotificationSetting = () => (
  <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Grid container spacing={2} alignItems="flex-start" sx={{ mt: 2 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Custom Notifications
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch color="default" />
            <Typography sx={{ ml: 1 }}>Assignment Deadlines</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch color="default" />
            <Typography sx={{ ml: 1 }}>New Courses Published</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch color="default" />
            <Typography sx={{ ml: 1 }}>Quiz Reminders</Typography>
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Frequency Settings
        </Typography>
        <CustomSelect
          options={[
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
          ]}
          value=""
          label="Frequency"
          onChange={() => {}}
        />
      </Grid>
    </Grid>
  </Box>
);

export default NotificationSetting;
