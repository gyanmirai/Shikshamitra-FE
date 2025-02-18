'use client';

import React, { useState, useCallback } from 'react';

import { Box, Grid, Card, Button, Typography, ButtonGroup } from '@mui/material';

import { CONFIG } from 'src/config-global';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import { SvgColor } from 'src/components/svg-color';
import ScrollableListCard from 'src/components/scrollable-list-card';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';

import TimeTableView from '../component/time-table-view';
import { SubjectOverviewCard } from './component/subject-overview-card';
import { StudentPerformanceChart } from './component/student-performance';
import PayrollOverviewTeacherDashboard from './component/payroll-overview';
import StudentWiseAssignmentTable from './component/student-wise-assignment-table';
import { PrincipalDashboardCard } from '../principal/component/principal-dashboard-card';
import WhatsNewInMonthComponent from '../principal/component/whats-new-in-month-component';

const upcomingExams = [
  { subject: 'Science', date: '16-02-2025', status: 'Completed' },
  { subject: 'English', date: '20-02-2025', status: 'Pending' },
  { subject: 'Maths', date: '20-02-2025', status: 'Pending' },
  { subject: 'Maths', date: '20-05-2025', status: 'Scheduled' },
];

const studentAssignments = [
  { name: 'John', subject: 'Math', status: 'Submitted' },
  { name: 'Emma', subject: 'Science', status: 'Pending' },
  { name: 'Liam', subject: 'English', status: 'Late' },
];

const MainDashboardTeacher = () => {
  const [timeTable, setTimeTable] = useState('my');
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setTimeTable(newView);
      }
    },
    []
  );

  const icon = (name: string) => (
    <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
  );

  return (
    <Grid container spacing={3} sx={{ px: 2 }}>
      {/* Welcome Section */}
      <Grid item xs={12} py={3}>
        <AppWelcome
          title={`Good Morning 👋 \n Jeet`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
        />
      </Grid>

      {/* Dashboard Cards: Total Students & Class Attendance */}
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <PrincipalDashboardCard
            dropdownLabel="Select Class"
            icon="mdi:school"
            title="Total Students"
            count={250}
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Female', color: 'error', value: 500 },
              { name: 'Male', color: 'success', value: 500 },
            ]}
            selectOptions={[]}
            selectedValue="1"
            onSelectChange={(val) => console.log('sele:', val)}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <PrincipalDashboardCard
            dropdownLabel="Select Class"
            icon="mdi:school"
            title="Today Class Attendance"
            count="50%"
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Teaching', color: 'error', value: 50 },
              { name: 'Non-teaching', color: 'success', value: 50 },
            ]}
            selectOptions={[]}
            selectedValue="Jan"
            onSelectChange={(val) => console.log('Selected Month:', val)}
          />
        </Grid>
      </Grid>

      {/* Upcoming Exams and Assignments */}
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <ScrollableListCard items={upcomingExams} title="Upcoming Exams" />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <SubjectOverviewCard
            icon="mdi:school"
            title=""
            color="primary"
            bgColor="secondary"
            studentList={[
              { name: 'John', subject: 'Math', score: 85 },
              { name: 'Emma', subject: 'Math', score: 92 },
              { name: 'Liam', subject: 'Math', score: 70 },
              { name: 'Sophia', subject: 'Science', score: 60 },
              { name: 'Mia', subject: 'Science', score: 40 },
              { name: 'Noah', subject: 'Science', score: 75 },
              { name: 'Ava', subject: 'English', score: 50 },
              { name: 'William', subject: 'English', score: 30 },
              { name: 'James', subject: 'English', score: 45 },
            ]}
            selectOptions={[
              { value: 'Math', label: 'Math' },
              { value: 'Science', label: 'Science' },
              { value: 'English', label: 'English' },
            ]}
            dropdownLabel="Select Subject"
          />
        </Grid>
      </Grid>

      {/* Time Table & Class View Buttons */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ButtonGroup>
            <Button
              variant={timeTable === 'my' ? 'outlined' : 'contained'}
              color="inherit"
              onClick={() => setTimeTable('class')}
              startIcon={icon('ic-hr')}
            >
              My Time-table
            </Button>
            <Button
              color="inherit"
              variant={timeTable === 'my' ? 'contained' : 'outlined'}
              onClick={() => setTimeTable('my')}
              startIcon={icon('ic-student')}
            >
              My Class
            </Button>
          </ButtonGroup>
        </Box>
        <TimeTableView />
      </Grid>

      {/* What’s New in Month, Performance Chart, and Payroll Overview */}
      <Grid container spacing={3} sx={{ mt: 3, px: 3 }}>
        <Grid item lg={12}>
          <Card sx={{ boxShadow: 'var(--shadows-2)', height: '460px' }}>
            <StudentPerformanceChart />
          </Card>
        </Grid>
      </Grid>

      {/* Student Assignments Table */}
      <Grid container spacing={3} sx={{ mt: 3, px: 3 }}>
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" fontWeight="bold">
            Assignment Overview
          </Typography>
          <StudentWiseAssignmentTable />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2, height: '90%' }}>
            <WhatsNewInMonthComponent birthdays={[]} events={[]} timeOffRequests={[]} />
          </Card>
        </Grid>
      </Grid>

      {/* Payroll Overview */}

      <Grid item xs={12} lg={12} sx={{ pt: 0 }}>
        <Typography variant="h6" fontWeight="bold">
          Payroll Overview
        </Typography>
        <PayrollOverviewTeacherDashboard />
      </Grid>
    </Grid>
  );
};

export default MainDashboardTeacher;
