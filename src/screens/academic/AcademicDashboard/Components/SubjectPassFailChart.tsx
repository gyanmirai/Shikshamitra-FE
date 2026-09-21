'use client';

import type { AdminAcademicDashboardAnalyticsData } from 'src/redux/academicAPI/academicDashboardApi';

import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import { EmptyContent } from 'src/components/empty-content';

import { ChartContextSummary } from './ChartContextSummary';
import { buildExamResultRows } from './academic-dashboard-chart-data';

type ResultChartData = AdminAcademicDashboardAnalyticsData['subjectPassFailChart'];

export default function SubjectPassFailChart({ chartData }: { chartData: ResultChartData }) {
  const theme = useTheme();
  const resultRows = buildExamResultRows(chartData);
  const hasResults = resultRows.length > 0;
  const chartOptions = useChart({
    chart: { stacked: true, toolbar: { show: false } },
    colors: [theme.palette.success.main, theme.palette.error.main],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '58%' },
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => (value > 0 ? Math.round(value).toLocaleString('en-IN') : ''),
    },
    xaxis: {
      categories: resultRows.map((row) => row.assessment),
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      title: { text: 'Number of students' },
      labels: { formatter: (value: number) => Math.round(value).toLocaleString('en-IN') },
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString('en-IN')} students` },
    },
    legend: { show: true, position: 'top', horizontalAlign: 'left' },
    highcharts: {
      xAxis: {
        labels: {
          style: {
            color: theme.palette.text.secondary,
            fontSize: '12px',
            width: '180px',
            textOverflow: 'ellipsis',
          },
        },
      },
      yAxis: { allowDecimals: false },
      plotOptions: { series: { pointWidth: 22, minPointLength: 2 } },
    },
  });

  return (
    <Card
      sx={{ height: '100%', p: 2, border: (muiTheme) => `1px solid ${muiTheme.palette.divider}` }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1 }}
        title="Exam Results by Assessment"
        subheader="Compare published pass and fail totals for the latest assessments"
      />

      {hasResults ? (
        <>
          <ChartContextSummary
            items={[
              { label: 'Shows', value: 'Passed vs failed' },
              { label: 'Scope', value: 'All classes & divisions' },
              { label: 'Unit', value: 'Students' },
            ]}
          />
          <Box role="img" aria-label="Passed and failed student counts by exam" sx={{ mt: 1 }}>
            <Chart
              type="bar"
              series={[
                { name: 'Passed', data: resultRows.map((row) => row.passed) },
                { name: 'Failed', data: resultRows.map((row) => row.failed) },
              ]}
              options={chartOptions}
              height={Math.max(300, resultRows.length * 52)}
            />
          </Box>
        </>
      ) : (
        <EmptyContent
          filled
          title="No exam results available"
          description="This chart shows student pass and fail totals by assessment. It will appear after marks are published."
          sx={{ minHeight: 300 }}
          slotProps={{ img: { maxWidth: 104 } }}
        />
      )}
    </Card>
  );
}
