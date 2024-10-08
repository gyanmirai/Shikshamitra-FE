'use client';

import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Grid, useTheme, Typography } from '@mui/material';

import { AppWidgetSummary } from 'src/screens/hr/dashboard/app-widget-summary';

import CustomSelect from 'src/components/custom-select';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { EcommerceSaleByGender } from 'src/sections/overview/e-commerce/ecommerce-sale-by-gender';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { EcommerceWidgetSummary } from 'src/sections/overview/e-commerce/ecommerce-widget-summary';
import { EcommerceSalesOverview } from 'src/sections/overview/e-commerce/ecommerce-sales-overview';

const FinanceDashboardScreen = () => {
  const theme = useTheme();
  return (
    <Box>
      <Box display="flex" gap={2} my={2}>
        <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <AppWidgetSummary
            title="Total Income"
            percent={8.2}
            total={8200}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <AppWidgetSummary
            title="Total Expenses"
            percent={73.9}
            total={73900}
            chart={{
              colors: [theme.vars.palette.warning.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EcommerceWidgetSummary
            title="Profit"
            percent={8.2}
            total={9990}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EcommerceWidgetSummary
            title="Loss"
            percent={73.9}
            total={11988}
            chart={{
              colors: [theme.vars.palette.error.light, theme.vars.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <EcommerceSaleByGender
            title="Departmental Budget Breakdown"
            total={9990}
            chart={{
              series: [
                { label: 'HR', value: 25 },
                { label: 'Sales', value: 50 },
                { label: 'Marketing', value: 75 },
              ],
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
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
        <Grid item xs={12} md={6} lg={8}>
          <EcommerceSalesOverview
            title="Current budget utilization"
            data={[
              {
                label: 'Green for within budget',
                totalAmount: 60,
                value: 60,
                color: 'primary',
              },
              {
                label: 'Red for over budget',
                totalAmount: 12,
                value: 12,
                color: 'error',
              },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Fee Collection Progress</Typography>
              <CustomSelect
                label="subject"
                options={[
                  { value: '2023', label: '2023' },
                  { value: '2022', label: '2022' },
                  { value: '2021', label: '2021' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              chart={{
                categories: ['Tuition', 'Sports', 'Activity', 'Transport'],
                series: [{ name: '', data: [43, 33, 22, 55] }],
              }}
              sx={{ boxShadow: 'none', height: '100%', width: '100%' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboardScreen;
