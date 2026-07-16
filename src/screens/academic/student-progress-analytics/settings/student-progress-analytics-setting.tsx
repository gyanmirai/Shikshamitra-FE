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

const StudentProgressAnalyticsSetting = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      sx={{ mb: 1 }}
      heading="Settings"
      links={[{ name: 'Academics' }, { name: 'Student Progress Analytics' }, { name: 'Settings' }]}
    />
    <Grid container spacing={1}>
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
          <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={1}>
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
          <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={1}>
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

export default StudentProgressAnalyticsSetting;
