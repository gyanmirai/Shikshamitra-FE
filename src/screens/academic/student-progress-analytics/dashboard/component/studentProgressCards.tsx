import React from 'react';

import { Grid } from '@mui/material';

import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

const StudentProgressCards = () => (
  <>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Total Students"
        icon="mdi:account-multiple"
        value={8000}
        color="primary.main"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Overall Performance"
        icon="mdi:star"
        value="A+"
        color="primary.main"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Overall Performance"
        icon="mdi:star"
        value="A+"
        color="primary.main"
      />
    </Grid>
  </>
);

export default StudentProgressCards;
