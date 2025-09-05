import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';

import DashboardCard from '../../../../../../components/dasboard-card';

const FinanceFeeTrackingComponent = () => (
  <>
    <Typography variant="h6" sx={{ mb: 3 }}>
      Fee Tracking
    </Typography>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Fee Collection"
          mainText={formatNumber(150000, 'INR')}
          subtitleText="₹1.5L collected this month"
          subtitleTextColor="#4CAF50"
          subtitleIcon={<Iconify icon="mdi:cash-check" width={30} height={30} />}
          mainIcon={<Iconify icon="tdesign:money" width={60} height={60} />}
          mainIconColor="#4CAF50"
          subtitleIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Fee Pending"
          mainText={formatNumber(150000, 'INR')}
          subtitleText="₹1.5L still pending from students"
          subtitleTextColor="#FF5722"
          subtitleIcon={<Iconify icon="mdi:account-alert-outline" width={30} height={30} />}
          mainIcon={<Iconify icon="mdi:clock-alert" width={60} height={60} />}
          mainIconColor="#FFAB00"
          subtitleIconColor="#FF5722"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Fee Due"
          mainText={formatNumber(150000, 'INR')}
          subtitleText="₹1.5L due by end of this month"
          subtitleTextColor="#FFAB00"
          subtitleIcon={<Iconify icon="mdi:calendar-clock" width={30} height={30} />}
          mainIcon={<Iconify icon="mingcute:alert-fill" width={60} height={60} />}
          mainIconColor="#FF5722"
          subtitleIconColor="#FFAB00"
        />
      </Grid>
    </Grid>
  </>
);

export default FinanceFeeTrackingComponent;
