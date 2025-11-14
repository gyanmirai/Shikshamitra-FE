'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  Tooltip,
  Checkbox,
  Typography,
  IconButton,
} from '@mui/material';

import AssessmentTypeSetting from './assessmentType/assessmentTypeSetting';
import HomeworkTypeSettingCard from './homeworkType/homeworkTypeSettingCard';

const Setting = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Settings"
      links={[
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Homework & Assignment', href: 'academic/homeworkDashboard' },
        { name: 'Settings' },
      ]}
      sx={{ mb: 2 }}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <HomeworkTypeSettingCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AssessmentTypeSetting />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ typography: 'h6' }}>Assignment Preferences</Box>
              <Tooltip title="Manage Homework Type using Add, Edit or Delete">
                <IconButton size="small">
                  <Iconify icon="mdi:information" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 5 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Default Deadlines
                </Typography>
                <DatePicker
                  label="Select the Default Deadline"
                  format="DD-MM-YYYY"
                  sx={{ maxWidth: '250px' }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Reminder Schedules
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch />
                    <Typography>24 hours before</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch />
                    <Typography>1 hour before</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button size="small" variant="contained" onClick={() => {}}>
                Save
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ typography: 'h6' }}>Custom Notification</Box>
              <Tooltip title="Configure notification preferences, frequency, and reminder schedules for your assignments">
                <IconButton size="small">
                  <Iconify icon="mdi:information" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Choose Notifications
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>New Assignments</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>Grading Updates</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>Upcoming Deadlines</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Frequency
                </Typography>
                <CustomSelect
                  label="Frequency Options"
                  options={[
                    { value: 'Immediately', label: 'Immediately' },
                    { value: 'Daily', label: 'Daily' },
                    { value: 'Weekly', label: 'Weekly' },
                  ]}
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button size="small" variant="contained" onClick={() => {}}>
                Save
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default Setting;
