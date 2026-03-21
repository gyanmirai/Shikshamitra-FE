'use client';

import { Card } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

export const ClassProgressComparison = () => (
  <Card sx={{ height: '100%' }}>
    <AnalyticsWebsiteVisits
      title="Class-wise Progress Comparison"
      chart={{
        categories: [
          'Class 1',
          'Class 2',
          'Class 3',
          'Class 4',
          'Class 5',
          'Class 6',
          'Class 7',
          'Class 8',
          'Class 9',
          'Class 10',
          'Class 11',
          'Class 12',
        ],
        series: [
          {
            name: 'Progress %',
            data: [85, 88, 90, 75, 80, 70, 65, 60, 55, 50, 45, 40],
          },
        ],
      }}
    />
  </Card>
);

export const SubjectCompletionTrends = () => (
  <Card sx={{ height: '100%' }}>
    <AnalyticsWebsiteVisits
      title="Subject-wise Completion Trends"
      chart={{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          {
            name: 'Maths',
            data: [10, 25, 40, 55, 70, 80],
          },
          {
            name: 'Science',
            data: [15, 30, 45, 60, 65, 72],
          },
          {
            name: 'English',
            data: [20, 35, 50, 65, 80, 91],
          },
        ],
      }}
    />
  </Card>
);
