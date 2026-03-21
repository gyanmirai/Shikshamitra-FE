'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import DashboardCard from 'src/components/stat-card';
import { Iconify } from 'src/components/iconify/iconify';

const ResourceManagementCardSection = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
      <DashboardCard
        title="Books"
        mainText={formatNumber(150000, 'INR')}
        subtitleText="₹1.5L collected this month"
        subtitleTextColor="#4CAF50"
        subtitleIcon={<Iconify icon={GlobalIcons.bookIcon} width={30} height={30} />}
        mainIcon={<Iconify icon="tdesign:money" width={60} height={60} />}
        mainIconColor="#4CAF50"
        subtitleIconColor="#4CAF50"
      />
    </Grid>
  </Grid>
);

export default ResourceManagementCardSection;
