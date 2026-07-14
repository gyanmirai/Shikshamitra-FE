'use client';

import React from 'react';
import { Card, Grid, Typography } from '@mui/material';
import { AnalyticsConversionRates } from 'src/components/dashboard/analytics-conversion-rates';

const DashboardProgressVisualization = () => (
  <Grid size={12} mt={2}>
    <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
      <Typography variant="h6">Progress Visualization</Typography>
      <AnalyticsConversionRates
        title=""
        chart={{
          categories: ['Math', 'Science', 'English', 'Gujarati', 'Hindi'],
          series: [{ name: '', data: [70, 65, 71, 79, 85] }],
          options: {
            chart: {
              toolbar: {
                show: true,
                offsetX: 0,
                offsetY: 0,
                tools: {
                  download: false,
                  selection: false,
                  zoom: false,
                  zoomin: false,
                  zoomout: false,
                  pan: false,
                  customIcons: [],
                },
              },
            },
          },
        }}
        sx={{ height: '100%', boxShadow: 'none' }}
      />
    </Card>
  </Grid>
);

export default DashboardProgressVisualization;
