'use client';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';
import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

import type { IExamAnalyticsStats } from '../type';

type Props = {
  open: boolean;
  onClose: () => void;
  stats: IExamAnalyticsStats | null;
  allMarksAssigned: boolean;
  workflowStatus: GradeEntryWorkflowStatus;
};

export function GradeEntryInsights({
  open,
  onClose,
  stats,
  allMarksAssigned,
  workflowStatus,
}: Props) {
  const total = stats?.totalCount ?? 0;
  const pending = stats?.pendingCount ?? 0;
  const metrics = [
    {
      id: 'total',
      label: 'Total students',
      value: total,
      icon: 'solar:user-bold',
      tone: 'primary' as const,
    },
    {
      id: 'graded',
      label: 'Graded',
      value: total - pending,
      icon: 'solar:check-square-bold',
      tone: 'success' as const,
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pending,
      icon: 'solar:clock-circle-bold',
      tone: 'warning' as const,
    },
    {
      id: 'highest',
      label: 'Highest marks',
      value: stats?.highestMarks ?? 0,
      icon: 'solar:arrow-up-bold',
      tone: 'success' as const,
    },
    {
      id: 'lowest',
      label: 'Lowest marks',
      value: stats?.lowestMarks ?? 0,
      icon: 'solar:arrow-down-bold',
      tone: 'error' as const,
    },
    {
      id: 'average',
      label: 'Average marks',
      value: stats?.averageMarks ?? 0,
      icon: 'solar:graph-new-bold',
      tone: 'info' as const,
    },
  ];
  const readiness = [
    { label: 'All Students Graded', done: allMarksAssigned },
    { label: 'Verification Complete', done: workflowStatus >= GradeEntryWorkflowStatus.Verified },
    { label: 'No Missing Marks', done: stats !== null && pending === 0 },
    {
      label: 'Ready For Result Generation',
      done: allMarksAssigned && workflowStatus >= GradeEntryWorkflowStatus.Published,
    },
  ];

  return (
    <AcademicInsights
      title="Grade entry insights"
      description="Marks and result readiness for the selected exam, subject and class."
      open={open}
      onClose={onClose}
      hideTrigger
      metrics={metrics}
      chart={{
        title: 'Grade distribution / Pass vs Fail',
        description: 'Pass and fail count for the selected exam, subject and class.',
        categories: ['Pass', 'Fail'],
        values: [stats?.passCount ?? 0, stats?.failCount ?? 0],
        seriesName: 'Students',
        summary: [
          { label: 'Pass', value: stats?.passCount ?? 0 },
          { label: 'Fail', value: stats?.failCount ?? 0 },
          { label: 'Pending', value: pending },
        ],
        emptyMessage: 'No graded data yet',
      }}
      afterChart={
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Result readiness
          </Typography>
          <Grid container spacing={1}>
            {readiness.map((check) => (
              <Grid size={{ xs: 12, sm: 6 }} key={check.label}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      check.done
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.grey[500], 0.06),
                  }}
                >
                  <Iconify
                    icon={check.done ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={14}
                    sx={{ color: check.done ? 'success.main' : 'text.disabled', flexShrink: 0 }}
                  />
                  <Typography
                    variant="caption"
                    color={check.done ? 'text.primary' : 'text.disabled'}
                  >
                    {check.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      }
    />
  );
}
