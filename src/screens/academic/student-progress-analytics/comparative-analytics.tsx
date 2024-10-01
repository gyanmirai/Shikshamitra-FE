import React from 'react';

import { Search } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  alpha,
  useTheme,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { AnalyticsWebsiteVisits } from 'src/screens/student/enrollment/dashboard';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const ComparativeAnalytics = () => {
  const theme = useTheme();
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Class Comparison</Typography>
              <CustomSelect
                label="Classes"
                options={[
                  { value: 'Class A', label: 'Class A' },
                  { value: 'Class B', label: 'Class B' },
                  { value: 'Class C', label: 'Class C' },
                  { value: 'Class D', label: 'Class D' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English', label: 'English' },
                  { value: 'History', label: 'History' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Class 10-A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Class 10-B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                  { name: 'Class 10-C', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Subject Performance Comparison</Typography>
              <CustomSelect
                label="Class"
                options={[
                  { value: 'Class A', label: 'Class A' },
                  { value: 'Class B', label: 'Class B' },
                  { value: 'Class C', label: 'Class C' },
                  { value: 'Class D', label: 'Class D' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'History', 'ENG'],
                series: [
                  { name: '', data: [43, 33, 22, 37] },
                  { name: '', data: [51, 70, 47, 67] },
                  { name: '', data: [51, 67, 47, 97] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
                options: {
                  legend: {
                    show: false,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" mb={2}>
            Student vs Class Average
          </Typography>
          <Box display="flex" gap={2}>
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

            <CustomSelect
              label="class"
              options={[
                { value: '1', label: 'Class 1' },
                { value: '2', label: 'Class 2' },
                { value: '3', label: 'Class 3' },
                { value: '4', label: 'Class 4' },
                { value: '5', label: 'Class 5' },
              ]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Student Comparison</Typography>
            </Box>
            <PerformanceOverTime
              id="demo__4"
              //   title="Performance Over Time"
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'History', 'Eng', 'May'],
                series: [
                  {
                    name: 'Student Performance',
                    data: [10, 41, 35, 51],
                  },
                  {
                    name: 'Class Average',
                    data: [49, 51, 35, 10],
                  },
                ],
                options: {
                  legend: {
                    show: true,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              // Dark background color
              padding: 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Performance Deviation
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Box position="relative" display="inline-flex" mr={2}>
                <CircularProgress
                  variant="determinate"
                  value={73.9}
                  size={60}
                  thickness={4}
                  color="success"
                />
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption" component="div">
                    73.9%
                  </Typography>
                </Box>
              </Box>
              <Typography>+10% above class average in Math</Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <Box position="relative" display="inline-flex" mr={2}>
                <CircularProgress
                  variant="determinate"
                  value={73.9}
                  size={60}
                  thickness={4}
                  color="error"
                />
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption" component="div">
                    73.9%
                  </Typography>
                </Box>
              </Box>
              <Typography>+10% below class average in English</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Subject Comparison</Typography>
          <CustomizableTable
            columns={[
              { id: 'subject', label: 'Subject' },
              { id: 'studentGrade', label: 'Student Grade' },
              { id: 'classAverage', label: 'Class Average' },
            ]}
            data={[
              { subject: 'Math', studentGrade: 'A', classAverage: 'B+' },
              { subject: 'Science', studentGrade: 'B', classAverage: 'B' },
              { subject: 'English', studentGrade: 'B+', classAverage: 'A-' },
              { subject: 'History', studentGrade: 'A-', classAverage: 'B' },
              { subject: 'Physics', studentGrade: 'B+', classAverage: 'B+' },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComparativeAnalytics;
