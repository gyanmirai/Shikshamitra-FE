'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Switch,
  Button,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

type PeriodSetting = {
  label: string;
  unit: string;
};

const StudentProgressAnalyticsSetting = (props: TabComponentType) => {
  const periodSettings: PeriodSetting[] = [
    { label: 'Letter Grades', unit: 'Letter Grades' },
    { label: 'Percentage-based', unit: 'Percentage-based' },
    { label: 'Percentage-based', unit: 'Percentage-based' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[
          { name: 'Academics' },
          { name: 'Student Progress Analytics' },
          { name: 'Settings' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ py: '7px' }} />
            <Typography variant="h6">Attendance Reports</Typography>
            <Box sx={{ py: '7px' }} />
            <TextField
              label="Attendance reports"
              size="small"
              value=""
              onChange={() => {}}
              fullWidth
            />
            <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
              <FormControlLabel control={<Switch />} label="Sending reports to teachers" />
              <FormControlLabel control={<Switch />} label="Sending reports to parents" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 4 }}>
              <Button variant="outlined">Reset</Button>
              <Button variant="contained">Save</Button>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ py: '7px' }} />
            <Typography variant="h6">Performance Alerts</Typography>
            <Box sx={{ py: '7px' }} />
            <TextField
              fullWidth
              name="description"
              label="Notification thresholds, like 3 absences"
              size="small"
            />
            <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
              <FormControlLabel control={<Switch />} label="Sending reports to teachers" />
              <FormControlLabel control={<Switch />} label="Sending reports to parents" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 4 }}>
              <Button variant="outlined">Reset</Button>
              <Button variant="contained">Save</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProgressAnalyticsSetting;
