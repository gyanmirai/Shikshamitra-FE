import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

export function renderPipelineStep(row: AdmissionPipelineItem) {
  const stages = row.stageProgress ?? [];
  const current = stages.findIndex((stage) => stage.id === row.currentStageInstanceId);
  const name = row.currentStageName || 'No current step';
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, maxWidth: 280 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="body2" noWrap title={name} sx={{ minWidth: 0 }}>
          {name}
        </Typography>
        {current >= 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {current + 1} of {stages.length}
          </Typography>
        )}
      </Stack>
      {current >= 0 && (
        <Box role="group" aria-label="Admission stages" sx={{ display: 'flex', gap: 0.5 }}>
          <Box
            role="progressbar"
            aria-label="Admission journey"
            aria-valuemin={1}
            aria-valuemax={stages.length}
            aria-valuenow={current + 1}
            aria-valuetext={`Step ${current + 1} of ${stages.length}: ${name}`}
            sx={{
              border: 0,
              margin: -1,
              padding: 0,
              width: '1px',
              height: '1px',
              overflow: 'hidden',
              position: 'absolute',
              whiteSpace: 'nowrap',
              clip: 'rect(0 0 0 0)',
            }}
          />
          {stages.map((stage, index) => (
            <CustomTooltip key={stage.id} title={stage.name} arrow describeChild>
              <Box
                component="span"
                role="img"
                tabIndex={0}
                aria-label={`${stage.name}: ${['Pending', 'Active', 'Completed', 'Skipped', 'Failed', 'Cancelled'][stage.status] ?? 'Unavailable'}`}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 1,
                    height: 4,
                    borderRadius: 1,
                    bgcolor:
                      index === current
                        ? 'info.main'
                        : stage.status === 2
                          ? 'success.main'
                          : stage.status === 3
                            ? 'warning.main'
                            : stage.status === 4
                              ? 'error.main'
                              : 'action.disabledBackground',
                  }}
                />
              </Box>
            </CustomTooltip>
          ))}
        </Box>
      )}
    </Stack>
  );
}

export function renderPipelineFollowUps(row: AdmissionPipelineItem) {
  if (row.inquiryId === null || !row.openFollowUpCount) {
    return (
      <Typography variant="body2" color="text.secondary" noWrap>
        {row.inquiryId === null ? 'No inquiry follow-ups' : 'No open follow-ups'}
      </Typography>
    );
  }
  // Older servers expose only a boolean; never label every open follow-up as overdue.
  const overdue = row.overdueFollowUpCount;
  const badge = row.hasOverdueFollowUp
    ? overdue && overdue > 0
      ? `${overdue} overdue`
      : 'Overdue'
    : `${row.openFollowUpCount} open`;
  const purpose = row.nextFollowUpPurpose?.trim() || 'Follow up with family';
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Label color={row.hasOverdueFollowUp ? 'warning' : 'default'} sx={{ flexShrink: 0 }}>
        {badge}
      </Label>
      <CustomTooltip title={purpose}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0, maxWidth: 170 }}>
          {purpose}
        </Typography>
      </CustomTooltip>
    </Stack>
  );
}

export function pipelineActionLabel(row: AdmissionPipelineItem) {
  switch (row.stageType) {
    case 0:
      return 'Review inquiry';
    case 1:
      return 'Complete form';
    case 2:
      return 'Book assessment';
    case 4:
      return 'Collect fees';
    case 5:
      return 'Verify documents';
    case 7:
      return 'Review admission';
    case 12:
      return 'Appointment';
    default:
      return 'Continue';
  }
}
