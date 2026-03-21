import React from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, MenuItem, TextField, CardHeader } from '@mui/material';

const ExamPerformanceHeatmap = () => {
  const series = [
    {
      name: '90-100%',
      data: [
        { x: 'Math', y: 10 },
        { x: 'Science', y: 15 },
        { x: 'English', y: 8 },
        { x: 'History', y: 12 },
      ],
    },
    {
      name: '70-89%',
      data: [
        { x: 'Math', y: 20 },
        { x: 'Science', y: 18 },
        { x: 'English', y: 25 },
        { x: 'History', y: 22 },
      ],
    },
    {
      name: '50-69%',
      data: [
        { x: 'Math', y: 15 },
        { x: 'Science', y: 12 },
        { x: 'English', y: 10 },
        { x: 'History', y: 8 },
      ],
    },
    {
      name: '<50%',
      data: [
        { x: 'Math', y: 5 },
        { x: 'Science', y: 5 },
        { x: 'English', y: 7 },
        { x: 'History', y: 8 },
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
            { from: 0, to: 10, color: '#FF4842', name: 'Low' },
            { from: 11, to: 20, color: '#FFC107', name: 'Medium' },
            { from: 21, to: 30, color: '#00AB55', name: 'High' },
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
      categories: ['Math', 'Science', 'English', 'History'],
    },
  });

  return (
    <Card>
      <CardHeader
        title="Exam Performance Distribution"
        subheader="Student Count by Score Range"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField select size="small" defaultValue="Class 10" SelectProps={{ native: false }}>
              <MenuItem value="Class 10">Class 10</MenuItem>
              <MenuItem value="Class 9">Class 9</MenuItem>
            </TextField>
            <TextField select size="small" defaultValue="Div A" SelectProps={{ native: false }}>
              <MenuItem value="Div A">Div A</MenuItem>
              <MenuItem value="Div B">Div B</MenuItem>
            </TextField>
          </Box>
        }
      />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="heatmap" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ExamPerformanceHeatmap;
