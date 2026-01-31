'use client';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import Autocomplete from '@mui/material/Autocomplete';
import { formatNumber } from 'src/utils/formate_number';
import { DashboardContent } from 'src/layouts/dashboard';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import PerformerCard from '../teacher/component/performer-card';
import { AnalyticsClassResults } from './component/result-graph';
import { DashboardKpiCard } from '../component/dashboard-kpi-card';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';
import WhatsNewInMonthComponent from './component/whats-new-in-month-component';

// ----------------------------------------------------------------------

const studentList = [
  { id: 1, name: 'John Doe', value: '1', totalMarks: 95, avatarUrl: '/path/to/avatar1.jpg' },
  { id: 2, name: 'Jane Smith', value: '1', totalMarks: 89, avatarUrl: '/path/to/avatar2.jpg' },
  { id: 3, name: 'Alice Brown', value: '2', totalMarks: 78, avatarUrl: '/path/to/avatar3.jpg' },
  { id: 4, name: 'Bob Johnson', value: '3', totalMarks: 65, avatarUrl: '/path/to/avatar4.jpg' },
  { id: 5, name: 'Charlie Wilson', value: '4', totalMarks: 55, avatarUrl: '/path/to/avatar5.jpg' },
];

const subjectOptions = [
  { value: 'all', label: 'All' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];

export default function MainDashboardPrincipal() {
  const [timeTable, setTimeTable] = useState('student');

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Principal Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Academic Leadership & School Monitoring
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="soft"
            color="info"
            startIcon={<Iconify icon="solar:document-bold" />}
            sx={{ borderRadius: '12px' }}
          >
            Review Reports
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:bell-bing-bold" />}
            sx={{ borderRadius: '12px', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.24)' }}
          >
            Emergency Alert
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Total Students"
            total={2500}
            icon="hugeicons:students"
            color="primary"
            trend={{ value: 4.5, isUp: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Total Employees"
            total={250}
            icon="clarity:employee-group-solid"
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Today's Attendance"
            total="92.8%"
            icon="solar:user-check-bold"
            color="success"
            trend={{ value: 1.2, isUp: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Payroll (Current)"
            total={formatNumber(250000, 'INR')}
            icon="noto:receipt"
            color="warning"
          />
        </Grid>

        {/* Academic Performance */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardWidgetWrapper
            title="Academic Performance"
            subheader="Fees & Collection Summary"
          >
            <AnalyticsWebsiteVisits
              firstDropdownValue="2024"
              firstDropdownOptions={[{ value: '2024', label: '2024-2025' }]}
              title=""
              chart={{
                categories: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                series: [
                  { name: 'Fee Collected', data: [43, 33, 22, 37, 67, 68, 37, 24, 55, 50, 90, 70] },
                  {
                    name: 'Fee Outstanding',
                    data: [51, 70, 47, 67, 40, 37, 24, 70, 24, 89, 90, 50],
                  },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </DashboardWidgetWrapper>
        </Grid>

        {/* Approvals & Requests */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardWidgetWrapper
            title="Approvals Required"
            subheader="Pending items for your review"
          >
            <Stack spacing={2}>
              {[
                {
                  title: 'Leave Request',
                  user: 'Sunil Kumar (Teacher)',
                  type: 'Sick Leave',
                  color: 'warning',
                },
                {
                  title: 'Budget Request',
                  user: 'Library Dept',
                  type: 'Book Purchase',
                  color: 'info',
                },
                {
                  title: 'Event Approval',
                  user: 'Cultural Comm',
                  type: 'Annual Fest',
                  color: 'success',
                },
              ].map((item, index) => (
                <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: `${item.color}.main`,
                      }}
                    />
                    <Stack spacing={0.5} flexGrow={1}>
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.user} • {item.type}
                      </Typography>
                    </Stack>
                    <Button size="small" variant="soft" color="inherit">
                      Review
                    </Button>
                  </Stack>
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                sx={{ borderStyle: 'dashed', borderRadius: '12px' }}
              >
                View All Approvals
              </Button>
            </Stack>
          </DashboardWidgetWrapper>
        </Grid>

        {/* Performance Insight */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PerformerCard
            title="Needs Improvement"
            subheader="Students requiring academic attention"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformerCard
            title="Top Performers"
            subheader="Academic Excellence this month"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>

        {/* Exam & Results */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardWidgetWrapper title="Class & Subject Wise Results">
            <AnalyticsClassResults title="" subheader="" />
          </DashboardWidgetWrapper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardWidgetWrapper title="What's New this Month">
            <WhatsNewInMonthComponent birthdays={[]} events={[]} timeOffRequests={[]} />
          </DashboardWidgetWrapper>
        </Grid>

        {/* Attendance Monitor */}
        <Grid size={{ xs: 12 }}>
          <DashboardWidgetWrapper
            title="Quick Monitor"
            subheader="Select view to see detailed activity"
          >
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <ButtonGroup variant="soft" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Button
                  onClick={() => setTimeTable('student')}
                  variant={timeTable === 'student' ? 'contained' : 'soft'}
                >
                  Student Activity
                </Button>
                <Button
                  onClick={() => setTimeTable('employee')}
                  variant={timeTable === 'employee' ? 'contained' : 'soft'}
                >
                  Employee Activity
                </Button>
              </ButtonGroup>

              {timeTable === 'employee' && (
                <Autocomplete
                  sx={{ width: 240 }}
                  options={[
                    { id: 1, firstName: 'EMP-102' },
                    { id: 2, firstName: 'EMP-105' },
                  ]}
                  getOptionLabel={(option) => option.firstName}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Employee" size="small" />
                  )}
                />
              )}
            </Stack>
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                border: '2px dashed rgba(145, 158, 171, 0.12)',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                [Interactive {timeTable === 'student' ? 'Student' : 'Employee'} Tracker View
                Placeholder]
              </Typography>
            </Box>
          </DashboardWidgetWrapper>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
