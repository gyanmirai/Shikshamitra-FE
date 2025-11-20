'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { BankingBalanceStatistics } from 'src/sections/overview/banking/banking-balance-statistics';

import GuardOnDuty from './guard-on-duty';
import VisitorSummary from './visitor-summary';
import EarlyRequestBehaviour from './early-request-behaviour';

const SecurityAdminDashboard = () => (
  // const [selectedSeries, setSelectedSeries] = useState<any>('Income');

  <Box sx={{ p: 3 }}>
    {/* Top Section: Key Metrics */}
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'Security' }, { name: 'Dashboard' }]}
      sx={{ mb: 2 }}
    />
    <GuardOnDuty />
    <VisitorSummary />

    <Grid container spacing={2} sx={{ pt: '20px' }}>
      <Grid size={12}>
        <BankingBalanceStatistics
          title="Visitor Analytics"
          // subheader="Statistics on balance over time"

          chart={{
            series: [
              {
                name: 'Weekly',
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                data: [
                  { name: 'Entered', data: [45, 62, 58, 73, 65] },
                  { name: 'Exited', data: [40, 60, 55, 70, 62] },
                  { name: 'Flagged', data: [2, 1, 3, 1, 2] },
                ],
              },
              {
                name: 'Monthly',
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                data: [
                  { name: 'Entered', data: [280, 310, 295, 330, 360, 390, 400, 385, 370] },
                  { name: 'Exited', data: [270, 305, 290, 325, 355, 385, 395, 380, 365] },
                  { name: 'Flagged', data: [5, 4, 6, 3, 2, 4, 5, 4, 3] },
                ],
              },
              {
                name: 'Yearly',
                categories: ['2019', '2020', '2021', '2022', '2023', '2024'],
                data: [
                  { name: 'Entered', data: [2800, 3100, 2950, 3300, 3600, 3900] },
                  { name: 'Exited', data: [2700, 3050, 2900, 3250, 3550, 3850] },
                  { name: 'Flagged', data: [25, 22, 30, 18, 20, 24] },
                ],
              },
            ],
          }}
        />
      </Grid>
    </Grid>

    <EarlyRequestBehaviour />
  </Box>
);
export default SecurityAdminDashboard;
