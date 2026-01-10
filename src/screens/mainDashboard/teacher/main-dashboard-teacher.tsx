'use client';

import React, { useState } from 'react';
import { CONFIG } from 'src/config-global';
import { SvgColor } from 'src/components/svg-color';
import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { Box, Grid, Card, Button, ButtonGroup } from '@mui/material';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import PerformerCard from './component/performer-card';
import { StudentPerformanceChart } from './component/student-performance';
import UpcomingExamCard from '../student/component/exam-card-for-student';
import TeacherPayrollOverview from './component/teacher-payroll-overview';
import UpcomingAssignmentCard from '../student/component/upcoming-assignment-card';
import { PrincipalDashboardCard } from '../principal/component/principal-dashboard-card';
import WhatsNewInMonthComponent from '../principal/component/whats-new-in-month-component';

const MainDashboardTeacher = () => {
  const [timeTable, setTimeTable] = useState('my');
  // const handleChangeView = useCallback(
  //   (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
  //     if (newView !== null) {
  //       setTimeTable(newView);
  //     }
  //   },
  //   []
  // );

  const icon = (name: string) => (
    <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
  );

  const studentList = [
    { id: 1, name: '1', value: 'math', totalMarks: 95, avatarUrl: '/path/to/avatar1.jpg' },
    {
      id: 2,
      name: 'Jane Smith',
      value: '2',
      totalMarks: 89,
      avatarUrl: '/path/to/avatar2.jpg',
    },
    {
      id: 3,
      name: 'Alice Brown',
      value: '3',
      totalMarks: 78,
      avatarUrl: '/path/to/avatar3.jpg',
    },
    {
      id: 4,
      name: 'Bob Johnson',
      value: '4',
      totalMarks: 65,
      avatarUrl: '/path/to/avatar4.jpg',
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      value: '3',
      totalMarks: 55,
      avatarUrl: '/path/to/avatar5.jpg',
    },
  ];

  const subjectOptions = [
    { value: 'all', label: 'All' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ];

  return (
    <Grid container spacing={3} sx={{ px: 2 }}>
      {/* Welcome Section */}
      <Grid size={12} py={3}>
        <AppWelcome
          title={`Good Morning 👋 \n Jeet`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
        />
      </Grid>

      {/* Dashboard Cards: Total Students & Class Attendance */}
      <Grid container spacing={3}>
        <Grid size={{ lg: 3 }}>
          <UpcomingExamCard
            exams={[
              { subject: 'Math Exam', date: 'Sep 20, 2024', class: '10th-A', room: '101' },
              { subject: 'Physics Exam', date: 'Sep 22, 2024', class: '12th-B', room: '102' },
              { subject: 'Chemistry Exam', date: 'Sep 24, 2024', class: '11th-C', room: '103' },
              { subject: 'Biology Exam', date: 'Sep 26, 2024', class: '9th-D', room: '104' },
              { subject: 'Math Exam', date: 'Sep 20, 2024', class: '10th-A', room: '101' },
              { subject: 'Physics Exam', date: 'Sep 22, 2024', class: '12th-B', room: '102' },
            ]}
          />
        </Grid>
        <Grid size={{ lg: 3 }}>
          <UpcomingAssignmentCard
            assignments={[
              { name: 'Math Homework', dueDate: 'Sep 20, 2024' },
              { name: 'Science Report', dueDate: 'Sep 22, 2024' },
              { name: 'English Essay', dueDate: 'Sep 25, 2024' },
              { name: 'History Presentation', dueDate: 'Sep 27, 2024' },
              { name: 'Math Homework', dueDate: 'Sep 20, 2024' },
              { name: 'Science Report', dueDate: 'Sep 22, 2024' },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <PerformerCard
            title="Needs improvement"
            subheader="Based on The latest Exam"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <PerformerCard
            title="Top Performers"
            subheader="Based on The latest Exam"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="hugeicons:students"
          title="My Class Students"
          count={250}
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[
            { name: 'Male', color: 'success', value: 500 },
            { name: 'Female', color: 'error', value: 500 },
          ]}
          selectOptions={[]}
          selectedValue="1"
          onSelectChange={(val) => {}}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="hugeicons:task-daily-02"
          title="Today Class Attendance"
          count="50%"
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[
            { name: 'Present', color: 'success', value: 50 },
            { name: 'Absent', color: 'error', value: 50 },
          ]}
          selectOptions={[]}
          selectedValue="Jan"
          onSelectChange={(val) => {}}
        />
      </Grid>
      {/* 
      <Grid item xs={12} md={6} size={{lg:3}}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="hugeicons:task-daily-02"
          title="My Attendance Overall"
          count="50%"
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[

          ]}
          selectOptions={[]}
          selectedValue="Jan"
          onSelectChange={(val) => }
        />
      </Grid> */}
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="material-symbols-light:pending-actions"
          title="My Pending Task"
          count="100"
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[
            { name: 'Assignment', color: 'warning', value: 50 },
            { name: 'Grading', color: 'warning', value: 50 },
          ]}
          selectOptions={[]}
          selectedValue="Jan"
          onSelectChange={(val) => {}}
        />
      </Grid>

      {/* Time Table & Class View Buttons */}
      <Grid size={12} sx={{ mt: 3 }}>
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
        {/* <TimeTableView /> */}
      </Grid>

      {/* What’s New in Month, Performance Chart, and Payroll Overview */}
      <Grid container spacing={3} sx={{ mt: 3, px: 3, width: '100%' }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ boxShadow: 'var(--shadows-2)', height: '460px' }}>
            <StudentPerformanceChart />
          </Card>
        </Grid>
      </Grid>

      {/* Student Assignments Table */}
      <Grid container spacing={3} sx={{ mt: 3, px: 3, width: '100%' }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <WhatsNewInMonthComponent birthdays={[]} events={[]} timeOffRequests={[]} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <TeacherPayrollOverview
            earnings={[
              { label: 'Teaching Allowance', amount: 5000 },
              { label: 'Transport Allowance', amount: 2000 },
              { label: 'Academic Performance Bonus', amount: 3000 },
              { label: 'Extra-curricular Activities', amount: 2000 },
            ]}
            deductions={[
              { label: 'Income Tax', amount: 5000 },
              { label: 'Provident Fund', amount: 3000 },
              { label: 'Professional Tax', amount: 1000 },
              { label: 'Insurance Premium', amount: 1000 },
            ]}
          />
        </Grid>
      </Grid>

      {/* Payroll Overview */}
    </Grid>
  );
};

export default MainDashboardTeacher;
