import React from 'react';

import { Grid } from '@mui/material';

import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

const DashboardCards = () => (
  <>
    <Grid item xs={12} md={4}>
      <EmployeeDashboardCard
        title="Total Assignments"
        icon="material-symbols:assignment"
        value={35}
        labels={[
          { name: 'Active : 10', color: 'info' },
          { name: 'Pending : 10', color: 'warning' },
          { name: 'Completed : 15', color: 'primary' },
        ]}
        color="primary.main"
      />
    </Grid>
    <Grid item xs={12} md={4}>
      <EmployeeDashboardCard
        title="Total Homeworks"
        icon="material-symbols:assignment"
        value={35}
        labels={[
          { name: 'Active : 10', color: 'info' },
          { name: 'Pending : 10', color: 'warning' },
          { name: 'Completed : 15', color: 'primary' },
        ]}
        color="primary.main"
      />
    </Grid>
    <Grid item xs={12} md={4}>
      <EmployeeDashboardCard
        title="Upcoming Grade Publish"
        icon="material-symbols:grade"
        value="Algebra Assignment"
        // labels={[
        //   { name: 'Active : 10', color: 'info' },
        //   { name: 'Pending : 10', color: 'warning' },
        //   { name: 'Completed : 15', color: 'primary' },
        // ]}
        color="primary.main"
      />
    </Grid>
  </>
);

export default DashboardCards;
