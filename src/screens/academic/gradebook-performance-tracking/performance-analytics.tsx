'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Grid, CardHeader } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ClassPerformance from './performance-analytics/classPerformance';
import SubjectAnalytics from './performance-analytics/subjectAnalytics';
import StudentGroupCompare from './performance-analytics/studentGroupCompare';
import GradeDistributionChart from './performance-analytics/gradeDistribution';

const PerformanceAnalytics = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Performace Analytics"
      links={[
        { name: 'Academics' },
        { name: 'Gradebook And Performace Tracking' },
        { name: 'Performace Analytics' },
      ]}
    />
    <Grid container spacing={2}>
      <ClassPerformance />
      <GradeDistributionChart />
      <SubjectAnalytics />
      <StudentGroupCompare />
    </Grid>
  </Box>
);

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
