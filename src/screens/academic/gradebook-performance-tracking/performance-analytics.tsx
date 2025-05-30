'use client';

import type { Division } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box, Card, Grid, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Chart, useChart } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ClassPerformance from './performanceAnalytics/classPerformance';
import SubjectAnalytics from './performanceAnalytics/subjectAnalytics';
import StudentGroupCompare from './performanceAnalytics/studentGroupCompare';
import GradeDistributionChart from './performanceAnalytics/gradeDistribution';

const PerformanceAnalytics = (props: TabComponentType) => {
  const [classes1, setClasses1] = useState<string>('');
  const [classes2, setClasses2] = useState<string>('');
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');

  const [division1, setDivision1] = useState<string>('');
  const [division2, setDivision2] = useState<string>('');
  const [division3, setDivision3] = useState<string>('');
  const [division4, setDivision4] = useState<string>('');

  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Performace Analytics"
        links={[
          { name: 'Academics' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Performace Analytics' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Grid container spacing={2}>
        <ClassPerformance />
        <GradeDistributionChart />
        <SubjectAnalytics />
        <StudentGroupCompare />
      </Grid>
    </Box>
  );
};

export default PerformanceAnalytics;

export function GradeDistribution({ title, subheader, chart, selectSeries, ...other }: any) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: { y: { formatter: (value: number) => fNumber(value) } },
    plotOptions: { bar: { columnWidth: '40%' } },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
