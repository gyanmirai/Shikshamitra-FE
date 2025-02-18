import React from 'react';

import { Box, Card, Grid, Button, Typography } from '@mui/material';

import { EcommerceWidgetSummary } from 'src/sections/overview/e-commerce/ecommerce-widget-summary';

const DashboardMiddleChart = () => (
  <Grid container spacing={2} mt={2}>
    <Grid item xs={12} md={4}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ pt: 2 }}>
            Next Payroll
          </Typography>
          <Typography variant="h6" sx={{ pt: 1 }}>
            Nov 2, 2024
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
            <Button variant="contained" color="warning">
              Run Payroll
            </Button>
            <Button variant="contained" color="primary">
              Payroll History
            </Button>
          </Box>
        </Box>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <EcommerceWidgetSummary
        title="Total Employees"
        percent={8.2}
        total={200}
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid>
    <Grid item xs={12} md={4}>
      <EcommerceWidgetSummary
        title="Total Compensation"
        percent={8.2}
        total={200}
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid>
  </Grid>
);

export default DashboardMiddleChart;
