'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import ElectiveSubjectPopularity from './components/electiveSubjectPopularity';
import ClassManagementDashboardOverview from './components/classDashboardOverview';
import ClassTeacherAssignment from './components/classManagementClassTeacherAssignment';
import ClassManagementSubjectProgress from './components/classManagementSubjectProgress';
import ClassManagementTeacherAssignment from './components/classManagementTeacherAssignment';

const AdminClassManagementDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <ClassManagementDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ElectiveSubjectPopularity />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ClassManagementTeacherAssignment />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <ClassTeacherAssignment />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <ClassManagementSubjectProgress />
      </Grid>
    </Grid>
  </Box>
);

export default AdminClassManagementDashboard;
