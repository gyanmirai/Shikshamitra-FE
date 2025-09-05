'use client';

import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import DashboardCard from 'src/components/dasboard-card';

const VisitorSummary = () => (
  <>
    <Typography variant="h6" sx={{ mb: 3, mt: 3 }}>
      Visitor Summary
    </Typography>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <DashboardCard
          title="Visitors Entered Today"
          mainText="68"
          subtitleText="Total as of now"
          subtitleTextColor="#4CAF50"
          subtitleIcon={<Iconify icon="mdi:account-arrow-right" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:door-open" width={60} height={60} />}
          mainIconColor="#4CAF50"
          subtitleIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <DashboardCard
          title="Pending Exits"
          mainText="12"
          subtitleText="Still inside premises"
          subtitleTextColor="#FFC107"
          subtitleIcon={<Iconify icon="mdi:account-clock" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:door-closed" width={60} height={60} />}
          mainIconColor="#FFC107"
          subtitleIconColor="#FFC107"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <DashboardCard
          title="Flagged Entries"
          mainText="2"
          subtitleText="Suspicious activity logged"
          subtitleTextColor="#F44336"
          subtitleIcon={<Iconify icon="mdi:alert-circle-outline" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:account-alert" width={60} height={60} />}
          mainIconColor="#F44336"
          subtitleIconColor="#F44336"
        />
      </Grid>
    </Grid>
  </>
);

export default VisitorSummary;
