'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// -----------------------------------------------------------------------

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics'];

const completedData = [85, 70, 60, 90, 45, 75];
const remainingData = completedData.map((v) => 100 - v);

// -----------------------------------------------------------------------

interface PlannedVsActualProgressChartData {
  intervals: string[];
  plannedPercentages: number[];
  actualPercentages: number[];
}

const PlannedVsActualProgressChart = ({
  chartData,
}: {
  chartData?: PlannedVsActualProgressChartData;
}) => {
  const theme = useTheme();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const chartOptions = useChart({
    chart: {
      stacked: true,
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: SUBJECTS,
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val: number) => `${val}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  });

  const lineChartOptions = useChart({
    chart: {
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: chartData?.intervals || [],
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val: number) => `${val}%`,
      },
    },
    colors: [theme.palette.info.main, theme.palette.success.main],
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
    legend: {
      position: 'top',
    },
  });

  const series = [
    { name: 'Completed', data: completedData },
    { name: 'Remaining', data: remainingData },
  ];

  const lineSeries = [
    { name: 'Planned Progress', data: chartData?.plannedPercentages || [] },
    { name: 'Actual Progress', data: chartData?.actualPercentages || [] },
  ];

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        sx={{ p: 0, mb: 2 }}
        title={chartData ? 'Syllabus Progress (Planned vs Actual)' : 'Chapter Completion'}
        subheader={chartData ? 'Progress curve over time' : 'Progress by Subject'}
        action={
          !chartData && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CustomSelect
                options={allClass}
                label="Class"
                value={classes}
                onChange={(val) => setClasses(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '150px' } }}
              />
              <CustomSelect
                options={allDivision}
                label="Division"
                value={division}
                onChange={(val) => setDivision(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '150px' } }}
                disabled={!classes}
              />
            </Box>
          )
        }
      />
      <Box sx={{ pt: chartData ? 1 : 3, pb: 1 }} dir="ltr">
        <Chart
          dir="ltr"
          type={chartData ? 'line' : 'bar'}
          series={chartData ? lineSeries : series}
          options={chartData ? lineChartOptions : chartOptions}
        />
      </Box>
    </Card>
  );
};

export default PlannedVsActualProgressChart;
