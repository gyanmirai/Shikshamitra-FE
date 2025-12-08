import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Card } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

const SubjectPassFailChart = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

  const [allExamType, setAllExamType] = useState<{ id: string; name: string }[]>([]);
  const [examType, setExamType] = useState<string>('');

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
    setAllExamType([
      { id: 'midterm', name: 'Midterm' },
      { id: 'final', name: 'Final' },
      { id: 'diagnostic', name: 'Diagnostic' },
      { id: 'quarterly', name: 'Quarterly' },
      { id: 'entrance', name: 'Entrance' },
    ]);
  }, [allClass, classes]);
  const series = [
    { name: 'Passed', data: [45, 52, 38, 33] },
    { name: 'Failed', data: [35, 41, 62, 13] },
  ];

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Unit Test 1', 'Unit Test 2', 'Mid Term Exam', 'Final Exam'],
      labels: {
        rotate: -45, // <-- slanted (cross) text
        rotateAlways: true,
      },
    },
    colors: ['#00AB55', '#FF4842'], // Success, Error
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students`,
      },
    },
  });

  return (
    <Card sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
        }}
      >
        {/* Title + Subtitle */}

        <Box>
          <Box sx={{ fontSize: '18px', fontWeight: 600 }}>Exam&apos;s Pass/Fail Rate</Box>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>Student Performance by Exam</Box>
        </Box>

        {/* Dropdowns */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSelect
            options={allExamType}
            label="Exam Type"
            value={examType}
            onChange={(val) => setExamType(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
          />

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
      </Box>{' '}
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
};

export default SubjectPassFailChart;
