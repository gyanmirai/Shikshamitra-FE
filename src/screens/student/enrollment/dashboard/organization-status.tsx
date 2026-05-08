import type { CardProps } from '@mui/material';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const OrganizationStatus = () => (
  // const theme = useTheme();

  // const [selectedOrganization, setSelectedOrganization] = useState<string>('');
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
            custom: ({ series, seriesIndex, dataPointIndex }: any) => {
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
export default OrganizationStatus;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: { colors?: string[]; series: { label: string; value: number }[]; options?: ChartOptions };
};

export function AnalyticsCurrentVisits({ title, subheader, chart, ...other }: Props) {
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
      enabled: true,
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
          size: '55%',
          labels: { show: false },
        },
        expandOnClick: true,
        dataLabels: { offset: 28, minAngleToShowLabel: 10 },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
    legend: { show: false },
    ...chart.options,
    highcharts: {
      chart: {
        animation: false,
        events: {
          load(this: any) {
            // eslint-disable-next-line react/no-this-in-sfc
            const series = this.series[0];
            if (!series?.points?.length) return;
            series.points.forEach((point: any, i: number) => {
              const delay = i * 180;
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
        series={chartSeries}
        options={chartOptions}
        sx={{ flexGrow: 1, mx: 'auto' }}
      />
    </Card>
  );
}
