import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import React from 'react'
import { CONFIG } from 'src/config-global';
import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';
// import { Chart, useChart } from 'src/components/chart';
// import type { CardProps } from '@mui/material';
// import type { ColorType } from 'src/theme/core';
// import type { ChartOptions } from 'src/components/chart';

const FinanceFeeTrackingComponent = () => {
  return (
    <Grid2 container spacing={3} py="14px">
   <Grid2 xs={12} md={6} lg={4}>
   <AnalyticsWidgetSummary
        title="Total Fees Collected"
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
        title="Total Fees Pending"
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
        title="Total Fees Due"
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
   
    </Grid2>
  )
}

export default FinanceFeeTrackingComponent