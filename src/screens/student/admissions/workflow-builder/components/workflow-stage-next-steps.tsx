import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Alert, Stack, Typography } from '@mui/material';

import { getTransitionSummary } from '../../workflow-builder-utils';

export function WorkflowStageNextSteps({
  stage,
  stages,
  transitions = [],
}: {
  stage: AdmissionWorkflowStage;
  stages: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
}) {
  const paths = transitions
    .filter((route) => route.fromStageId === stage.id)
    .sort((a, b) => Number(a.isDefault) - Number(b.isDefault) || a.priority - b.priority);
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">What happens after this stage?</Typography>
      {stage.isTerminalStage ? (
        <Typography variant="body2">
          The configured journey ends here after this stage completes.
        </Typography>
      ) : paths.length ? (
        paths.map((path) => (
          <Typography key={path.id} variant="body2">
            {getTransitionSummary(path)} →{' '}
            {stages.find((item) => item.id === path.toStageId)?.name ?? 'Destination unavailable'}
          </Typography>
        ))
      ) : (
        <Alert severity="info">Choose the next step on the workflow map before publishing.</Alert>
      )}
      <Typography variant="caption" color="text.secondary">
        Next steps run only after this stage meets its completion requirements. Edit paths on the
        workflow map.
      </Typography>
    </Stack>
  );
}
