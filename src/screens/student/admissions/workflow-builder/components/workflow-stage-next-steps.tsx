import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Button, Typography } from '@mui/material';

import { getTransitionSummary } from '../../workflow-builder-utils';

type Props = {
  stage: AdmissionWorkflowStage;
  stages: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
  readOnly?: boolean;
  routeEditingDisabled?: boolean;
  onAddPath?: (stage: AdmissionWorkflowStage) => void;
  onEditPath?: (transition: AdmissionWorkflowTransition) => void;
};

export function WorkflowStageNextSteps({
  stage,
  stages,
  transitions = [],
  readOnly = false,
  routeEditingDisabled = false,
  onAddPath,
  onEditPath,
}: Props) {
  const paths = transitions
    .filter((route) => route.fromStageId === stage.id)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.priority - b.priority);
  const routeAction = (label: string, onClick: () => void) => (
    <CustomTooltip
      title={routeEditingDisabled ? 'Apply the stage changes before editing its paths.' : label}
      arrow
    >
      <Box component="span" sx={{ flexShrink: 0 }}>
        <Button size="small" variant="outlined" disabled={routeEditingDisabled} onClick={onClick}>
          {label}
        </Button>
      </Box>
    </CustomTooltip>
  );
  if (stage.isTerminalStage)
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="mdi:flag-checkered" width={18} sx={{ color: 'text.secondary' }} />
        <Typography variant="body2">End of journey</Typography>
      </Stack>
    );
  return (
    <Stack spacing={1.5}>
      {paths.length ? (
        paths.map((path) => (
          <Stack
            key={path.id}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {getTransitionSummary(path)}
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {stages.find((item) => item.id === path.toStageId)?.name ??
                  'Destination unavailable'}
              </Typography>
            </Box>
            {!readOnly && onEditPath && routeAction('Change', () => onEditPath(path))}
          </Stack>
        ))
      ) : (
        <Typography variant="body2" color={readOnly ? 'text.secondary' : 'warning.main'}>
          No next step configured.
        </Typography>
      )}
      {!readOnly &&
        onAddPath &&
        routeAction(
          paths.some((path) => path.isDefault) ? 'Add special outcome' : 'Choose next step',
          () => onAddPath(stage)
        )}
    </Stack>
  );
}
