'use client';

import React from 'react';

import { Grid, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DashboardCard from 'src/components/dasboard-card';

const GuardOnDuty = () => (
  <>
    <Typography variant="h6" sx={{ mb: 3 }}>
      Guard Summary
    </Typography>
    <Grid container spacing={3}>
      {/* Guard Summary */}
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Guards On Duty"
          mainText="12"
          subtitleText="12 currently active"
          subtitleTextColor="#4CAF50"
          subtitleIcon={<Iconify icon="mdi:shield-account" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:account-group" width={60} height={60} />}
          mainIconColor="#4CAF50"
          subtitleIconColor="#4CAF50"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Off Duty"
          mainText="4"
          subtitleText="4 guards off shift"
          subtitleTextColor="#FFC107"
          subtitleIcon={<Iconify icon="mdi:account-off" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:account-arrow-left" width={60} height={60} />}
          mainIconColor="#FFC107"
          subtitleIconColor="#FFC107"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Absent Today"
          mainText="2"
          subtitleText="2 guards absent"
          subtitleTextColor="#F44336"
          subtitleIcon={<Iconify icon="mdi:alert-circle" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:cancel" width={60} height={60} />}
          mainIconColor="#F44336"
          subtitleIconColor="#F44336"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="On Leave"
          mainText="1"
          subtitleText="1 guard on leave"
          subtitleTextColor="#03A9F4"
          subtitleIcon={<Iconify icon="mdi:beach" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:calendar" width={60} height={60} />}
          mainIconColor="#03A9F4"
          subtitleIconColor="#03A9F4"
        />
      </Grid>
    </Grid>
  </>
);

export default GuardOnDuty;
