'use client';

import { Card } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

export const SubjectPerformanceChart = () => (
  <Card sx={{ height: '100%' }}>
    <AnalyticsWebsiteVisits
      title="My Subject Performance"
      chart={{
        categories: [
          'Chapter 1',
          'Chapter 2',
          'Chapter 3',
          'Chapter 4',
          'Chapter 5',
          'Chapter 6',
          'Chapter 7',
          'Chapter 8',
        ],
        series: [
          {
            name: 'Completion %',
            data: [100, 100, 100, 85, 70, 50, 20, 0],
          },
        ],
      }}
    />
  </Card>
);
