import type { SelectChangeEvent } from '@mui/material/Select';

import { useState } from 'react';
// components
import { Chart, useChart } from 'src/components/chart';
// @mui
import { Box, Card, Select, MenuItem, CardHeader, InputLabel, FormControl } from '@mui/material';

const StudentsPerStopChart = () => {
  const [route, setRoute] = useState('Route 1');

  const handleChange = (event: SelectChangeEvent) => {
    setRoute(event.target.value as string);
  };

  const series = [{ name: 'Students', data: [45, 32, 28, 25, 20, 15, 12, 10, 8, 5] }];

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Stop A',
        'Stop B',
        'Stop C',
        'Stop D',
        'Stop E',
        'Stop F',
        'Stop G',
        'Stop H',
        'Stop I',
        'Stop J',
      ],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students`,
      },
    },
  });

  return (
    <Card id="TR_MGR_CHART_STUDENTS_PER_STOP" sx={{ height: '100%' }}>
      <CardHeader
        title="Students by Stops"
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="route-select-label">Route</InputLabel>
            <Select
              labelId="route-select-label"
              id="route-select"
              value={route}
              label="Route"
              onChange={handleChange}
            >
              <MenuItem value="Route 1">Route 1</MenuItem>
              <MenuItem value="Route 2">Route 2</MenuItem>
              <MenuItem value="Route 3">Route 3</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default StudentsPerStopChart;
