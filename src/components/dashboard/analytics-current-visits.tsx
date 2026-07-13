import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import { useTheme } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: { colors?: string[]; series: { label: string; value: number }[]; options?: ChartOptions };
};

export function AnalyticsCurrentVisits({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();
  const chartOptions = useChart({
    colors: chart.colors ?? [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.light,
      theme.palette.primary.light,
    ],
    labels: chart.series.map((item) => item.label),
    stroke: { width: 3, colors: [theme.palette.background.paper] },
    dataLabels: {
      enabled: true,
      formatter: (value: number, options: any) => [
        options.w.globals.labels[options.seriesIndex],
        `${value.toFixed(1)}%`,
      ],
      style: { fontSize: '12px', fontWeight: '700', colors: [theme.palette.text.primary] },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: { size: '55%', labels: { show: false } },
        expandOnClick: true,
        dataLabels: { offset: 28, minAngleToShowLabel: 10 },
      },
    },
    tooltip: { y: { formatter: (value: number) => `${value.toFixed(1)}%` } },
    legend: { show: false },
    ...chart.options,
    highcharts: {
      chart: {
        animation: false,
        events: {
          load(event: any) {
            const series = event.target.series[0];
            if (!series?.points?.length) return;
            series.points.forEach((point: any, index: number) => {
              const delay = index * 180;
              if (point.graphic) {
                point.graphic.attr({ opacity: 0, scaleX: 0.6, scaleY: 0.6 });
                setTimeout(() => {
                  point.graphic?.animate({ opacity: 1, scaleX: 1, scaleY: 1 }, { duration: 600 });
                }, delay);
              }
              if (point.dataLabel) {
                point.dataLabel.attr({ opacity: 0 });
                setTimeout(() => {
                  point.dataLabel?.animate({ opacity: 1 }, { duration: 350 });
                }, delay + 400);
              }
              if (point.connector) {
                point.connector.attr({ opacity: 0 });
                setTimeout(() => {
                  point.connector?.animate({ opacity: 1 }, { duration: 350 });
                }, delay + 400);
              }
            });
          },
        },
      },
      plotOptions: {
        pie: {
          animation: false,
          innerSize: '55%',
          borderWidth: 1,
          dataLabels: {
            enabled: true,
            distance: 32,
            // Highcharts binds the data-label formatter context through `this`.
            formatter(this: any) {
              // eslint-disable-next-line react/no-this-in-sfc
              return `<span style="font-size:12px;font-weight:600;">${this.point.name}</span><br/>`;
            },
            useHTML: true,
            style: {
              fontSize: '12.5px',
              fontWeight: '700',
              textOutline: 'none',
            },
            connectorShape: 'crookedLine',
            crookDistance: '70%',
          },
        },
      },
      ...((chart.options as any)?.highcharts ?? {}),
    },
  });

  return (
    <Card {...other} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title={title} subheader={subheader} sx={{ p: 0, mb: 1 }} />
      <Chart
        type="donut"
        series={chart.series.map((item) => item.value)}
        options={chartOptions}
        sx={{ flexGrow: 1, mx: 'auto' }}
      />
    </Card>
  );
}
