import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import { Card, Divider, useTheme, CardHeader } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOrganizationQuery } from 'src/redux/oraganization/oraganization';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const OrganizationStatus = () => {
  const theme = useTheme();

  const { data: organization, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });
  const ecommerceChart = {
    series: [
      { label: `Inquiry ${45}%`, value: 45 },
      { label: `Registered ${30}%`, value: 30 },
      { label: `Admission ${20}%`, value: 20 },
    ],
    colors: [
      [theme.palette.success.light, theme.palette.success.main], // Inquiry (Green)
      [theme.palette.info.light, theme.palette.info.main], // Registered (Purple)
      [theme.palette.primary.light, theme.palette.primary.main], // Admission (Cyan/Blue)
    ],
  };

  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsWebsiteVisits
        title="Class-wise Participation"
        subheader=""
        chart={{
          categories: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
          series: [
            {
              name: 'Participation',
              data: [9, 2, 8, 9, 8], // Adjust based on actual participation bar height (from the image)
            },
          ],
          options: {
            tooltip: {
              custom: ({ series, seriesIndex, dataPointIndex }) => {
                const participants = [30, 10, 25, 28, 26]; // Example data for each class
                const scores = [80, 70, 75, 85, 78]; // Average scores for each class

                return `
            <div style="padding: 8px; font-size: 13px;">
              <strong>Class ${dataPointIndex + 1}</strong><br/>
              <span style="color: green;">●</span> Participant: ${participants[dataPointIndex]}<br/>
              <span style="color: orange;">●</span> Average Score: ${scores[dataPointIndex]}%
            </div>
          `;
              },
            },
          },
        }}
        sx={{ height: '100%' }}
      />
    </Card>
  );
};

export default OrganizationStatus;

type Props = CardProps & {
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

export function AnalyticsCurrentVisits({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="pie"
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
