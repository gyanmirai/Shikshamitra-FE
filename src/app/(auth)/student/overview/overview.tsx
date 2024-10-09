import Grid2 from '@mui/material/Unstable_Grid2';
import React from 'react';
import { CONFIG } from 'src/config-global';
import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';

const Overview = () => (
  <>
    <Grid2 xs={12} md={6} lg={4}>
      <AnalyticsWidgetSummary
        title="Total Students"
        percent={2.6}
        total={714000}
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={4}>
      <AnalyticsWidgetSummary
        title="Total Male Students"
        percent={2.6}
        total={714000}
        color="warning"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={4}>
      <AnalyticsWidgetSummary
        title="Total Female Students"
        percent={2.6}
        total={714000}
        color="error"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
  </>
);

export default Overview;
