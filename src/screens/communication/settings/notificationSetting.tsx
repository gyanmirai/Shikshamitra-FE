'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Card, Grid, Button, Switch, Checkbox, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const NotificationSetting = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Notification Settings"
      links={[{ name: 'Communication' }, { name: 'Settings' }, { name: 'Notification Settings' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch defaultChecked />
                <Typography>Receive Notification for New Messages</Typography>
              </Box>
              <CustomSelect
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                value=""
                label="Frequency"
                onChange={() => {}}
              />
              <Box display="flex" alignItems="center">
                <Checkbox size="small" checked />
                <Typography variant="body2">Staff</Typography>
                <Checkbox size="small" />
                <Typography variant="body2">Students</Typography>
                <Checkbox size="small" />
                <Typography variant="body2">Parents</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch defaultChecked />
                <Typography>Receive Notification for New Announcement</Typography>
              </Box>
              <CustomSelect
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                value=""
                label="Frequency"
                onChange={() => {}}
              />
              <CustomSelect
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                value=""
                label="Specific Announcement Types"
                onChange={() => {}}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch defaultChecked />
                <Typography>Receive Notification for Upcoming Events</Typography>
              </Box>
              <CustomSelect
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                value=""
                label="Frequency"
                onChange={() => {}}
              />
              <Box display="flex" alignItems="center">
                <Checkbox size="small" checked />
                <Typography variant="body2">Remind me 1 day before events</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch defaultChecked />
                <Typography>Receive Alerts for New Surveys or Feedback</Typography>
              </Box>
              <CustomSelect
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'sms', label: 'Sms' },
                  { value: 'appNotification', label: 'App Notification' },
                ]}
                value=""
                label="Choose Alert Type"
                onChange={() => {}}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <Button variant="contained" sx={{ mb: 4 }}>
      Save Preferences
    </Button>
  </Box>
);

export default NotificationSetting;
