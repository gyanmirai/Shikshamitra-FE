import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const DivisionPerformanceChart = () => {
  const series = [
    {
      name: 'Average Score',
      data: [82, 78, 85, 72, 88],
    },
  ];

  const chartOptions = useChart({
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '45%',
        distributed: true,
      },
    },
    // @ts-ignore
    xaxis: {
      categories: ['Div A', 'Div B', 'Div C', 'Div D', 'Div E'],
    },
    colors: ['#00AB55'],
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Division-wise Performance" subheader="Average Score per Division" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default DivisionPerformanceChart;
