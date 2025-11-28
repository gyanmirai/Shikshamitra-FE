import React from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const TeacherWorkloadHeatmap = () => {
  const series = [
    {
      name: 'Mon',
      data: [
        { x: '8am', y: 5 },
        { x: '10am', y: 8 },
        { x: '12pm', y: 2 },
        { x: '2pm', y: 6 },
        { x: '4pm', y: 3 },
      ],
    },
    {
      name: 'Tue',
      data: [
        { x: '8am', y: 4 },
        { x: '10am', y: 7 },
        { x: '12pm', y: 3 },
        { x: '2pm', y: 5 },
        { x: '4pm', y: 4 },
      ],
    },
    {
      name: 'Wed',
      data: [
        { x: '8am', y: 6 },
        { x: '10am', y: 9 },
        { x: '12pm', y: 1 },
        { x: '2pm', y: 7 },
        { x: '4pm', y: 2 },
      ],
    },
    {
      name: 'Thu',
      data: [
        { x: '8am', y: 5 },
        { x: '10am', y: 6 },
        { x: '12pm', y: 2 },
        { x: '2pm', y: 5 },
        { x: '4pm', y: 3 },
      ],
    },
    {
      name: 'Fri',
      data: [
        { x: '8am', y: 4 },
        { x: '10am', y: 5 },
        { x: '12pm', y: 3 },
        { x: '2pm', y: 4 },
        { x: '4pm', y: 5 },
      ],
    },
  ];

  const chartOptions = useChart({
    chart: {
      type: 'heatmap',
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      heatmap: {
        radius: 4,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 3, color: '#00AB55', name: 'Low' },
            { from: 4, to: 6, color: '#FFC107', name: 'Medium' },
            { from: 7, to: 10, color: '#FF4842', name: 'High' },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: ['8am', '10am', '12pm', '2pm', '4pm'],
    },
  });

  return (
    <Card>
      <CardHeader title="Teacher Workload Heatmap" subheader="Classes & Reviews Load" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="heatmap" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default TeacherWorkloadHeatmap;
