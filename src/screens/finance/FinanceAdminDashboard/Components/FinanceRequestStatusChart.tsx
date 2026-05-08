import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: { label: string; value: number }[];
    options?: ChartOptions;
  };
};

export default function FinanceRequestStatusChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? [
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.light,
    theme.palette.primary.light,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 3, colors: [theme.palette.background.paper] },
    dataLabels: {
      enabled: false,
      formatter: (val: number, opts: any) => {
        const name = opts.w.globals.labels[opts.seriesIndex];
        return [`${name}`, `${val.toFixed(1)}%`];
      },
      style: {
        fontSize: '12px',
        fontWeight: '700',
        colors: [theme.palette.text.primary],
      },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '45%',
          labels: { show: false },
        },
        expandOnClick: true,
        dataLabels: { offset: 28, minAngleToShowLabel: 10, show: false },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
    legend: { show: true },
    ...chart.options,
    highcharts: {
      chart: {
        animation: false,
      },
      plotOptions: {
        pie: {
          animation: false,
          innerSize: '65%',
          borderWidth: 1,
          dataLabels: {
            enabled: true,
            distance: 32,
            formatter(this: any) {
              console.log(this);
              // eslint-disable-next-line react/no-this-in-sfc
              return `<div style="text-align:center;"><span style="font-size:12px;font-weight:600;">${this.point.name}</span><br/><span style="font-size:11px;">${this.point.y}</span></div>`;
            },
            useHTML: true,
            style: {
              fontSize: '12.5px',
              fontWeight: '700',
              textOutline: 'none',
            },
            connectorShape: 'crookedLine',
            crookDistance: '60%',
          },
        },
      },
    },
  });

  return (
    <Card {...other} sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <CardHeader title={title} subheader={subheader} sx={{ p: 0, mb: 1 }} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        sx={{ flexGrow: 1, mx: 'auto', width: '100%' }}
      />
    </Card>
  );
}
