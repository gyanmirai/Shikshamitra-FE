import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const DepartmentSyllabusProgressChart = () => {
  const series = [75, 80, 65, 90];

  const chartOptions = useChart({
    labels: ['Science', 'Math', 'Languages', 'Social Studies'],
    stroke: {
      colors: ['transparent'],
    },
    legend: {
      floating: true,
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value}%`,
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <Card>
      <CardHeader
        title="Department Syllabus Progress"
        subheader="Completion percentage by department"
      />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="donut" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default DepartmentSyllabusProgressChart;
