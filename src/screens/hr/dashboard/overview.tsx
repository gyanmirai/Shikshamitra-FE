import React from 'react';
import { Grid } from '@mui/material';

import { EmployeeDashboardCard } from './dashboard';

const Overview = () => (
  <>
    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 4 }}>
      <EmployeeDashboardCard
        title="Total Employees"
        icon="mdi:account-multiple"
        value={120}
        labels={[
          { name: 'Teaching: 70', color: 'info' },
          { name: 'Non-teaching: 50', color: 'secondary' },
        ]}
        color="primary.main"
        href="/hr/employee"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 4 }}>
      <EmployeeDashboardCard
        title="Attendance Overview"
        icon="mdi:calendar-check"
        value={`${85}%`}
        labels={[
          { name: 'Present: 100', color: 'success' },
          { name: 'Absent: 2', color: 'error' },
          { name: 'On Leave: 5', color: 'warning' },
        ]}
        color="secondary.main"
        href="/hr/attendance-tracking"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 4 }}>
      <EmployeeDashboardCard
        title="Pending Leave Requests"
        icon="mdi:clock-alert"
        value={3}
        color="warning.main"
        href="/hr/leave-requests/?tab=leaveHistory"
      />
    </Grid>
  </>
);

export default Overview;
