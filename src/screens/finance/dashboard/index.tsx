'use client';

import React, { useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { BankingBalanceStatistics } from 'src/sections/overview/banking/banking-balance-statistics';

import FinanceFeeTrackingComponent from '../fee-management/Tabs/finance-fee-structure-overview/component/finance-fee-tracking';

const FinanceDashboardScreen = () => {
  // const paymentData = [
  //   { label: 'Cash', value: 1000000 },
  //   { label: 'Online', value: 100000 },
  //   { label: 'Cheque', value: 500000 },
  // ];
  const theme = useTheme();
  const [selectedSeries, setSelectedSeries] = useState<any>('Income');
  // const handleSelectedSeries = (d: any) => {
  //   setSelectedSeries(d);
  // };

  // const dynamicColors =
  //   selectedSeries === 'Income'
  //     ? [-12000, 10000, 5000].map((value) =>
  //         value > 0 ? theme.palette.success.main : theme.palette.error.main
  //       )
  //     : [5000, -21000, 0].map((value) =>
  //         value > 0 ? theme.palette.success.main : theme.palette.error.main
  //       );
  return (
    <Box sx={{ p: 3 }}>
      {/* Top Section: Key Metrics */}
      <FinanceFeeTrackingComponent />
      {/* <Grid container spacing={2} mb={3}>
        {[
          { title: 'Total Income', value: 120000, percent: 12 },
          { title: 'Total Expenses', value: 80000, percent: 5 },
          { title: 'Profit', value: 40000, percent: 20 },
          { title: 'Outstanding Fees', value: 30000, percent: 15 },
        ].map((metric, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <AppWidgetSummary
              title={metric.title}
              total={metric.value}
              percent={metric.percent}
              chart={{
                colors: undefined,
                categories: [],
                series: [],
                options: undefined,
              }}
            />
          </Grid>
        ))}
      </Grid> */}

      {/* Middle Section: Charts */}
      <Grid container spacing={2}>
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
        <Grid container spacing={2} sx={{ pt: '20px' }}>
          {/* <Grid item xs={12} md={6}>
            <AnalyticsCurrentVisits
              title="Payment Modes Analysis"
              chart={{ series: paymentData }}

            />
          </Grid> */}

          {/* <Grid item xs={12} md={12}>
            <AppAreaInstalled
              isShowChartLegendValue={false}
              height={400}
              title="Budget vs Actual Performance"
              selectSeries={selectedSeries}
              sendToParent={handleSelectedSeries}
              chart={{
                colors: [
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ],
                categories:
                  selectedSeries === 'Income'
                    ? ['Tuition', 'Donation', 'Grant']
                    : ['Salaries', 'Maintenance', 'Stationary'],

                series: [
                  {
                    name: 'Income',
                    data: [
                      { name: 'Budgeted', data: [50000, 20000, 15000] },
                      { name: 'Actual', data: [38000, 30000, 20000] },
                      {
                        name: 'Variance',
                        data: [-12000, 10000, 5000],
                      },
                    ],
                  },
                  {
                    name: 'Expense',
                    data: [
                      { name: 'Budgeted', data: [60000, 25000, 18000] },
                      { name: 'Actual', data: [55000, 46000, 18000] },
                      {
                        name: 'Variance',
                        data: [5000, -21000, 0],
                      },
                    ],
                  },
                ],
              }}
            />
          </Grid> */}
        </Grid>

        <Grid container spacing={2} sx={{ pt: '20px', px: '10px' }}>
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
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Budget Utilization</Typography>
            {[

              { name: "Sales", percentage: 85 },
              { name: "Marketing", percentage: 60 },
            ].map((dept, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{dept.name}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={dept.percentage}
                  color={dept.percentage > 80 ? "error" : "primary"}
                />
              </Box>
            ))}
          </Card>
        </Grid> */}
      </Grid>

      {/* Bottom Section: Key Reports */}
      {/* <Grid container spacing={2} mt={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Outstanding Fees Breakdown</Typography>
            <OutstandingFeesTable
              data={[
                { category: "Tuition", pending: 20000 },
                { category: "Transport", pending: 5000 },
              ]}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Top Income Sources</Typography>
            <PieChart
              data={[
                { label: "HR", value: 25000 },
                { label: "Sales", value: 50000 },
                { label: "Marketing", value: 15000 },
              ]}
            />
          </Card>
        </Grid>
      </Grid> */}
    </Box>
  );
};

export default FinanceDashboardScreen;
