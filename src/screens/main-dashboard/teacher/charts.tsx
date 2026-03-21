'use client';

import type { RootState } from 'src/redux/store';
import type { BoardMediumStageOption } from 'src/components/board-medium-stage-dropdown';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useCallback } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import BoardMediumStageDropdown from 'src/components/board-medium-stage-dropdown';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import AllInfoCalendar from '../admin/components/AllInfoCalendar';
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
// Keyed by month → class-number → submission %
const HOMEWORK_SUBMISSION_BY_MONTH: Record<string, Record<string, number>> = {
  apr: {
    '1': 90,
    '2': 88,
    '3': 87,
    '4': 85,
    '5': 84,
    '6': 83,
    '7': 81,
    '8': 85,
    '9': 83,
    '10': 88,
    '11': 78,
    '12': 74,
  },
  may: {
    '1': 92,
    '2': 90,
    '3': 89,
    '4': 87,
    '5': 86,
    '6': 85,
    '7': 83,
    '8': 87,
    '9': 85,
    '10': 90,
    '11': 80,
    '12': 76,
  },
  jun: {
    '1': 88,
    '2': 86,
    '3': 85,
    '4': 83,
    '5': 82,
    '6': 80,
    '7': 78,
    '8': 83,
    '9': 80,
    '10': 85,
    '11': 75,
    '12': 70,
  },
  jul: {
    '1': 93,
    '2': 91,
    '3': 90,
    '4': 88,
    '5': 87,
    '6': 86,
    '7': 84,
    '8': 89,
    '9': 87,
    '10': 92,
    '11': 83,
    '12': 79,
  },
  aug: {
    '1': 90,
    '2': 88,
    '3': 87,
    '4': 85,
    '5': 84,
    '6': 82,
    '7': 80,
    '8': 86,
    '9': 84,
    '10': 89,
    '11': 79,
    '12': 75,
  },
  sep: {
    '1': 94,
    '2': 92,
    '3': 91,
    '4': 89,
    '5': 88,
    '6': 87,
    '7': 85,
    '8': 91,
    '9': 89,
    '10': 93,
    '11': 85,
    '12': 81,
  },
  oct: {
    '1': 91,
    '2': 89,
    '3': 88,
    '4': 86,
    '5': 85,
    '6': 84,
    '7': 82,
    '8': 88,
    '9': 86,
    '10': 90,
    '11': 81,
    '12': 77,
  },
  nov: {
    '1': 89,
    '2': 87,
    '3': 86,
    '4': 84,
    '5': 83,
    '6': 81,
    '7': 79,
    '8': 85,
    '9': 83,
    '10': 87,
    '11': 78,
    '12': 74,
  },
  dec: {
    '1': 86,
    '2': 84,
    '3': 83,
    '4': 81,
    '5': 80,
    '6': 78,
    '7': 76,
    '8': 83,
    '9': 81,
    '10': 84,
    '11': 75,
    '12': 71,
  },
  jan: {
    '1': 92,
    '2': 90,
    '3': 89,
    '4': 87,
    '5': 86,
    '6': 85,
    '7': 83,
    '8': 90,
    '9': 88,
    '10': 91,
    '11': 82,
    '12': 78,
  },
  feb: {
    '1': 94,
    '2': 92,
    '3': 91,
    '4': 89,
    '5': 88,
    '6': 87,
    '7': 85,
    '8': 92,
    '9': 90,
    '10': 93,
    '11': 84,
    '12': 80,
  },
  mar: {
    '1': 91,
    '2': 89,
    '3': 88,
    '4': 86,
    '5': 85,
    '6': 84,
    '7': 82,
    '8': 90,
    '9': 88,
    '10': 90,
    '11': 81,
    '12': 77,
  },
};

const DEFAULT_CLASS_LABELS = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const DEFAULT_CLASS_KEYS = ['8', '9', '10', '11', '12'];

// ── Chapter Progress by Class (Horizontal Bar) ────────────────────────

const SUBJECT_OPTIONS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
];

// % of chapters completed per class-number for each subject
const CHAPTER_PROGRESS_BY_SUBJECT: Record<string, Record<string, number>> = {
  mathematics: {
    '1': 92,
    '2': 90,
    '3': 88,
    '4': 85,
    '5': 83,
    '6': 80,
    '7': 75,
    '8': 88,
    '9': 72,
    '10': 80,
    '11': 65,
    '12': 58,
  },
  science: {
    '1': 88,
    '2': 86,
    '3': 84,
    '4': 82,
    '5': 80,
    '6': 75,
    '7': 70,
    '8': 82,
    '9': 68,
    '10': 75,
    '11': 60,
    '12': 55,
  },
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

function ChapterProgressChart({
  subject,
  classLabels,
  classKeys,
}: {
  subject: string;
  classLabels: string[];
  classKeys: string[];
}) {
  const theme = useTheme();
  const subjectData = CHAPTER_PROGRESS_BY_SUBJECT[subject] ?? {};
  const data = classKeys.map((k) => subjectData[k] ?? 0);

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
      categories: classLabels,
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
        height={Math.max(220, classLabels.length * 48)}
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [homeworkMonth, setHomeworkMonth] = useState('feb');
  const [chapterSubject, setChapterSubject] = useState('mathematics');

  // Board/Medium/Stage filters
  const [homeworkBoardMediumStage, setHomeworkBoardMediumStage] = useState<
    BoardMediumStageOption | undefined
  >(undefined);
  const handleHomeworkBMSChange = useCallback((val: BoardMediumStageOption) => {
    setHomeworkBoardMediumStage(val);
  }, []);

  const [chapterBoardMediumStage, setChapterBoardMediumStage] = useState<
    BoardMediumStageOption | undefined
  >(undefined);
  const handleChapterBMSChange = useCallback((val: BoardMediumStageOption) => {
    setChapterBoardMediumStage(val);
  }, []);

  // Derive class labels & keys from selected stage (no division suffix)
  const getClassLabelsAndKeys = useCallback(
    (selected: BoardMediumStageOption | undefined): { labels: string[]; keys: string[] } => {
      if (!selected || !currentYear?.boards?.length) {
        return { labels: DEFAULT_CLASS_LABELS, keys: DEFAULT_CLASS_KEYS };
      }
      const { boardId, mediumId, stageId } = selected;
      const board = (currentYear.boards as any[]).find((b) => b.id === boardId);
      const medium = (board?.educationMediums ?? []).find((m: any) => m.id === mediumId);
      const stage = (medium?.educationMediumStages ?? []).find((s: any) => s.id === stageId);
      const standards: any[] = stage?.standards ?? [];
      if (!standards.length) return { labels: DEFAULT_CLASS_LABELS, keys: DEFAULT_CLASS_KEYS };
      return {
        labels: standards.map((s) => s.name),
        keys: standards.map((s) => String(s.name).replace(/[^0-9]/g, '')),
      };
    },
    [currentYear]
  );

  const { labels: homeworkClassLabels, keys: homeworkClassKeys } = useMemo(
    () => getClassLabelsAndKeys(homeworkBoardMediumStage),
    [homeworkBoardMediumStage, getClassLabelsAndKeys]
  );

  const { labels: chapterClassLabels, keys: chapterClassKeys } = useMemo(
    () => getClassLabelsAndKeys(chapterBoardMediumStage),
    [chapterBoardMediumStage, getClassLabelsAndKeys]
  );

  // Build homework bar data for selected month + selected classes
  const homeworkData = useMemo(() => {
    const monthData = HOMEWORK_SUBMISSION_BY_MONTH[homeworkMonth] ?? {};
    return homeworkClassKeys.map((k) => monthData[k] ?? 0);
  }, [homeworkMonth, homeworkClassKeys]);

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
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <BoardMediumStageDropdown
                value={homeworkBoardMediumStage}
                onChange={handleHomeworkBMSChange}
              />
              <CustomSelect
                label="Month"
                options={MONTH_OPTIONS}
                onChange={(e) => setHomeworkMonth(e as string)}
                value={homeworkMonth}
                formControlProps={{ sx: { minWidth: '130px' } }}
              />
            </Stack>
          }
        >
          <AnalyticsWebsiteVisits
            title=""
            chart={{
              categories: homeworkClassLabels,
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
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <BoardMediumStageDropdown
                value={chapterBoardMediumStage}
                onChange={handleChapterBMSChange}
              />
              <CustomSelect
                label="Subject"
                options={SUBJECT_OPTIONS}
                onChange={(e) => setChapterSubject(e as string)}
                value={chapterSubject}
                formControlProps={{ sx: { minWidth: '140px' } }}
              />
            </Stack>
          }
        >
          <ChapterProgressChart
            subject={chapterSubject}
            classLabels={chapterClassLabels}
            classKeys={chapterClassKeys}
          />
        </DashboardWidgetWrapper>
      </Grid>
    </Grid>
  );
};

export default TeacherCharts;
