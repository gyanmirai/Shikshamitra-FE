'use client';

import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Grid, CardHeader } from '@mui/material';

const ROUTE_EFFICIENCY = [
  { route: 'R-01', score: 94, capacity: 88 },
  { route: 'R-03', score: 91, capacity: 96 },
  { route: 'R-05', score: 62, capacity: 60 },
  { route: 'R-06', score: 88, capacity: 100 },
  { route: 'R-09', score: 97, capacity: 0 },
  { route: 'R-12', score: 89, capacity: 84 },
];

const PerformanceAnalytics = () => {
  const theme = useTheme();

  // Capacity utilization chart
  const capacityOptions = useChart({
    chart: { id: 'capacity-util' },
    xaxis: { categories: ROUTE_EFFICIENCY.map((r) => r.route) },
    colors: ['#00B8D9', '#FF4842'],
    tooltip: {
      y: { formatter: (val: number) => `${val}%` },
    },
    yaxis: {
      max: 100,
      labels: { formatter: (val: number) => `${val}%` },
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: '#FFC107',
          borderWidth: 2,
          strokeDashArray: 4,
          label: {
            text: 'Optimal 80%',
            style: { color: '#B76E00', background: '#FFF8E1', fontWeight: 700 },
          },
        },
      ],
    },
  });

  const capacitySeries = [
    { name: 'Capacity Utilization', data: ROUTE_EFFICIENCY.map((r) => r.capacity) },
  ];

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={1}>
        {/* Capacity Utilization */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: 480 }}>
            <CardHeader
              title="Capacity Utilization by Route"
              subheader="Student load vs vehicle capacity — optimal target 80%"
            />
            <Box
              sx={{
                px: 2,
                pb: 12,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              dir="ltr"
            >
              <Chart type="bar" series={capacitySeries} options={capacityOptions} height={350} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceAnalytics;
