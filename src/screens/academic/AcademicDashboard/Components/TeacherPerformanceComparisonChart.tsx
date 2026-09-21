import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Card } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';

interface TeacherPerformanceItem {
  teacherName: string;
  averageScore: number;
}

const TeacherPerformanceComparisonChart = ({
  chartData,
}: {
  chartData?: TeacherPerformanceItem[];
}) => {
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
      name: 'Syllabus Completion',
      data: [85, 92, 78, 95, 88, 72],
    },
    {
      name: 'Avg Student Score',
      data: [75, 82, 65, 88, 79, 68],
    },
  ];

  const dynamicCategories = chartData
    ? chartData.map((t) => t.teacherName)
    : [
        'Mr. Sharma (Math)',
        'Ms. Verma (Science)',
        'Mrs. Gupta (English)',
        'Mr. Singh (History)',
        'Ms. Patel (Geography)',
        'Mr. Das (Physics)',
      ];

  const dynamicSeries = chartData
    ? [
        {
          name: 'Avg Student Score',
          data: chartData.map((t) => Number(t.averageScore)),
        },
      ]
    : series;

  const chartOptions = useChart({
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: chartData ? '35%' : '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: dynamicCategories,
      labels: {
        rotate: -45, // <-- slanted (cross) text
        rotateAlways: true,
      },
    },

    yaxis: {
      title: {
        text: 'Percentage (%)',
      },
      max: 100,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
    colors: chartData ? ['#FFAB00'] : ['#00AB55', '#FFAB00'], // Green for Completion, Yellow/Orange for Score
    legend: {
      position: 'top',
    },
  });

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Title + Subtitle */}
        <Box>
          <Box sx={{ fontSize: '18px', fontWeight: 600 }}>Teacher Performance Comparison</Box>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            {chartData
              ? 'Average student score per teacher'
              : 'Syllabus Completion vs. Student Performance'}
          </Box>
        </Box>

        {/* Dropdowns */}
        {!chartData && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
            />

            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        {chartData?.length === 0 ? (
          <EmptyContent
            filled
            title="No teacher comparison available"
            description="Teacher-level comparison will appear when an authoritative scoring source is available."
            sx={{ minHeight: 280 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        ) : (
          <Chart type="bar" series={dynamicSeries} options={chartOptions} />
        )}
      </Box>
    </Card>
  );
};

export default TeacherPerformanceComparisonChart;
