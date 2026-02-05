import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const SubjectDifficultyBarChart = () => {
  const series = [
    {
      name: 'Class 10',
      data: [45, 30, 15, 20, 10],
    },
    {
      name: 'Class 9',
      data: [40, 35, 20, 25, 15],
    },
    {
      name: 'Class 8',
      data: [35, 25, 10, 15, 5],
    },
  ];

  const chartOptions = useChart({
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography'],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}% Failure Rate`,
      },
    },
    legend: {
      position: 'top',
    },
  });

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <CardHeader
        title="Subject Difficulty"
        subheader="Failure Rate by Class & Subject"
        sx={{ p: 0 }}
      />
      <Box>
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SubjectDifficultyBarChart;
