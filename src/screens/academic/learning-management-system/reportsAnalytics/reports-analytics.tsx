'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, useTheme, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignmentTable from './component/assignmentTable';
import IndividualReport from './component/individualReport';
import TotalAssignments from './component/totalAssignments';
import AssignmentAnalytics from './component/assignmentAnalytics';
import StudentProgressTable from './component/studentProgressTable';
import DownloadReportsSection from './component/downloadReportsSection';
import AverageCoursePerformace from './component/averageCoursePerformace';

const ReportsAnalytics = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports And Analytics"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Learning Management System' },
          { name: 'Reports And Analytics' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Typography variant="h6" sx={{ mb: 3 }}>
        Course performance
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <CustomSelect
          options={[]}
          value=""
          label="Course"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
        />
        <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
      </Box>
      <Grid container spacing={3}>
        <AverageCoursePerformace />
        <TotalAssignments />
        <AssignmentAnalytics />
        <AssignmentTable />
        <IndividualReport />
        <StudentProgressTable />
        <DownloadReportsSection />
      </Grid>
    </Box>
  );
};

export default ReportsAnalytics;
