'use client';

import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import { useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import AllInfoCalendar from '../admin/Components/AllInfoCalendar';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------
// ── Shared constants ──────────────────────────────────────────────────

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ── 1. Academic Progress Over Time (Line) ─────────────────────────────

const ACADEMIC_PROGRESS_DATA: Record<string, number[]> = {
  'Class 6': [20, 28, 35, 42, 50, 55, 60, 65, 70, 75, 80, 85],
  'Class 7': [18, 25, 33, 40, 48, 54, 59, 63, 68, 73, 78, 83],
  'Class 8': [22, 30, 38, 45, 52, 58, 62, 67, 72, 77, 82, 87],
  'Class 9': [15, 22, 30, 37, 44, 51, 57, 62, 68, 74, 79, 84],
  'Class 10': [10, 18, 26, 34, 42, 49, 55, 61, 67, 73, 78, 83],
};

// ── 2. Subject-wise Average Marks (Grouped Bar) ───────────────────────

const SUBJECTS = ['Maths', 'Science', 'English', 'Social', 'Hindi'];

const SUBJECT_MARKS_BY_CLASS: Record<string, number[]> = {
  all: [76, 80, 74, 78, 85],
  '6': [82, 88, 76, 84, 90],
  '7': [78, 83, 80, 79, 86],
  '8': [85, 80, 74, 81, 88],
  '9': [74, 77, 82, 76, 84],
  '10': [80, 75, 79, 73, 82],
};

// ── 3. Teacher Workload (Horizontal Bar) ──────────────────────────────

const WORKLOAD_DATA = [
  { name: 'Mrs. Sharma', periods: 38, subjects: ['Maths'], classes: ['8A', '9B', '10A', '10B'] },
  { name: 'Mr. Verma', periods: 34, subjects: ['Science'], classes: ['6A', '7B', '8B'] },
  { name: 'Ms. Patel', periods: 28, subjects: ['English'], classes: ['9A', '10B', '11A'] },
  { name: 'Mr. Kulkarni', periods: 20, subjects: ['Social'], classes: ['6B', '7A'] },
  { name: 'Mrs. Mehta', periods: 32, subjects: ['Hindi'], classes: ['9B', '10A', '12A'] },
  { name: 'Mr. Singh', periods: 36, subjects: ['Physics'], classes: ['11A', '11B', '12A'] },
];

const MODERATE_THRESHOLD = 30;
const HEAVY_THRESHOLD = 36;

// ── 6. Student Strength Trend (Line) ─────────────────────────────────

const STRENGTH_YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const STRENGTH_TREND = [1850, 1920, 1980, 2100, 2250, 2380, 2450];

// ── 7. Leave / Discipline Distribution (Pie) ─────────────────────────

// (Composed inside PrincipalCharts below using AppCurrentDownload)

// ----------------------------------------------------------------------

const renderTitleWithTooltip = (title: string, tooltip: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltip} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

const PrincipalCharts = () => {
  const theme = useTheme();

  // Academic Progress filter
  const [selectedBoardMedium, setSelectedBoardMedium] = useState<BoardMediumOption | undefined>(
    undefined
  );
  const handleBoardMediumChange = useCallback((val: BoardMediumOption) => {
    setSelectedBoardMedium(val);
  }, []);

  // Subject-wise Marks filter
  const [selectedClass, setSelectedClass] = useState('all');

  // ── Workload chart ────────────────────────────────────────────────
  const sortedWorkload = [...WORKLOAD_DATA].sort((a, b) => b.periods - a.periods);
  const workloadColors = sortedWorkload.map((t) => {
    if (t.periods >= HEAVY_THRESHOLD) return theme.palette.error.main;
    if (t.periods >= MODERATE_THRESHOLD) return theme.palette.warning.main;
    return theme.palette.success.main;
  });

  const workloadChartOptions = useChart({
    chart: { type: 'bar' },
    colors: workloadColors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: 'right' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val} periods`,
      style: { fontSize: '11px', fontWeight: 600 },
      offsetX: 4,
    },
    tooltip: {
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const t = sortedWorkload[dataPointIndex];
        return `<div style="padding:10px 14px;font-size:13px;line-height:1.6;">
                    <strong>${t.name}</strong><br/>
                    <span>Total Periods: <b>${t.periods}</b></span><br/>
                    <span>Subjects: ${t.subjects?.join(', ') || '—'}</span><br/>
                    <span>Classes: ${t.classes?.join(', ') || '—'}</span>
                </div>`;
      },
    },
    xaxis: {
      categories: sortedWorkload.map((t) => t.name),
      min: 0,
      max: 42,
      title: { text: 'Periods per Week', style: { fontSize: '12px', fontWeight: 600 } },
    },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    legend: { show: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  });

  // ── Subject-wise marks grouped bar ────────────────────────────────
  const subjectMarksOptions = useChart({
    chart: { type: 'bar' },
    colors: [theme.palette.primary.main],
    plotOptions: {
      bar: {
        columnWidth: '48%',
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: '11px', fontWeight: 600 },
    },
    xaxis: {
      categories: SUBJECTS,
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: {
      min: 50,
      max: 100,
      labels: { formatter: (val: number) => `${val}%` },
      title: { text: 'Average Score %', style: { fontSize: '12px', fontWeight: 600 } },
    },
    tooltip: { y: { formatter: (val: number) => `${val}%` } },
    legend: { show: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
  });

  return (
    <Grid container spacing={1}>
      {/* ── Row 1: Academic Insights ─────────────────────────── */}

      {/* Line – Academic Progress Over Time */}
      <Grid size={{ xs: 12 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Academic Progress Over Time',
            'Monthly curriculum completion percentage per class, tracked through the academic year.'
          )}
          subheader="Curriculum completion % by class per month"
          action={
            <BoardMediumDropdown value={selectedBoardMedium} onChange={handleBoardMediumChange} />
          }
        >
          <AnalyticsWebsiteVisits
            title=""
            chart={{
              categories: MONTHS,
              series: Object.entries(ACADEMIC_PROGRESS_DATA).map(([name, data]) => ({
                name,
                data,
              })),
              options: {
                tooltip: { y: { formatter: (v: number) => `${v}%` } },
                yaxis: {
                  min: 0,
                  max: 100,
                  labels: { formatter: (v: number) => `${v}%` },
                },
              },
            }}
            sx={{ boxShadow: 'none' }}
          />
        </DashboardWidgetWrapper>
      </Grid>

      {/* ── Row 2: Subject Marks + Teacher Workload ──────────── */}

      {/* Grouped Bar – Subject-wise Average Marks */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Subject-wise Average Marks',
            'Average percentage scored per subject across the selected class.'
          )}
          subheader="Average score % per subject"
        >
          <Chart
            type="bar"
            series={[
              {
                name: 'Avg Score',
                data: SUBJECT_MARKS_BY_CLASS[selectedClass] ?? SUBJECT_MARKS_BY_CLASS.all,
              },
            ]}
            options={subjectMarksOptions}
            height={260}
            loadingProps={{ sx: { p: 2.5 } }}
            sx={{ pl: 1, pr: 2.5 }}
          />
        </DashboardWidgetWrapper>
      </Grid>

      {/* Horizontal Bar – Teacher Workload */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Teacher Workload Distribution',
            'Number of timetable periods assigned per teacher each week. Red = heavy overload, yellow = moderate.'
          )}
          subheader="Weekly timetable periods per teacher"
        >
          <Chart
            type="bar"
            series={[{ data: sortedWorkload.map((t) => t.periods) }]}
            options={workloadChartOptions}
            height={Math.max(260, sortedWorkload.length * 46)}
            loadingProps={{ sx: { p: 2.5 } }}
            sx={{ pl: 1, pr: 2.5 }}
          />
          {/* Legend */}
          <Stack direction="row" spacing={2} sx={{ px: 3, pt: 1, pb: 2, justifyContent: 'center' }}>
            {[
              { color: theme.palette.success.main, label: 'Normal (< 30)' },
              { color: theme.palette.warning.main, label: 'Moderate (30–35)' },
              { color: theme.palette.error.main, label: 'Heavy Overload (≥ 36)' },
            ].map((item) => (
              <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Box component="span" sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {item.label}
                </Box>
              </Stack>
            ))}
          </Stack>
        </DashboardWidgetWrapper>
      </Grid>

      {/* Line – Student Strength Trend */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Student Strength Trend',
            'Year-on-year total enrolled student count, showing school growth over time.'
          )}
          subheader="Year-on-year enrolled student count"
        >
          <AnalyticsWebsiteVisits
            title=""
            chart={{
              categories: STRENGTH_YEARS,
              series: [{ name: 'Total Students', data: STRENGTH_TREND }],
              options: {
                yaxis: {
                  min: 1600,
                  labels: { formatter: (v: number) => `${v}` },
                },
                tooltip: { y: { formatter: (v: number) => `${v} students` } },
              },
            }}
            sx={{ boxShadow: 'none' }}
          />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AllInfoCalendar />
      </Grid>
    </Grid>
  );
};

export default PrincipalCharts;
