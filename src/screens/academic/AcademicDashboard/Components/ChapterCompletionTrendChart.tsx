import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const ChapterCompletionTrendChart = () => {
  const series = [
    {
      name: 'Math',
      data: [10, 25, 40, 55, 70, 85],
    },
    {
      name: 'Science',
      data: [15, 30, 45, 60, 75, 80],
    },
    {
      name: 'English',
      data: [20, 35, 50, 65, 80, 90],
    },
  ];

  const chartOptions = useChart({
    chart: {
      type: 'line',
      zoom: { enabled: false },
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card sx={{ p: 2 }}>
      <CardHeader
        title="Chapter Completion Trend"
        subheader="Weekly Progress by Subject"
        sx={{ p: 0 }}
      />
      <Box dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ChapterCompletionTrendChart;
