import React, { useState } from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, MenuItem, TextField, CardHeader } from '@mui/material';

const HomeworkTrendChart = () => {
  const [seriesData] = useState([
    {
      name: 'Submission Rate',
      data: [88, 90, 85, 92, 95, 89],
    },
  ]);

  const chartOptions = useChart({
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}%`,
      },
    },
  });

  return (
    <Card>
      <CardHeader
        title="Homework Submission Trend"
        subheader="Last 6 months"
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
        <Chart type="line" series={seriesData} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default HomeworkTrendChart;
