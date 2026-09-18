import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Chip, Stack, Button, IconButton, Typography } from '@mui/material';

import {
  getTransitionLabel,
  getTransitionStepLabel,
  orderTransitionsByJourney,
} from '../../workflow-builder-utils';

type Props = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  onAdd: () => void;
  onEdit: (transition: AdmissionWorkflowTransition) => void;
  onDelete: (transitionId: string) => void;
};

export function WorkflowTransitionList({
  stages,
  transitions,
  readOnly,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const orderedTransitions = orderTransitionsByJourney(transitions, stages);
  return (
    <Stack
      component="section"
      aria-labelledby="workflow-transitions-heading"
      sx={{ p: 2, minHeight: 0, overflowY: 'auto' }}
      spacing={1.25}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography id="workflow-transitions-heading" variant="subtitle1" fontWeight={700}>
            Transitions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Add a default route or controlled condition from each non-terminal stage.
          </Typography>
        </Box>
        {!readOnly && transitions.length > 0 && (
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:source-branch-plus" />}
            onClick={onAdd}
            disabled={stages.length < 2}
          >
            Add transition
          </Button>
        )}
      </Stack>
      {transitions.length === 0 && (
        <EmptyContent
          filled
          title={stages.length < 2 ? 'Add stages before routes' : 'Connect the journey'}
          description={
            stages.length < 2
              ? 'Create at least two stages. You can then define how an applicant moves from one stage to the next.'
              : 'Add a route between stages. Use a default route for the usual path or conditions for special cases.'
          }
          action={
            !readOnly && stages.length >= 2 ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:source-branch-plus" />}
                onClick={onAdd}
                sx={{ mt: 2, minHeight: 44 }}
              >
                Add first transition
              </Button>
            ) : undefined
          }
          sx={{ minHeight: 280, py: 4 }}
          slotProps={{ img: { maxWidth: 104 } }}
        />
      )}
      {orderedTransitions.map((transition) => {
        const transitionLabel = getTransitionLabel(transition, stages);
        return (
          <Card
            id={`workflow-transition-${transition.id}`}
            key={transition.id}
            variant="outlined"
            sx={{ p: 1.5 }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Iconify icon="mdi:source-branch" color="primary.main" />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    variant="outlined"
                    label={getTransitionStepLabel(transition, stages)}
                  />
                  <Typography fontWeight={600}>{transitionLabel}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {transition.isDefault
                    ? 'Default route'
                    : transition.conditionRuleJson
                      ? 'Conditional route'
                      : 'Unconditional route'}{' '}
                  · Priority {transition.priority}
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{ width: 44, height: 44 }}
                aria-label={`${readOnly ? 'View' : 'Edit'} ${transitionLabel}`}
                onClick={() => onEdit(transition)}
              >
                <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
              </IconButton>
              {!readOnly && (
                <IconButton
                  size="small"
                  color="error"
                  sx={{ width: 44, height: 44 }}
                  aria-label={`Delete ${transitionLabel}`}
                  onClick={() => onDelete(transition.id)}
                >
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
