import type { AdmissionWorkflowUsage } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';

import { formatWorkflowDateTime } from '../../workflow-list/workflow-list-format';

type Analytics = NonNullable<AdmissionWorkflowUsage['runtimeAnalytics']>;

const formatHours = (hours?: number | null) => {
  if (hours === null || hours === undefined) return 'Not available yet';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${hours.toFixed(1)} hr`;
  return `${(hours / 24).toFixed(1)} days`;
};

export function WorkflowRuntimeAnalytics({ analytics }: { analytics?: Analytics }) {
  if (!analytics || analytics.startedCount === 0) {
    return (
      <StudentFeedback notificationKey="STU-0575" presentation="inline" severity="info">
        Stage performance appears after applications start using this workflow version.
      </StudentFeedback>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Runtime performance</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        <Metric label="Started" value={analytics.startedCount} />
        <Metric label="In progress" value={analytics.activeCount} />
        <Metric label="Completed" value={analytics.completedCount} />
        <Metric label="Completion" value={`${analytics.completionRatePercent}%`} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Average journey time: {formatHours(analytics.averageCompletionHours)}
      </Typography>
      <Typography variant="subtitle2">Stage throughput</Typography>
      {analytics.stages.map((stage) => (
        <Card key={stage.definitionStageId} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {stage.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stage.code} · {stage.enteredCount} entered
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {stage.completionRatePercent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, stage.completionRatePercent))}
              aria-label={`${stage.name} completion rate`}
            />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                {stage.activeCount} active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stage.completedCount} completed
              </Typography>
              {stage.skippedCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {stage.skippedCount} skipped
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Average stage time: {formatHours(stage.averageDurationHours)}
            </Typography>
            {stage.oldestActiveEnteredAt && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="mdi:clock-alert-outline" color="warning.main" width={16} />
                <Typography variant="caption" color="text.secondary">
                  Oldest active since {formatWorkflowDateTime(stage.oldestActiveEnteredAt)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="outlined" sx={{ p: 1.25 }}>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
}
