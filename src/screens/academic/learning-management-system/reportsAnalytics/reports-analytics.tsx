'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Box, Grid, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignmentTable from './component/assignmentTable';
import IndividualReport from './component/individualReport';
import TotalAssignments from './component/totalAssignments';
import AssignmentAnalytics from './component/assignmentAnalytics';
import StudentProgressTable from './component/studentProgressTable';
import DownloadReportsSection from './component/downloadReportsSection';
import AverageCoursePerformace from './component/averageCoursePerformace';

const ReportsAnalytics = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      sx={{ mb: 1 }}
      heading="Reports And Analytics"
      links={[
        { name: 'Academics' },
        { name: 'Learning Management System' },
        { name: 'Reports And Analytics' },
      ]}
    />
    <Typography variant="h6" sx={{ mb: 3 }}>
      Course performance
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
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
    <Grid container spacing={1}>
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

export default ReportsAnalytics;
