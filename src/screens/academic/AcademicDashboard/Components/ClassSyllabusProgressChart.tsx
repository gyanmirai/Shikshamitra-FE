'use client';

import type { AdminAcademicDashboardAnalyticsData } from 'src/redux/academicAPI/academicDashboardApi';

import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';
import { EmptyContent } from 'src/components/empty-content';

import { ChartContextSummary } from './ChartContextSummary';
import { buildClassProgressRows } from './academic-dashboard-chart-data';

type ClassProgressData = AdminAcademicDashboardAnalyticsData['classSyllabusProgressChart'];

export default function ClassSyllabusProgressChart({
  chartData,
}: {
  chartData: ClassProgressData;
}) {
  const theme = useTheme();
  const progressRows = buildClassProgressRows(chartData);
  const hasProgress = progressRows.some((row) => row.completion > 0);
  const chartOptions = useChart({
    chart: { toolbar: { show: false } },
    colors: [theme.palette.info.main],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '58%',
        dataLabels: { position: 'center' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => `${Math.round(value)}%`,
    },
    xaxis: {
      categories: progressRows.map((row) => row.classDivision),
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      title: { text: 'Average completion' },
      labels: { formatter: (value: number) => `${Math.round(value)}%` },
    },
    tooltip: { y: { formatter: (value: number) => `${Math.round(value)}% complete` } },
    legend: { show: false },
    highcharts: {
      xAxis: {
        labels: {
          style: {
            color: theme.palette.text.secondary,
            fontSize: '12px',
            width: '150px',
            textOverflow: 'ellipsis',
          },
        },
      },
      yAxis: { tickPositions: [0, 25, 50, 75, 100] },
      plotOptions: { series: { pointWidth: 22 } },
    },
  });

  return (
    <Card
      sx={{ height: '100%', p: 2, border: (muiTheme) => `1px solid ${muiTheme.palette.divider}` }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1 }}
        title="Syllabus Progress by Class"
        subheader="Compare recorded chapter completion for each class and division"
      />

      {hasProgress ? (
        <>
          <ChartContextSummary
            items={[
              { label: 'Each row', value: 'Class + division' },
              { label: 'Measure', value: 'Avg. chapters completed' },
              { label: 'Unit', value: 'Percentage' },
            ]}
          />
          <Box role="img" aria-label="Class-wise syllabus completion percentages" sx={{ mt: 1 }}>
            <Chart
              type="bar"
              series={[{ name: 'Completed', data: progressRows.map((row) => row.completion) }]}
              options={chartOptions}
              height={Math.max(300, progressRows.length * 44)}
            />
          </Box>
        </>
      ) : (
        <EmptyContent
          filled
          title="No class progress recorded"
          description={
            progressRows.length > 0
              ? `No syllabus completion has been recorded for the ${progressRows.length} configured classes and divisions in this academic context.`
              : 'Class and division progress will appear after teachers begin updating chapter completion.'
          }
          sx={{ minHeight: 300 }}
          slotProps={{ img: { maxWidth: 104 } }}
        />
      )}
    </Card>
  );
}
