import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

const PlannedVsActualProgressChart = () => {
  const series = [{ name: 'Actual', data: [85, 90, 75, 95, 80, 88] }];
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

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  return (
    <Card sx={{ p: 2 }}>
      <CardHeader
        title="Chapter Completion"
        subheader="Progress by Subject"
        sx={{ p: 0 }}
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px', width: '100%' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
        }
      />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default PlannedVsActualProgressChart;
