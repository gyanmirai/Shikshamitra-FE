'use client';

import type { CardProps } from '@mui/material';
import type { ColorType } from 'src/theme/core/palette';
import type { ChartOptions } from 'src/components/chart';

import React, { useState, useCallback } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Add, Report, TrackChanges } from '@mui/icons-material';
import { Box, Card, Button, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber, fPercent, fCurrency, fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const Overview = () => (
  <Grid2 container spacing={3}>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Students"
        percent={2.6}
        total={714000}
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Male Students"
        percent={2.6}
        total={714000}
        color="warning"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Female Students"
        percent={2.6}
        total={714000}
        color="error"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <Card
        sx={{
          display: 'flex',
          p: 3,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ typography: 'subtitle2' }}>Quick Actions</Box>
          <Box display="flex" gap={2} flexWrap="wrap" pt={2}>
            <Button startIcon={<Add />} variant="contained" color="primary">
              Add New Inquiry
            </Button>
            <Button startIcon={<TrackChanges />} variant="contained" color="warning">
              Track Enrollment Status
            </Button>
            <Button startIcon={<Report />} variant="contained" color="error">
              Generate Report
            </Button>
          </Box>
        </Box>
      </Card>
    </Grid2>
    <Grid2 xs={12} md={6} display="flex" gap={1}>
      <Card
        sx={{
          display: 'flex',

          p: 3,
          width: '100%',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ typography: 'subtitle2' }}>Recent Activities</Box>

          <Scrollbar sx={{ mt: 1.5 }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
                animation: 'scrollAnimation 10s linear infinite',
                animationDelay: '1s',
                '@keyframes scrollAnimation': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(-100%)' },
                },
              }}
            >
              {[
                'Student record updated',
                'Student attendance updated',
                'Student record updated',
                'Student record updated',
                'Student attendance updated',
                'Student record updated',
              ].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        </Box>
      </Card>
      <Card
        sx={{
          display: 'flex',

          p: 3,
          // mt: 1,
          width: '100%',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ typography: 'subtitle2' }}>Notifications</Box>

          <Scrollbar sx={{ mt: 1.5 }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
                animation: 'scrollAnimation 10s linear infinite',
                animationDelay: '1s',
                '@keyframes scrollAnimation': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(-100%)' },
                },
              }}
            >
              {[
                'Pending attendance update',
                'Pending record updated',
                'Pending attendance update',
                'Pending attendance update',
                'Pending record updated',
                'Pending attendance update',
              ].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        </Box>
      </Card>
    </Grid2>
    <Grid2 xs={12} md={6}>
      {/* <AttendanceOverview
        title="Attendance Overview"
        // subheader="Downloaded by operating system"
        chart={{
          series: [
            { label: 'present', value: 30 },
            { label: 'absent', value: 10 },
          ],
        }}
      /> */}
    </Grid2>
    <Grid2 xs={12} md={6}>
      <AttendanceGraph
        title="Attendance Graph"
        // subheader="Statistics on balance over time"
        chart={{
          series: [
            {
              name: 'Weekly',
              categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
              data: [
                { name: '', data: [24, 41, 35, 151, 49] },
                // { name: 'Savings', data: [24, 56, 77, 88, 99] },
                // { name: 'Investment', data: [40, 34, 77, 88, 99] },
              ],
            },
            {
              name: 'Monthly',
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              data: [
                { name: '', data: [83, 112, 119, 88, 103, 112, 114, 108, 93] },
                // { name: 'Savings', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
              ],
            },
            {
              name: 'Yearly',
              categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
              data: [
                { name: '', data: [76, 42, 29, 41, 27, 96] },
                // { name: 'Savings', data: [46, 44, 24, 43, 44, 43] },
                // { name: 'Investment', data: [23, 22, 37, 38, 32, 25] },
              ],
            },
          ],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6}>
      <AttendanceGraph
        title="Enrollment Trends"
        // subheader="Statistics on balance over time"
        selectedSeriesName="Last 6 Months"
        chart={{
          series: [
            {
              name: 'Last 12 Months',
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
              data: [
                { name: '', data: [24, 41, 35, 151, 49, 151, 49, 151, 49, 151, 49, 151] },
                // { name: 'Savings', data: [24, 56, 77, 88, 99] },
                // { name: 'Investment', data: [40, 34, 77, 88, 99] },
              ],
            },
            {
              name: 'Last 6 Months',
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
              data: [
                { name: '', data: [83, 112, 119, 88, 103, 112] },
                // { name: 'Savings', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
              ],
            },
          ],
        }}
      />
    </Grid2>
  </Grid2>
);

export default Overview;
type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  color?: ColorType;
  icon: React.ReactNode;
  chart: {
    series: number[];
    categories: string[];
    options?: ChartOptions;
  };
};
function AnalyticsWidgetSummary({
  icon,
  title,
  total,
  chart,
  percent,
  color = 'success',
  sx,
  ...other
}: Props) {
  const theme: any = useTheme();

  const chartColors = [theme.palette[color].dark];

  const chartOptions: any = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    xaxis: { categories: chart.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    tooltip: {
      // y: { formatter: (value) => value, title: { formatter: () => '' } },
    },
    ...chart.options,
  });

  const renderTrending = (
    <Box
      sx={{
        top: 16,
        gap: 0.5,
        right: 16,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
      }}
    >
      {percent && (
        <Iconify
          width={20}
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      )}
      {percent && (
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
      )}
    </Box>
  );

  return (
    <Card
      sx={{
        ...bgGradient({
          color: `135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)}`,
        }),
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {renderTrending}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
          <Box sx={{ typography: 'h4' }}>{fShortenNumber(total)}</Box>
        </Box>

        <Chart
          type="line"
          series={[{ data: chart.series }]}
          options={chartOptions}
          width={84}
          height={56}
        />
      </Box>

      <SvgColor
        src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}

type Props1 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};
export function AttendanceOverview({ title, subheader, chart, ...other }: Props1): JSX.Element {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.primary.lighter,
    theme.palette.primary.light,
    theme.palette.primary.darker,
  ];

  const chartSeries = chart.series.map((item) => item.value);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            value: { formatter: (value: number | string) => fNumber(value) },
            total: {
              formatter: (w: {
                globals: {
                  seriesTotals: number[];
                };
              }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              },
            },
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        width={{ xs: 240, xl: 260 }}
        height={{ xs: 240, xl: 260 }}
        sx={{ my: 6, mx: 'auto' }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}

type Props3 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      name: string;
      categories: string[];
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
  selectedSeriesName?: string;
};

export function AttendanceGraph({ title, subheader, chart, selectedSeriesName, ...other }: Props3) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(selectedSeriesName || 'Yearly');

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: chartColors,
    xaxis: { categories: currentSeries?.categories },
    tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  return (
    <Card {...other}>
      <CardHeader
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
      />

      {/* <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        sublabels={[`+${fPercent(43)}`, `+${fPercent(3)}`, `+${fPercent(8)}`]}
        values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
        sx={{ px: 3, gap: 3 }}
      /> */}

      <Chart
        type="bar"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
