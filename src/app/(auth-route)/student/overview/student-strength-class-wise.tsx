import React from 'react';
import { Card } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const StudentStrengthClassWise = () => (
  <Card sx={{ height: '100%' }}>
    <AnalyticsWebsiteVisits
      title="Class Wise Strength"
      chart={{
        categories: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7'],
        series: [
          {
            name: 'Students',
            data: [65, 45, 60, 20, 50, 85, 45], // Approximate values from the image
          },
        ],
        options: {
          tooltip: {
            custom: ({ dataPointIndex }: any) => {
              const divisions = {
                0: { A: 35, B: 30 },
                1: { A: 25, B: 20 },
                2: { A: 20, B: 9 },
                3: { A: 10, B: 10 },
                4: { A: 30, B: 20 },
                5: { A: 45, B: 40 },
                6: { A: 25, B: 20 },
              };

              const div = divisions[dataPointIndex as keyof typeof divisions];
              return `
            <div style="padding: 8px; font-size: 13px;">
              <strong>${`Class ${dataPointIndex + 1}`}</strong><br/>
              Division A: ${div.A}<br/>
              Division B: ${div.B}
            </div>
          `;
            },
          },
        },
      }}
    />
  </Card>
);

export default StudentStrengthClassWise;
