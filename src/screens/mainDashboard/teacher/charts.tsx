'use client';

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import AllInfoCalendar from '../admin/Components/AllInfoCalendar';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

const MONTH_OPTIONS = [
  { value: 'apr', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'jun', label: 'June' },
  { value: 'jul', label: 'July' },
  { value: 'aug', label: 'August' },
  { value: 'sep', label: 'September' },
  { value: 'oct', label: 'October' },
  { value: 'nov', label: 'November' },
  { value: 'dec', label: 'December' },
  { value: 'jan', label: 'January' },
  { value: 'feb', label: 'February' },
  { value: 'mar', label: 'March' },
];

// ── Homework Submission Rate (Bar) ─────────────────────────────────────

const HOMEWORK_SUBMISSION_BY_MONTH: Record<string, number[]> = {
  apr: [88, 76, 92, 80, 85, 70],
  may: [90, 78, 88, 82, 87, 74],
  jun: [85, 72, 90, 78, 83, 68],
  jul: [92, 80, 94, 86, 89, 76],
  aug: [87, 74, 91, 83, 86, 71],
  sep: [93, 82, 95, 88, 91, 78],
  oct: [89, 77, 92, 84, 88, 73],
  nov: [86, 75, 89, 81, 85, 70],
  dec: [84, 70, 87, 79, 83, 67],
  jan: [91, 80, 93, 86, 90, 77],
  feb: [93, 83, 96, 89, 92, 80],
  mar: [90, 79, 92, 86, 90, 76],
};

const CLASS_LABELS = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B'];

// ── Chapter Progress by Class/Div (Horizontal Bar) ────────────────────

const SUBJECT_OPTIONS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
];

// class-div labels for chapter progress
const CHAPTER_CLASS_LABELS = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B'];

// % of chapters completed per class for each subject
const CHAPTER_PROGRESS_BY_SUBJECT: Record<string, number[]> = {
  mathematics: [80, 65, 72, 58, 88, 70],
  science: [75, 60, 68, 55, 82, 64],
};

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

// ── Chapter Progress Chart component ──────────────────────────────────

function ChapterProgressChart({ subject }: { subject: string }) {
  const theme = useTheme();
  const data = CHAPTER_PROGRESS_BY_SUBJECT[subject] ?? [];

  // Color each bar: green ≥80, yellow ≥60, red <60
  const barColors = data.map((v) => {
    if (v >= 80) return theme.palette.success.main;
    if (v >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  });

  const chartOptions = useChart({
    chart: { type: 'bar' },
    colors: barColors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: 'right' },
        barHeight: '55%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: '12px', fontWeight: 700 },
      offsetX: 4,
    },
    xaxis: {
      categories: CHAPTER_CLASS_LABELS,
      min: 0,
      max: 100,
      labels: { formatter: (v: number) => `${v}%` },
      title: {
        text: 'Completion %',
        style: { fontSize: '12px', fontWeight: 600 },
      },
    },
    yaxis: { labels: { style: { fontSize: '13px', fontWeight: 600 } } },
    tooltip: { y: { formatter: (v: number) => `${v}% chapters completed` } },
    legend: { show: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  });

  return (
    <>
      <Chart
        type="bar"
        series={[{ data }]}
        options={chartOptions}
        height={Math.max(220, CHAPTER_CLASS_LABELS.length * 48)}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ pl: 1, pr: 2.5 }}
      />
      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ px: 3, pt: 1, pb: 1, justifyContent: 'center' }}>
        {[
          { color: theme.palette.success.main, label: 'On track (≥ 80%)' },
          { color: theme.palette.warning.main, label: 'Moderate (60–79%)' },
          { color: theme.palette.error.main, label: 'Needs attention (< 60%)' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Box component="span" sx={{ fontSize: 11, color: 'text.secondary' }}>
              {item.label}
            </Box>
          </Stack>
        ))}
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

const TeacherCharts = () => {
  const theme = useTheme();
  const [homeworkMonth, setHomeworkMonth] = useState('feb');
  const [chapterSubject, setChapterSubject] = useState('mathematics');

  const homeworkData = HOMEWORK_SUBMISSION_BY_MONTH[homeworkMonth];

  return (
    <Grid container spacing={1}>
      {/* ── Bar Chart – Homework Submission Rate ──────────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Homework Submission Rate',
            'Percentage of students who submitted homework on time per class this month.'
          )}
          subheader="Submission % per class for selected month"
          action={
            <CustomSelect
              label="Month"
              options={MONTH_OPTIONS}
              onChange={(e) => setHomeworkMonth(e as string)}
              value={homeworkMonth}
              formControlProps={{ sx: { minWidth: '120px' } }}
            />
          }
        >
          <AnalyticsWebsiteVisits
            title=""
            chart={{
              categories: CLASS_LABELS,
              series: [
                {
                  name: 'Submission',
                  data: homeworkData,
                },
              ],
              options: {
                chart: { type: 'bar' },
                plotOptions: {
                  bar: {
                    columnWidth: '40%',
                    borderRadius: 4,
                    distributed: true,
                  },
                },
                colors: [
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.success.main,
                  theme.palette.warning.main,
                  theme.palette.error.light,
                  theme.palette.secondary.main,
                ],
                legend: { show: false },
                dataLabels: {
                  enabled: true,
                  formatter: (val: number) => `${val}%`,
                  style: { fontSize: '11px', fontWeight: 600 },
                },
                tooltip: {
                  y: { formatter: (v: number) => `${v}% submitted` },
                },
                yaxis: {
                  min: 50,
                  max: 100,
                  labels: { formatter: (v: number) => `${v}%` },
                },
              },
            }}
            sx={{ boxShadow: 'none' }}
          />
        </DashboardWidgetWrapper>
      </Grid>

      {/* ── Pie Chart – Attendance Distribution ───────────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <AllInfoCalendar />
      </Grid>

      {/* ── Horizontal Bar – Chapter Progress by Class/Div ────────────── */}
      <Grid size={{ xs: 12 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Chapter Progress by Class',
            'Cumulative % of chapters completed per class-division for the selected subject.'
          )}
          subheader="Chapter completion % per class/div"
          action={
            <CustomSelect
              label="Subject"
              options={SUBJECT_OPTIONS}
              onChange={(e) => setChapterSubject(e as string)}
              value={chapterSubject}
              formControlProps={{ sx: { minWidth: '140px' } }}
            />
          }
        >
          <ChapterProgressChart subject={chapterSubject} />
        </DashboardWidgetWrapper>
      </Grid>
    </Grid>
  );
};

export default TeacherCharts;
