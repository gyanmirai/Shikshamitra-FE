'use client';

import React, { useState, useCallback } from 'react';

import { Box, Grid, Card, Alert, Button, Typography, ButtonGroup } from '@mui/material';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { CONFIG } from 'src/config-global';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import { SvgColor } from 'src/components/svg-color';
import CustomizableTable from 'src/components/customizabaleTable';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';

import PerformerCard from './component/performer-card';
import TimeTableView from '../component/time-table-view';
import { StudentPerformanceChart } from './component/student-performance';
import UpcomingExamCard from '../student/component/exam-card-for-student';
import UpcomingAssignmentCard from '../student/component/upcoming-assignment-card';
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
      <Grid item xs={12} py={3}>
        <AppWelcome
          title={`Good Morning 👋 \n Jeet`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
        />
      </Grid>

      {/* Dashboard Cards: Total Students & Class Attendance */}
      <Grid container item xs={12} spacing={3}>
        <Grid item lg={3}>
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
        <Grid item lg={3}>
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

        <Grid item xs={12} md={3}>
          <PerformerCard
            title="Needs improvement"
            subheader="Based on The latest Exam"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <PerformerCard
            title="Top Performers"
            subheader="Based on The latest Exam"
            list={studentList}
            options={subjectOptions}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
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
          onSelectChange={(val) => console.log('sele:', val)}
        />
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
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
          onSelectChange={(val) => console.log('Selected Month:', val)}
        />
      </Grid>
      {/* 
      <Grid item xs={12} md={6} lg={3}>
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
          onSelectChange={(val) => console.log('Selected Month:', val)}
        />
      </Grid> */}
      <Grid item xs={12} md={6} lg={3}>
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
          onSelectChange={(val) => console.log('Selected Month:', val)}
        />
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
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2, height: '90%' }}>
            <WhatsNewInMonthComponent birthdays={[]} events={[]} timeOffRequests={[]} />
          </Card>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Earning Section</Typography>
              <CustomizableTable
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                tableId="earning-table"
                columns={[
                  {
                    id: 'employeeType',
                    label: 'Employee Type',
                    isFilter: false,
                    render(value, row) {
                      return (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '16px',
                            fontWeight: value === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {value}
                        </Typography>
                      );
                    },
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    isFilter: false,
                    render(value, row) {
                      return (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '16px',
                            fontWeight: row.employeeType === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {formatCurrency(value)}
                        </Typography>
                      );
                    },
                  },
                ]}
                data={[
                  { employeeType: 'Teaching Allowance', amount: 5000 },
                  { employeeType: 'Transport Allowance', amount: 2000 },
                  { employeeType: 'Academic Performance Bonus', amount: 3000 },
                  { employeeType: 'Extra-curricular Activities', amount: 2000 },
                  { employeeType: 'Total Amount', amount: 12000 },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Deduction Section</Typography>
              <CustomizableTable
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                tableId="deduction-table"
                columns={[
                  {
                    id: 'deductionType',
                    label: 'Deduction Type',
                    isFilter: false,
                    render(value, row) {
                      return (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '16px',
                            fontWeight: value === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {value}
                        </Typography>
                      );
                    },
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    isFilter: false,
                    render(value, row) {
                      return (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            fontSize: '16px',
                            fontWeight: row.deductionType === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {formatCurrency(value)}
                        </Typography>
                      );
                    },
                  },
                ]}
                data={[
                  { deductionType: 'Income Tax', amount: 5000, totalDeduction: 5000 },
                  { deductionType: 'Provident Fund', amount: 3000, totalDeduction: 3000 },
                  { deductionType: 'Professional Tax', amount: 1000, totalDeduction: 1000 },
                  { deductionType: 'Insurance Premium', amount: 1000, totalDeduction: 1000 },
                  { deductionType: 'Total Amount', amount: 12000 },
                ]}
              />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" alignItems="flex-end">
              <Alert
                variant="outlined"
                icon={false}
                sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'inherit' }}
              >
                Net Salary : {formatCurrency(24000)}
              </Alert>
            </Grid>
          </Grid>
          {/* <Typography variant="h6" fontWeight="bold">
            Assignment Overview
          </Typography> */}
          {/* <StudentWiseAssignmentTable /> */}
        </Grid>
      </Grid>

      {/* Payroll Overview */}
    </Grid>
  );
};

export default MainDashboardTeacher;
