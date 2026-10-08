import type { StudentModuleDashboardMetric } from 'src/redux/student/dashboard/student-module-dashboard-types';

import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';

import { dashboardChartPalette } from '../dashboard-graph-data';

export default function StudentDashboardChart({
  rows,
  type,
  title,
}: {
  rows: Pick<StudentModuleDashboardMetric, 'label' | 'value'>[];
  type: 'donut' | 'bar';
  title: string;
}) {
  const theme = useTheme();
  const height = type === 'donut' ? 220 : Math.max(240, rows.length * 36);
  const options = useChart({
    chart: { height, toolbar: { show: false }, animations: { enabled: false } },
    labels: rows.map((row) => row.label),
    colors: dashboardChartPalette.map((color) => theme.palette[color].main),
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '55%' },
      pie: { donut: { size: '68%', labels: { show: false } } },
    },
    xaxis: { categories: rows.map((row) => row.label) },
    yaxis: {
      min: 0,
      labels: { formatter: (value: number) => Math.round(value).toLocaleString('en-IN') },
    },
    tooltip: { y: { formatter: (value: number) => value.toLocaleString('en-IN') } },
    highcharts: {
      chart: { animation: false },
      plotOptions: { series: { animation: false } },
      exporting: { enabled: false },
      yAxis: { allowDecimals: false, title: { text: type === 'bar' ? 'Count' : undefined } },
      accessibility: { enabled: true, description: title },
    },
  });
  return (
    <Chart
      type={type}
      series={
        type === 'donut'
          ? rows.map((row) => row.value)
          : [{ name: 'Count', data: rows.map((row) => row.value) }]
      }
      options={options}
      height={height}
    />
  );
}
