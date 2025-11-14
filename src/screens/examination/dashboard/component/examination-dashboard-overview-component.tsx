'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ExaminationDashboardOverviewComponent = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const theme = useTheme();
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({ classId: firstClass.id });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  // const totalExams = ["6"]

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Examination and Assessment' },
          { name: 'Examination' },
          { name: 'Dashboard' },
        ]}
        sx={{ mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:calendar',
                label: 'Schedule Exam',
                href: '/examination/scheduleExam',
                color: 'primary',
              },
              {
                icon: 'mdi:plus',
                label: 'Create Assessment',
                href: '/examination/assessmentManagement',
                color: 'secondary',
              },
              {
                icon: 'mdi:plus',
                label: 'Create Rubric',
                href: '/examination/settings',
                color: 'warning',
              },
              {
                icon: 'mdi:upload',
                label: 'Upload Marks',
                href: '/examination/gradeEntry',
                color: 'error',
              },
            ]}
          />
        }
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({ classId: val as string });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
        />
      </Box>
      <Grid container spacing={2} mt={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <EmployeeDashboardCard
            title="Total Exam"
            icon="ph:exam"
            value={18}
            labels={[
              { name: 'Scheduled : 03', color: 'info' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="primary.main"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EmployeeDashboardCard
            title="Total Assessment"
            icon="ic:baseline-assessment"
            value={21}
            labels={[
              { name: 'Pending : 03', color: 'warning' },
              { name: 'Under Review : 03', color: 'info' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="secondary.main"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EmployeeDashboardCard
            title="Total Rubric"
            icon="material-symbols:rubric"
            value={16}
            labels={[]}
            color="warning.main"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EmployeeDashboardCard
            title="Total Quiz"
            icon="mdi:quiz"
            value={21}
            labels={[
              { name: 'Scheduled : 03', color: 'warning' },
              { name: 'Active : 03', color: 'info' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Attendees/Non-Attendees in Exams</Typography>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {}}
                formControlProps={{ sx: { width: '200px' } }}
              />
            </Box>

            <AnalyticsWebsiteVisits
              title=""
              chart={{
                categories: ['Exam1', 'Exam2', 'Exam3', 'Exam4', 'Exam5', 'Exam6', 'Exam7'],
                series: [
                  { name: 'Attendees', data: [43, 33, 22, 37, 18, 35, 27] },
                  { name: 'Non-Attendees', data: [20, 45, 15, 65, 80, 5] },
                ],
                colors: [
                  alpha(theme.vars.palette.primary.dark, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
              }}
              sx={{ height: '100%' }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Average Score of Quiz</Typography>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {}}
                formControlProps={{ sx: { width: '200px' } }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              chart={{
                categories: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5', 'Quiz 6', 'Quiz 7'],
                series: [{ name: '', data: [43, 33, 22, 37, 18, 35, 27] }],
                colors: [alpha(theme.vars.palette.primary.dark, 0.8)],
                options: { legend: { show: false, position: 'top' } },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography component="span" variant="h6" gutterBottom>
              Total Number of Scheduled Exams
            </Typography>

            <Box display="flex" alignItems="flex-center">
              <Typography
                sx={{ fontSize: '25px', lineHeight: '25px', pr: 1, pt: '5px' }}
                gutterBottom
              >
                •
              </Typography>
              <Typography sx={{ fontSize: '25px' }} gutterBottom>
                {' '}
                30
              </Typography>
            </Box>
          </Card> */}
      {/* <ScrollableCard fontSize='30px' showFilter = {false} title="Total Number of Scheduled Exams" content={totalExams} />         */}
      {/* </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter title="Upcoming Exams" content={pendingExams} />{' '}
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Completed Exams" content={pendingExams} />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Pending Exams" content={pendingExams} />{' '}
        </Grid2>
      </Grid2>

      <Box display="flex" flexDirection="row" gap={3} sx={{ pb: '20px', pt: '20px' }}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
      <Grid2 lg={12}>
        <CalendarView />
      </Grid2> */}
    </Box>
  );
};

export default ExaminationDashboardOverviewComponent;
