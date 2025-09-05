import React from 'react';
import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DashboardCard from 'src/components/dasboard-card';

const InventoryDashboardCard = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <DashboardCard
        title="Books"
        mainText="2500"
        mainIcon={<Iconify icon={GlobalIcons.bookIcon} width={60} height={60} />}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <DashboardCard
        title="IT Equipment"
        mainText="5000"
        mainIcon={<Iconify icon={GlobalIcons.itEquipmentIcon} width={60} height={60} />}
        mainIconColor="primary.main"
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <DashboardCard
        title="Stationery"
        mainText="150000"
        mainIcon={<Iconify icon={GlobalIcons.stationaryIcon} width={60} height={60} />}
        mainIconColor="secondary.main"
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <DashboardCard
        title="Sports Equipment"
        mainText="150000"
        mainIcon={<Iconify icon={GlobalIcons.sportsIcon} width={60} height={60} />}
        mainIconColor="info.main"
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <DashboardCard
        title="Pending Orders"
        mainText="150000"
        mainIcon={<Iconify icon={GlobalIcons.pendingIcon} width={60} height={60} />}
        mainIconColor="warning.main"
      />
    </Grid>
  </Grid>
);

export default InventoryDashboardCard;
