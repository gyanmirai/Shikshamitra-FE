'use client';

import React, { useState, useCallback } from 'react';

import { Box, Grid, Card, Button, Typography, ButtonGroup } from '@mui/material';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { CONFIG } from 'src/config-global';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';
import { TopPerformer } from 'src/screens/student/enrollment/entrance-exam/dashboard';

import { SvgColor } from 'src/components/svg-color';
import CustomizableTable from 'src/components/customizabaleTable';
import ScrollableListCard from 'src/components/scrollable-list-card';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';

import TimeTableView from '../component/time-table-view';
import { StudentPerformanceChart } from './component/student-performance';
import PayrollOverviewTeacherDashboard from './component/payroll-overview';
import { PrincipalDashboardCard } from '../principal/component/principal-dashboard-card';
import WhatsNewInMonthComponent from '../principal/component/whats-new-in-month-component';

const upcomingExams = [
  { subject: 'Science', date: '16-02-2025', status: 'Completed', class: '10th-A', room: '101' },
  { subject: 'English', date: '20-02-2025', status: 'Pending', class: '10th-A', room: '102' },
  { subject: 'Maths', date: '20-02-2025', status: 'Pending', class: '10th-A', room: '103' },
  { subject: 'Maths', date: '20-05-2025', status: 'Scheduled', class: '10th-A', room: '104' },
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
        <Grid item xs={12} md={6} lg={3}>
          <PrincipalDashboardCard
            dropdownLabel="Select Class"
            icon="mdi:school"
            title="My Class Students"
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

        <Grid item xs={12} md={6} lg={3}>
          <PrincipalDashboardCard
            dropdownLabel="Select Class"
            icon="mdi:school"
            title="Today Class Attendance"
            count="50%"
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Present', color: 'error', value: 50 },
              { name: 'Absent', color: 'success', value: 50 },
            ]}
            selectOptions={[]}
            selectedValue="Jan"
            onSelectChange={(val) => console.log('Selected Month:', val)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TopPerformer
            title="Top Performer"
            sx={{ height: '100%' }}
            list={[
              {
                id: '1',
                name: 'Jayvion Simon',
                avatarUrl: '/static/images/avatars/avatar_1.png',
                totalMarks: 0,
              },
              {
                id: '2',
                name: 'Lucian Obrien',
                avatarUrl: '/static/images/avatars/avatar_2.png',
                totalMarks: 0,
              },
              {
                id: '3',
                name: 'Deja Bredy',
                avatarUrl: '/static/images/avatars/avatar_3.png',
                totalMarks: 0,
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TopPerformer
            title="Bottom Performer"
            sx={{ height: '100%' }}
            list={[
              {
                id: '1',
                name: 'Jayvion Simon',
                avatarUrl: '/static/images/avatars/avatar_1.png',
                totalMarks: 0,
              },
              {
                id: '2',
                name: 'Lucian Obrien',
                avatarUrl: '/static/images/avatars/avatar_2.png',
                totalMarks: 0,
              },
              {
                id: '3',
                name: 'Deja Bredy',
                avatarUrl: '/static/images/avatars/avatar_3.png',
                totalMarks: 0,
              },
            ]}
          />
        </Grid>
      </Grid>

      {/* Upcoming Exams and Assignments */}
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <ScrollableListCard items={upcomingExams} title="Upcoming Exams" />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <ScrollableListCard items={upcomingExams} title="Upcoming Exams" />
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5">Earning Section</Typography>
              <CustomizableTable
                tableId="earning-table"
                columns={[
                  { id: 'employeeType', label: 'Employee Type' },
                  {
                    id: 'amount',
                    label: 'Amount',
                    render(value, row) {
                      return formatCurrency(value);
                    },
                  },
                  {
                    id: 'total',
                    label: 'Total',
                    render(value, row) {
                      return formatCurrency(value);
                    },
                  },
                ]}
                data={[
                  { employeeType: 'Teaching Allowance', amount: 5000, total: 5000 },
                  { employeeType: 'Transport Allowance', amount: 2000, total: 2000 },
                  { employeeType: 'Academic Performance Bonus', amount: 3000, total: 3000 },
                  { employeeType: 'Extra-curricular Activities', amount: 2000, total: 2000 },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5">Deductions Section</Typography>
              <CustomizableTable
                tableId="deduction-table"
                columns={[
                  { id: 'deductionType', label: 'Deduction Type' },
                  {
                    id: 'amount',
                    label: 'Amount',
                    render(value, row) {
                      return formatCurrency(value);
                    },
                  },
                  {
                    id: 'totalDeduction',
                    label: 'Total Deduction',
                    render(value, row) {
                      return formatCurrency(value);
                    },
                  },
                ]}
                data={[
                  { deductionType: 'Income Tax', amount: 5000, totalDeduction: 5000 },
                  { deductionType: 'Provident Fund', amount: 3000, totalDeduction: 3000 },
                  { deductionType: 'Professional Tax', amount: 1000, totalDeduction: 1000 },
                  { deductionType: 'Insurance Premium', amount: 1000, totalDeduction: 1000 },
                ]}
              />
            </Grid>
          </Grid>
          {/* <Typography variant="h6" fontWeight="bold">
            Assignment Overview
          </Typography> */}
          {/* <StudentWiseAssignmentTable /> */}
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
