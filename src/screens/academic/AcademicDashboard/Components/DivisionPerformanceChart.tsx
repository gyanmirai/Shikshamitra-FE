import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

const DivisionPerformanceChart = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
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
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CardHeader
          title="Division-wise Performance"
          subheader="Average Score per Division"
          sx={{ p: 0 }}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClasses(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '100px', width: '100%' } }}
        />
      </Box>
      <Box dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default DivisionPerformanceChart;
