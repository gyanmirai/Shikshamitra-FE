import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Card } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// Mock data: max 15 chapters per subject
const ChapterCompletionChart = () => {
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
    { name: 'Completed', data: [12, 10, 13, 11, 9, 14] },
    { name: 'Pending', data: [3, 5, 2, 4, 6, 1] },
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    xaxis: { categories: ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'] },
    plotOptions: { bar: { horizontal: false, columnWidth: '40%' } },
    colors: ['#00AB55', '#FFAB00'], // Success, Warning
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  });

  return (
    <Card sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Title + Subtitle */}
        <Box>
          <Box sx={{ fontSize: '18px', fontWeight: 600 }}>Chapter Completion</Box>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>Progress by Subject</Box>
        </Box>

        {/* Dropdowns */}
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
      </Box>
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default ChapterCompletionChart;
