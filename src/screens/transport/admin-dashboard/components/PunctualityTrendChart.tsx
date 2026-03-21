import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const PunctualityTrendChart = () => {
  const series = [
    { name: 'On Time', type: 'area', fill: 'gradient', data: [80, 85, 78, 90, 88, 92, 95] },
    { name: 'Delayed', type: 'line', fill: 'solid', data: [15, 10, 18, 8, 10, 5, 3] },
  ];

  const chartOptions = useChart({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    colors: ['#00AB55', '#FF4842'],
    stroke: { curve: 'smooth' },
    fill: { type: ['gradient', 'solid'] },
    xaxis: { type: 'category' },
    tooltip: {
      y: { formatter: (value: number) => `${value} Routes` },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Route Punctuality Trends" subheader="(Last 7 Days)" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
};

export default PunctualityTrendChart;
