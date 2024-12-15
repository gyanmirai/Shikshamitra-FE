'use client';

import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { AppWidgetSummary } from 'src/screens/hr/dashboard/app-widget-summary';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { EcommerceSaleByGender } from 'src/sections/overview/e-commerce/ecommerce-sale-by-gender';

const FinanceDashboardScreen = () => {
  const theme = useTheme();
  return (
    <Box sx={{ p: 3 }}>
      {/* Top Section: Key Metrics */}
      <Grid container spacing={2} mb={3}>
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
      </Grid>

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
          <Grid item xs={12} md={4}>
            <EcommerceSaleByGender
              title="Fee Collection Status"
              total={9990}
              chart={{
                series: [
                  { label: 'Collected', value: 75 },
                  { label: 'Pending', value: 15 },
                  { label: 'Overdue', value: 10 },
                ],
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <EcommerceSaleByGender
              title="Payment Modes Analysis"
              total={9990}
              chart={{
                series: [
                  { label: 'Online', value: 45 },
                  { label: 'Cash', value: 35 },
                  { label: 'Card', value: 20 },
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
