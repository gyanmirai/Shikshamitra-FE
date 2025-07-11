'use client';

import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, alpha, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';
import 'src/utils/convertABPPermissionToNavigation';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

import Overview from './overview';
import EntranceExamCard from './entranceExamCard';
import AdmissionOverTime from './admission-over-time';
import OrganizationStatus from './organization-status';
import BoardEnrollmentStatus from './board-enrollment-status';
import EnrollmentActivities from '../../studentProfile/studentDashbordComponent/recentEnrollmentActivities';

const EnrollmentDashboardScreen = () => {
  const router = useRouter();

  return (
    <Box>
      <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 xs={12}>
          <Overview />
        </Grid2>
        <Grid2 xs={12}>
          <AdmissionOverTime />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <BoardEnrollmentStatus />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <OrganizationStatus />
        </Grid2>
        <Grid2 xs={12}>
          <EntranceExamCard />
        </Grid2>
        <Grid2 xs={12}>
          <EnrollmentActivities />
        </Grid2>
      </Grid2>

      {/* <Grid2 container spacing={2}>
        {sections.map((section: any) => dashBoardSections[section.id])}
      </Grid2> */}
    </Box>
  );
};

export default EnrollmentDashboardScreen;

type Props2 = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsConversionRates({ title, subheader, chart, ...other }: Props2) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    alpha(theme.palette.primary.dark, 0.24),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}: ` },
      },
    },
    xaxis: { categories: chart.categories },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: { fontSize: '10px', colors: ['#FFFFFF', theme.palette.text.primary] },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 2,
        barHeight: '30%',
        dataLabels: { position: 'top' },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={360}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

type Props3 = CardProps & {
  title?: string;
  subheader?: string;
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

export function EcommerceYearlySales({ title, subheader, chart, ...other }: Props3) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState('2023');

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

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
