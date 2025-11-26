import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const HRPayrollSummary = () => {
  const series = [{ data: [12, 4, 2] }];
  const categories = ['Paid', 'Pending', 'On Hold'];

  const chartOptions = useChart({
    colors: ['#00AB55', '#FFAB00', '#FF5630'],
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '40%',
        borderRadius: 4,
        distributed: true,
      },
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Employees`,
        title: {
          formatter: () => '',
        },
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Payroll Summary" />
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
};

export default HRPayrollSummary;
