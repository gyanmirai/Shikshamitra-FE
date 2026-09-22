import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Alert, Stack, Typography, CardActionArea } from '@mui/material';

import { buildWorkflowJourneyLevels } from '../workflow-journey-levels';

type Props = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  onEditStage: (stage: AdmissionWorkflowStage) => void;
};

export function WorkflowJourneyMap({ stages, transitions, readOnly, onEditStage }: Props) {
  if (stages.length === 0) {
    return <Alert severity="info">Add a stage to build the journey map.</Alert>;
  }

  const levels = buildWorkflowJourneyLevels(stages, transitions);
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Applicant journey map
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Columns follow the entry stage and configured routes. Select a stage to{' '}
          {readOnly ? 'view' : 'edit'} it.
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 'max-content' }}>
        {levels.map((level, levelIndex) => (
          <Stack key={level.depth ?? 'unreachable'} direction="row" spacing={2} alignItems="center">
            <Stack spacing={1} sx={{ width: 280 }}>
              <Typography
                variant="overline"
                color={level.depth === null ? 'warning.main' : 'text.secondary'}
              >
                {level.depth === null
                  ? 'Not connected'
                  : level.depth === 0
                    ? 'Journey starts'
                    : `Route level ${level.depth}`}
              </Typography>
              {level.stages.map((stage) => {
                const outgoing = transitions
                  .filter((transition) => transition.fromStageId === stage.id)
                  .sort((left, right) => left.priority - right.priority);
                return (
                  <Card
                    key={stage.id}
                    variant="outlined"
                    sx={{ borderColor: level.depth === null ? 'warning.main' : 'divider' }}
                  >
                    <CardActionArea
                      onClick={() => onEditStage(stage)}
                      aria-label={`${readOnly ? 'View' : 'Edit'} ${stage.name}`}
                      sx={{ p: 1.5 }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Iconify
                            icon={
                              stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:circle-slice-8'
                            }
                            color={stage.isTerminalStage ? 'success.main' : 'primary.main'}
                          />
                          <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                            {stage.name}
                          </Typography>
                          {stage.isEntryStage && <Chip size="small" color="info" label="Entry" />}
                          {stage.isTerminalStage && (
                            <Chip size="small" color="success" label="Terminal" />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {stage.code}
                          {stage.isRequired ? ' · Required' : ''}
                        </Typography>
                        {outgoing.map((transition) => (
                          <Stack
                            key={transition.id}
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Iconify icon="mdi:source-branch" width={16} color="text.secondary" />
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                              {transition.isDefault ? 'Otherwise' : 'When condition matches'}
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {stageById.get(transition.toStageId)?.name ?? 'Missing stage'}
                            </Typography>
                          </Stack>
                        ))}
                        {!stage.isTerminalStage && outgoing.length === 0 && (
                          <Typography variant="caption" color="warning.main">
                            No onward route
                          </Typography>
                        )}
                      </Stack>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
            {levelIndex < levels.length - 1 && (
              <Iconify icon="mdi:arrow-right" width={24} color="text.disabled" />
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
