import React from 'react';

import { Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import { Iconify } from 'src/components/iconify';

import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';

const FinanceFeeTrackingComponent = () => (
  <>
    <Typography component="span" variant="h6" gutterBottom>
      Fee Tracking
    </Typography>
    <Grid2 container spacing={3} py="14px">
      <Grid2 xs={12} md={6} lg={4}>
        <AnalyticsWidgetSummary
          title="Total Fees Collected"
          percent={2.6}
          total={1500}
          icon={
            <Iconify icon="pen" sx={{ height: '16px', width: '16px' }} />

            // <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [22, 8, 35, 50, 82, 84, 77, 12],
          }}
        />
      </Grid2>
      <Grid2 xs={12} md={6} lg={4}>
        <AnalyticsWidgetSummary
          title="Total Fees Pending"
          percent={2.8}
          total={1723315}
          color="warning"
          icon={
            <Iconify icon="pen" sx={{ height: '16px', width: '16px' }} />
            // <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-buy.svg`} />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [40, 70, 50, 28, 70, 75, 7, 64],
          }}
        />
      </Grid2>
      <Grid2 xs={12} md={6} lg={4}>
        <AnalyticsWidgetSummary
          title="Total Fees Due"
          percent={3.6}
          total={234677}
          color="error"
          icon={
            <Iconify icon="pen" sx={{ height: '16px', width: '16px' }} />
            // <img
            //   alt="icon"
            //   src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-message.svg`}
            // />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [56, 30, 23, 54, 47, 40, 62, 73],
          }}
        />
      </Grid2>
    </Grid2>
  </>
);

export default FinanceFeeTrackingComponent;
