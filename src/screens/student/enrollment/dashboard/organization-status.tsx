import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React, { useState } from 'react';

import { Box, Card, Divider, useTheme, CardHeader, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOrganizationQuery } from 'src/redux/oraganization/oraganization';

import CustomSelect from 'src/components/custom-select';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const OrganizationStatus = () => {
  const { data: organization, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });

  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  return (
    <Card sx={{ p: 2, boxShadow: 'var(--shadows-2)', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignContent="center">
        <Typography variant="h6">Organization Status</Typography>
        <CustomSelect
          options={organization?.items || []}
          value={selectedOrganization}
          onChange={(val) => {
            setSelectedOrganization(val as string);
          }}
          isLoading={isLoading}
          label="Select organization"
          labelKey="name"
          valueKey="id"
          formControlProps={{
            sx: {
              maxWidth: '200px',
              width: '100%',
            },
          }}
        />
      </Box>

      <AnalyticsCurrentVisits
        title=""
        chart={{
          series: [
            { label: 'active', value: 100 },
            { label: 'inactive', value: 200 },
            { label: 'pending', value: 300 },
          ],
        }}
        sx={{ boxShadow: 'none', height: '100%' }}
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
