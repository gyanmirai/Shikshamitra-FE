import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

const SubjectDifficultyBarChart = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

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

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);
  const series = [
    {
      name: 'Div A',
      data: [45, 30, 15, 20, 10],
    },
    {
      name: 'Div B',
      data: [40, 35, 20, 25, 15],
    },
    {
      name: 'Div C',
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
        formatter: (val: any) => `${val}% Failure Rate`,
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
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px', width: '100%' } }}
            />
          </Box>
        }
      />

      <Box>
        <Chart type="bar" series={series} options={chartOptions} />
      </Box>
    </Card>
  );
};

export default SubjectDifficultyBarChart;
