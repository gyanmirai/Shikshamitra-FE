import React from 'react';
import { Box, Grid, Card, Typography } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const TotalInquiries = () => (
  <Grid size={6}>
    <Card sx={{ boxShadow: 'var(--shadows-2)', p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">Total Inquiries</Typography>
      </Box>
      <AnalyticsWebsiteVisits
        title=""
        //   subheader="(+43%) than last year"
        chart={{
          categories: ['Inquiry', 'Registration', 'Admission'],

          series: [
            {
              name: '',
              data: [1380, 1100, 990],
            },
          ],
          options: {
            plotOptions: {
              bar: {
                horizontal: true,
                isFunnel: true,
              },
            },
            dataLabels: {
              enabled: true,
              formatter(val, opt) {
                return `${opt.w.globals.labels[opt.dataPointIndex]}:  ${val}`;
              },
              dropShadow: {
                enabled: true,
              },
            },
          },
        }}
        sx={{ boxShadow: 'none', height: '100%' }}
      />
    </Card>
  </Grid>
);

export default TotalInquiries;
