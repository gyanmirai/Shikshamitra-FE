'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box, Card, Grid, alpha, useTheme, CardHeader, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

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
          { name: 'Academic and Assignment' },
          { name: 'Gradebook Performace' },
          { name: 'Performace Analytics' },
        ]}
        sx={{ px: 1, mb: 6 }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Class Performance</Typography>

              {/* <CustomSelect
                label="Monthly"
                options={[
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              /> */}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <CustomSelect
                label="Class"
                name="className"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                value={classes1}
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setClasses1(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="Division"
                disabled={!classes1}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division1}
                onChange={(val) => {
                  const selectedDivision = divisionOptions.find((i: Division) =>
                    (val as string).includes(i.id)
                  );
                  setDivision1(val as string);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <PerformanceOverTime
              //   title="Performance Over Time"
              //   subheader="(+43%) than last year"
              chart={{
                categories: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                series: [
                  {
                    name: '',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                ],
                options: {
                  chart: {
                    toolbar: {
                      show: true,
                      offsetX: 0,
                      offsetY: 0,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,

                        customIcons: [],
                      },
                    },
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Grade Distribution</Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
              <CustomSelect
                label="Class"
                name="className"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                value={classes2}
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setClasses2(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="Division"
                disabled={!classes2}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division2}
                onChange={(val) => {
                  setDivision2(val as string);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <GradeDistribution
              title=""
              subheader=""
              selectSeries="'"
              chart={{
                categories: ['A', 'B', 'C', 'D'],
                series: [
                  { name: 'quiz Grade', data: [12, 10, 18, 22] },
                  { name: 'other Grade', data: [12, 10, 18, 22] },
                ],
                options: {
                  chart: {
                    toolbar: {
                      show: true,
                      offsetX: 0,
                      offsetY: 0,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,

                        customIcons: [],
                      },
                    },
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Subject Analytics</Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
              <CustomSelect
                label="Class"
                name="className"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                value={classes3}
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setClasses3(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Sci', 'ENG', 'GUJ'],
                series: [
                  { name: '9-A', data: [43, 33, 22, 37] },
                  { name: '9-B', data: [51, 70, 47, 67] },
                  { name: '9-C', data: [51, 67, 47, 97] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
                options: {
                  chart: {
                    toolbar: {
                      show: true,
                      offsetX: 0,
                      offsetY: 0,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,

                        customIcons: [],
                      },
                    },
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Student Group Comparisons</Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
              <CustomSelect
                label="Class"
                name="className"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                value={classes4}
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setClasses4(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="Division"
                disabled={!classes4}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division4}
                onChange={(val) => {
                  const selectedDivision = divisionOptions.find((i: Division) =>
                    (val as string).includes(i.id)
                  );
                  setDivision4(val as string);
                }}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'Science', label: 'Science' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsCurrentVisits
              title=""
              chart={{
                series: [
                  { label: 'Tpo 10%', value: 44 },
                  { label: 'Middle 10%', value: 55 },
                  { label: 'Bottom 10%', value: 41 },
                ],
                options: {
                  chart: {
                    toolbar: {
                      show: true,
                      offsetX: 0,
                      offsetY: 0,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,

                        customIcons: [],
                      },
                    },
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceAnalytics;

function PerformanceOverTime({ title, subheader, chart, ...other }: any) {
  const theme = useTheme();

  // const [selectedSeries, setSelectedSeries] = useState('2023');

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  // const handleChangeSeries = useCallback((newValue: string) => {
  //   setSelectedSeries(newValue);
  // }, []);

  // const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        //   action={
        //     <ChartSelect
        //       options={chart.series.map((item) => item.name)}
        //       value={selectedSeries}
        //       onChange={handleChangeSeries}
        //     />
        //   }
        sx={{ mb: 3 }}
      />

      <Chart
        type="area"
        series={chart.series}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

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
