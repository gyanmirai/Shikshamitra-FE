import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState, useCallback } from 'react';

import { Tab, Box, Card, Paper, Alert, useTheme, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import DataTable from 'src/components/commonTable';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const TABS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'activity', label: 'Activity' },
  { value: 'performance', label: 'Performance' },
  { value: 'studentPlanner', label: 'Student Planner' },
];
const Academic = () => {
  const tabs = useTabs('dashboard');
  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <Card sx={{ '& *': { fontSize: '12px !important', '& svg': { fontSize: '18px !important' } } }}>
      {renderTabs}

      <Scrollbar sx={{ minHeight: 384 }}>
        <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {tabs.value === 'dashboard' && <AcademicDashboard />}
          {tabs.value === 'activity' && <AcademicActivity />}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default Academic;

const AcademicDashboard = () => {
  const theme = useTheme();
  const [selectedSeries, setSelectedSeries] = useState('2024');
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);
  return (
    <>
      <Alert variant="outlined" severity="warning">
        You need to increase your performance in Mathematics. Focus on improving your scores in this
        subject.
      </Alert>
      <Paper sx={{ p: 2, mt: 3, display: 'flex', gap: 2 }} elevation={2}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">
            Current Percentage &nbsp;&nbsp;
            <Box
              component="span"
              sx={{
                outline: `2px dashed ${theme.palette.text.primary}`,
                p: 1,
                color: theme.palette.primary.main,
                borderRadius: '5px',
                fontSize: '14px !important',
                fontWeight: 'bold',
              }}
            >
              87.5%
            </Box>{' '}
          </Typography>
          <Typography component="span" color="text.disabled">
            (+43%) than last year
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">
            Predicted Percentage &nbsp;&nbsp;
            <Box
              component="span"
              sx={{
                outline: `2px dashed ${theme.palette.text.primary}`,
                p: 1,
                color: theme.palette.warning.main,
                borderRadius: '5px',
                fontSize: '14px !important',
                fontWeight: 'bold',
              }}
            >
              90% - 95%
            </Box>{' '}
          </Typography>
        </Box>
        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <ChartSelect
            options={['2023', '2022', '2021', '2020']}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        </Box>
      </Paper>
      <EcommerceYearlySales
        title="Current Percentage 87.5%"
        subheader="(+43%) than last year"
        selectedSeries={selectedSeries}
        chart={{
          categories: ['01/01', '07/02', '09/03', '01/04'],
          series: [
            {
              name: '2024',
              data: [
                {
                  name: 'English',
                  data: [10, 41, 35, 51],
                },
                {
                  name: 'Mathematics',
                  data: [10, 34, 13, 56],
                },
                {
                  name: 'Gujarati',
                  data: [70, 40, 30, 55],
                },
                {
                  name: 'Hindi',
                  data: [90, 84, 63, 56],
                },
              ],
            },
            {
              name: '2023',
              data: [
                {
                  name: 'English',
                  data: [51, 35, 41, 10],
                },
                {
                  name: 'Mathematics',
                  data: [56, 13, 34, 10],
                },
                {
                  name: 'Gujarati',
                  data: [58, 39, 45, 18],
                },
                {
                  name: 'Hindi',
                  data: [52, 18, 39, 40],
                },
              ],
            },
          ],
          colors: [
            theme.palette.primary.main,
            theme.palette.warning.main,
            theme.palette.success.main,
            theme.palette.error.main,
          ],
        }}
      />
      <DataTable
        data={[
          { date: '01-01-2024', marks: { english: 80, math: 80, gujarati: 80, hindi: 80 } },
          { date: '07-02-2024', marks: { english: 85, math: 40, gujarati: 90, hindi: 60 } },
        ]}
        columns={[
          { key: 'date', label: 'Date', width: '10%' },
          {
            key: 'marks',
            label: 'Marks',
            width: '10%',
            render: (row) => (
              <>
                {Object.entries(row.marks).map(([key, value]) => (
                  <Typography key={key} variant="subtitle2">
                    {key} : {value}
                  </Typography>
                ))}
              </>
            ),
          },
        ]}
      />
    </>
  );
};
type Props = CardProps & {
  title?: string;
  subheader?: string;
  selectedSeries: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({ title, subheader, chart, selectedSeries, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      {/* <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      /> */}

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

const AcademicActivity = () => {
  const studentActivityData = [
    { id: '1', activity: 'Joined Math Club', date: '2023-01-15' },
    { id: '2', activity: 'Participated in Science Fair', date: '2023-03-20' },
    { id: '3', activity: 'Attended Literature Workshop', date: '2023-05-10' },
    { id: '4', activity: 'Completed Online Python Course', date: '2023-07-05' },
    { id: '5', activity: 'Volunteered at Local Library', date: '2023-09-01' },
  ];

  const columns: any = [
    { key: 'activity', label: 'Activity' },
    { key: 'date', label: 'Date' },
  ];

  return <DataTable columns={columns} data={studentActivityData} />;
};
