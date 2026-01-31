'use client';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import { DashboardContent } from 'src/layouts/dashboard';
import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import PerformerCard from './component/performer-card';
import { DashboardKpiCard } from '../component/dashboard-kpi-card';
import { StudentPerformanceChart } from './component/student-performance';
import UpcomingExamCard from '../student/component/exam-card-for-student';
import TeacherPayrollOverview from './component/teacher-payroll-overview';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';
import UpcomingAssignmentCard from '../student/component/upcoming-assignment-card';
import WhatsNewInMonthComponent from '../principal/component/whats-new-in-month-component';

// ----------------------------------------------------------------------

const studentList = [
  { id: 1, name: 'Alice Wilson', value: '1', totalMarks: 95, avatarUrl: '/path/to/avatar1.jpg' },
  { id: 2, name: 'Jane Smith', value: '2', totalMarks: 89, avatarUrl: '/path/to/avatar2.jpg' },
  { id: 3, name: 'Alice Brown', value: '3', totalMarks: 78, avatarUrl: '/path/to/avatar3.jpg' },
  { id: 4, name: 'Bob Johnson', value: '4', totalMarks: 65, avatarUrl: '/path/to/avatar4.jpg' },
];

const subjectOptions = [
  { value: 'all', label: 'All' },
  { value: '1', label: 'Math' },
  { value: '2', label: 'Science' },
];

export default function MainDashboardTeacher() {
  const [viewType, setViewType] = useState('my_timetable');

  return (
    <DashboardContent maxWidth="xl">
      {/* Welcome Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={12}>
          <AppWelcome
            title={`Good Morning 👋 \n Prof. Jeet`}
            description="You have 3 classes today. Your first period starts at 9:00 AM in Room 101."
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary" sx={{ borderRadius: '12px' }}>
                View Full Schedule
              </Button>
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="My Students"
            total={156}
            icon="hugeicons:students"
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Class Attendance"
            total="94%"
            icon="solar:user-check-bold"
            color="success"
            trend={{ value: 2.1, isUp: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Pending Grades"
            total={24}
            icon="solar:pen-new-square-bold"
            color="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardKpiCard
            title="Active Assignments"
            total={12}
            icon="solar:document-text-bold"
            color="info"
          />
        </Grid>

        {/* Daily Workflow Tools */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardWidgetWrapper title="Academic Performance" subheader="Overall Student Progress">
            <Box sx={{ p: 1 }}>
              <StudentPerformanceChart />
            </Box>
          </DashboardWidgetWrapper>
        </Grid>

        {/* Quick Tools */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardWidgetWrapper title="Daily Tools" subheader="Quick access to your workflow">
            <Stack spacing={2}>
              {[
                { label: 'Mark Attendance', icon: 'solar:user-plus-bold', color: 'success' },
                { label: 'Upload Homework', icon: 'solar:upload-bold', color: 'primary' },
                { label: 'Enter Exam Marks', icon: 'solar:clipboard-check-bold', color: 'warning' },
                { label: 'Create New Test', icon: 'solar:shield-warning-bold', color: 'error' },
              ].map((tool, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="soft"
                  color="inherit"
                  size="large"
                  startIcon={<Iconify icon={tool.icon} sx={{ color: `${tool.color}.main` }} />}
                  sx={{ justifyContent: 'flex-start', borderRadius: '12px', py: 1.5 }}
                >
                  {tool.label}
                </Button>
              ))}
            </Stack>
          </DashboardWidgetWrapper>
        </Grid>

        {/* Schedule & Exams */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <UpcomingExamCard
            exams={[
              { subject: 'Math Exam', date: 'Sep 20, 2024', class: '10th-A', room: '101' },
              { subject: 'Physics Exam', date: 'Sep 22, 2024', class: '12th-B', room: '102' },
              { subject: 'Chemistry Exam', date: 'Sep 24, 2024', class: '11th-C', room: '103' },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <UpcomingAssignmentCard
            assignments={[
              { name: 'Algebra Homework', dueDate: 'Sep 20, 2024' },
              { name: 'Science Lab Manual', dueDate: 'Sep 22, 2024' },
              { name: 'History Essay', dueDate: 'Sep 25, 2024' },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardWidgetWrapper title="What's New">
            <WhatsNewInMonthComponent birthdays={[]} events={[]} timeOffRequests={[]} />
          </DashboardWidgetWrapper>
        </Grid>

        {/* Student Insights */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PerformerCard
            title="Needs Improvement"
            subheader="Students requiring attention"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformerCard
            title="Top Performers"
            subheader="Outstanding Students"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>

        {/* Payroll Overview */}
        <Grid size={{ xs: 12 }}>
          <DashboardWidgetWrapper
            title="Professional Overview"
            subheader="Earnings & Deductions Summary"
          >
            <TeacherPayrollOverview
              earnings={[
                { label: 'Teaching Allowance', amount: 5000 },
                { label: 'Transport Allowance', amount: 2000 },
                { label: 'Performance Bonus', amount: 3000 },
              ]}
              deductions={[
                { label: 'Income Tax', amount: 5000 },
                { label: 'Provident Fund', amount: 3000 },
              ]}
            />
          </DashboardWidgetWrapper>
        </Grid>

        {/* Detailed Timeline Selector */}
        <Grid size={{ xs: 12 }}>
          <DashboardWidgetWrapper title="Schedule & Class View">
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <ButtonGroup variant="soft" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Button
                  onClick={() => setViewType('my_timetable')}
                  variant={viewType === 'my_timetable' ? 'contained' : 'soft'}
                >
                  My Timetable
                </Button>
                <Button
                  onClick={() => setViewType('my_class')}
                  variant={viewType === 'my_class' ? 'contained' : 'soft'}
                >
                  My Class Overview
                </Button>
              </ButtonGroup>
            </Stack>
            <Box
              sx={{
                p: 5,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                border: '2px dashed rgba(145, 158, 171, 0.12)',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                [Interactive {viewType === 'my_timetable' ? 'Timetable' : 'Class View'} Placeholder]
              </Typography>
            </Box>
          </DashboardWidgetWrapper>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
