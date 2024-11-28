import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  alpha,
  useTheme,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const Reports = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="h6">Individual Student Reports</Typography>
      <Box display="flex" gap={2} my={2}>
        <TextField
          variant="outlined"
          placeholder="search for individual students by name"
          label="Student"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: '350px', width: '100%' }}
        />
        <DatePicker
          label="To Date"
          sx={{ width: '100%', maxWidth: '200px' }}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="End Date"
          sx={{ width: '100%', maxWidth: '200px' }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Overview
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Overall Grade
            </Typography>
            <Typography variant="h3" gutterBottom>
              A
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Attendance
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Present days - 265
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Absent days - 100
            </Typography>

            <TextField sx={{ mt: 2 }} size="small" fullWidth placeholder="Teacher Feedback" />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Subject Breakdown</Typography>
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'ENG'],
                series: [
                  { name: 'High Performer', data: [43, 0, 22] },
                  { name: 'Need Improvemets', data: [0, 70, 0] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Class Reports</Typography>
          <Box display="flex" gap={2} my={2}>
            <CustomSelect
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              label="Class"
            />
            <CustomSelect
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              label="Subject"
            />
            <DatePicker
              label="To Date"
              sx={{ width: '100%', maxWidth: '200px' }}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              sx={{ width: '100%', maxWidth: '200px' }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Class Summary
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Overall Grade
            </Typography>
            <Typography variant="h3" gutterBottom>
              A
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Top Performers
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Present days - 265
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Absent days - 100
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Bottom Performers
            </Typography>
            <Typography variant="body2" gutterBottom>
              • John Doe
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Deja Brady
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Performance Breakdown</Typography>
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'ENG'],
                series: [{ name: 'High Performer', data: [43, 0, 22] }],
                colors: [alpha(theme.palette.primary.dark, 0.8)],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
