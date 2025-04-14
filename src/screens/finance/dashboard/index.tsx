'use client';

import React, { useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { BankingBalanceStatistics } from 'src/sections/overview/banking/banking-balance-statistics';

import FinanceFeeTrackingComponent from '../fee-management/Tabs/finance-fee-structure-overview/component/finance-fee-tracking';

const FinanceDashboardScreen = () => {
  const theme = useTheme();
  const [selectedSeries, setSelectedSeries] = useState<any>('Income');

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Section: Key Metrics */}
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Finance' }, { name: 'Dashboard' }]}
        sx={{ mb: 2 }}
        description="Easily manage and analyze key financial metrics like collections, refunds, and expense breakdowns."
      />
      <FinanceFeeTrackingComponent />

      {/* Middle Section: Charts */}
      <Grid container spacing={2} sx={{ pt: 5 }}>
        <Grid item xs={12} md={12}>
          <EcommerceYearlySales
            id=""
            title="Income vs. Expense"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  name: '2022',
                  data: [
                    {
                      name: 'Total income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    {
                      name: 'Total income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>
        <Grid container spacing={2} sx={{ pt: '20px' }} />
      </Grid>

      <Grid container spacing={2} sx={{ pt: '20px' }}>
        <Grid item xs={12} md={6}>
          <BankingBalanceStatistics
            title="Expense statistics"
            // subheader="Statistics on balance over time"

            chart={{
              series: [
                {
                  name: 'Weekly',
                  categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                  data: [
                    { name: 'Salaries', data: [24, 41, 35, 151, 49] },
                    { name: 'Maintenance', data: [24, 56, 77, 88, 99] },
                    // { name: 'Investment', data: [40, 34, 77, 88, 99] },
                  ],
                },
                {
                  name: 'Monthly',
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  data: [
                    { name: 'Salaries', data: [83, 112, 119, 88, 103, 112, 114, 108, 93] },
                    { name: 'Maintenance', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                    // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
                  ],
                },
                {
                  name: 'Yearly',
                  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  data: [
                    { name: 'Salaries', data: [76, 42, 29, 41, 27, 96] },
                    { name: 'Maintenance', data: [46, 44, 24, 43, 44, 43] },
                    // { name: 'Investment', data: [23, 22, 37, 38, 32, 25] },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} px={1}>
          <BankingBalanceStatistics
            title="Income statistics"
            // subheader="Statistics on balance over time"

            chart={{
              series: [
                {
                  name: 'Weekly',
                  categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                  data: [
                    { name: 'Fee', data: [24, 41, 35, 151, 49] },
                    { name: 'Donation', data: [24, 56, 77, 88, 99] },
                    // { name: 'Investment', data: [40, 34, 77, 88, 99] },
                  ],
                },
                {
                  name: 'Monthly',
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  data: [
                    { name: 'Fee', data: [83, 112, 119, 88, 103, 112, 114, 108, 93] },
                    { name: 'Donation', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                    // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
                  ],
                },
                {
                  name: 'Yearly',
                  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  data: [
                    { name: 'Fee', data: [76, 42, 29, 41, 27, 96] },
                    { name: 'Donation', data: [46, 44, 24, 43, 44, 43] },
                    // { name: 'Investment', data: [23, 22, 37, 38, 32, 25] },
                  ],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboardScreen;
