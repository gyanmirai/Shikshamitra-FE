import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const ClassPerformanceComparisonChart = () => {
  const series = [{ data: [85, 82, 78, 75, 72, 70, 68, 65, 62, 60] }];

  const chartOptions = useChart({
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => `${value}%`,
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '28%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: [
        'Class 10-A',
        'Class 9-B',
        'Class 12-A',
        'Class 8-C',
        'Class 11-B',
        'Class 7-A',
        'Class 6-B',
        'Class 5-A',
        'Class 4-C',
        'Class 3-B',
      ],
    },
  });

  return (
    <Card>
      <CardHeader title="Class Performance Comparison" subheader="Average score by class" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ClassPerformanceComparisonChart;
