import { Iconify } from 'src/components/iconify';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';
import { Box, Grid, Stack, Divider, Skeleton, Typography } from '@mui/material';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import { GradeEntryPassFailDistribution } from './GradeEntryPassFailDistribution';

import type { IExamAnalyticsStats } from '../type';

interface GradeEntrySummaryDetailsProps {
  stats: IExamAnalyticsStats | null;
  allMarksAssigned: boolean;
  workflowStatus: GradeEntryWorkflowStatus;
}

export function GradeEntrySummaryDetails({
  stats,
  allMarksAssigned,
  workflowStatus,
}: GradeEntrySummaryDetailsProps) {
  if (!stats)
    return <Skeleton variant="rounded" height={140} aria-label="Loading grade entry summary" />;

  const checks = [
    { label: 'All Students Graded', done: allMarksAssigned },
    { label: 'Verification Complete', done: workflowStatus >= GradeEntryWorkflowStatus.Verified },
    { label: 'No Missing Marks', done: stats.pendingCount === 0 },
    {
      label: 'Ready For Result Generation',
      done: allMarksAssigned && workflowStatus >= GradeEntryWorkflowStatus.Published,
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <TimetableSettingsSummaryCards
          tone="neutral"
          cardsPerRow={3}
          cards={[
            { label: 'Total Students', value: stats.totalCount, icon: 'solar:user-bold' },
            {
              label: 'Graded',
              value: stats.totalCount - stats.pendingCount,
              icon: 'solar:check-square-bold',
            },
            { label: 'Pending', value: stats.pendingCount, icon: 'solar:clock-circle-bold' },
            { label: 'Highest Marks', value: stats.highestMarks, icon: 'solar:arrow-up-bold' },
            { label: 'Lowest Marks', value: stats.lowestMarks, icon: 'solar:arrow-down-bold' },
            { label: 'Average Marks', value: stats.averageMarks, icon: 'solar:graph-new-bold' },
          ]}
        />
      </Grid>
      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{ borderLeft: { md: 1 }, borderColor: { md: 'divider' }, pl: { md: 2 } }}
      >
        <Stack spacing={1.25}>
          <GradeEntryPassFailDistribution
            passCount={stats.passCount}
            failCount={stats.failCount}
            passPercentage={stats.passPercentage}
            failPercentage={stats.failPercentage}
          />
          <Divider />
          <Typography variant="overline" color="text.secondary">
            Result Readiness
          </Typography>
          <Grid container spacing={1}>
            {checks.map((check) => (
              <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }} key={check.label}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Iconify
                    icon={check.done ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
                    width={16}
                    sx={{ color: check.done ? 'success.main' : 'warning.main', flexShrink: 0 }}
                  />
                  <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
                    {check.label}
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        width: 1,
                        height: 1,
                        overflow: 'hidden',
                        clipPath: 'inset(50%)',
                      }}
                    >
                      {check.done ? ': complete' : ': pending'}
                    </Box>
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}
