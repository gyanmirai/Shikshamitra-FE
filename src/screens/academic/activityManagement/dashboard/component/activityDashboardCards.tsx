'use client';

import React from 'react';
import { Grid } from '@mui/material';

import { ActivityDashboardCard } from '../dashboard';

const icons = {
  groups: 'mdi:account-multiple',
  activity: 'mdi:local-activity',
  newJoiners: 'mdi:account-plus',
  leaveRequests: 'mdi:clock-alert',
  payroll: 'mdi:wallet',
};

const ActivityDashboardCards = () => (
  <Grid container spacing={2}>
    {/* Statistics Cards */}
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <ActivityDashboardCard
        title="Total Dynamic Group"
        icon={icons.groups}
        value={20}
        labels={[]}
        color="primary.main"
        href="/activityManagement/studentGroup"
        classRequire
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <ActivityDashboardCard
        title="Total Static Group"
        icon={icons.groups}
        value={30}
        labels={[]}
        color="info.main"
        href="/activityManagement/studentGroup"
        classRequire
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <ActivityDashboardCard
        title="Total Activity"
        icon={icons.activity}
        value={25}
        labels={[]}
        color="secondary.main"
        href="/activityManagement/activityManagement"
      />
    </Grid>
  </Grid>
);

export default ActivityDashboardCards;
