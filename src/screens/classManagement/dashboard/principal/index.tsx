'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import PrincipalDashboardOverview from './components/principalDashboardOverview';
import PrincipalSubjectCompletion from './components/principalSubjectCompletion';
import { ClassProgressComparison, SubjectCompletionTrends } from './components/principalCharts';

const PrincipalDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <PrincipalDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ClassProgressComparison />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <SubjectCompletionTrends />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <PrincipalSubjectCompletion />
      </Grid>
    </Grid>
  </Box>
);

export default PrincipalDashboard;
