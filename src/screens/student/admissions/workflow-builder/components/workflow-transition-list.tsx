import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Button, IconButton, Typography } from '@mui/material';

import { getTransitionLabel } from '../../workflow-builder-utils';

type Props = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  onAdd: () => void;
  onEdit: (transition: AdmissionWorkflowTransition) => void;
  onDelete: (transitionId: string) => void;
};

export function WorkflowTransitionList({ stages, transitions, readOnly, onAdd, onEdit, onDelete }: Props) {
  return (
    <Stack sx={{ p: 2, minHeight: 0, overflowY: 'auto' }} spacing={1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Transitions</Typography>
          <Typography variant="caption" color="text.secondary">
            Add a default route or controlled condition from each non-terminal stage.
          </Typography>
        </Box>
        {!readOnly && (
          <Button size="small" startIcon={<Iconify icon="mdi:source-branch-plus" />} onClick={onAdd} disabled={stages.length < 2}>
            Add transition
          </Button>
        )}
      </Stack>
      {transitions.length === 0 && <Alert severity="info">No transitions yet. Connect stages without relying on their visual order.</Alert>}
      {transitions.map((transition) => (
        <Card key={transition.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:source-branch" color="primary.main" />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>{getTransitionLabel(transition, stages)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {transition.isDefault ? 'Default route' : transition.conditionRuleJson ? 'Conditional route' : 'Unconditional route'} · Priority {transition.priority}
              </Typography>
            </Box>
            <IconButton size="small" aria-label="Edit transition" onClick={() => onEdit(transition)}>
              <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
            </IconButton>
            {!readOnly && (
              <IconButton size="small" color="error" aria-label="Delete transition" onClick={() => onDelete(transition.id)}>
                <Iconify icon="mdi:delete-outline" />
              </IconButton>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
