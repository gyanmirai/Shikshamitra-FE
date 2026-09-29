'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { CSS } from '@dnd-kit/utilities';
import { Label } from 'src/components/label';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import {
  Box,
  Card,
  Stack,
  Button,
  Avatar,
  Divider,
  MenuItem,
  IconButton,
  Typography,
} from '@mui/material';

import { getTransitionSummary } from '../../workflow-builder-utils';

type Props = {
  stage: AdmissionWorkflowStage;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  stepNumber: number;
  readOnly: boolean;
  issueCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddPath: () => void;
  onEditPath: (transition: AdmissionWorkflowTransition) => void;
  onDeletePath: (transitionId: string) => void;
};

export function WorkflowStageCard({
  stage,
  stages,
  transitions,
  stepNumber,
  readOnly,
  issueCount,
  onEdit,
  onDuplicate,
  onDelete,
  onAddPath,
  onEditPath,
  onDeletePath,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
    disabled: readOnly,
  });
  const orderedTransitions = transitions
    .slice()
    .sort(
      (left, right) =>
        Number(right.isDefault) - Number(left.isDefault) || left.priority - right.priority
    );
  const getDestination = (path: AdmissionWorkflowTransition) =>
    stages.find((item) => item.id === path.toStageId)?.name ?? 'Missing stage';

  return (
    <Card
      id={`workflow-stage-${stage.id}`}
      ref={setNodeRef}
      variant="outlined"
      sx={{
        zIndex: 1,
        minWidth: 0,
        borderRadius: 2,
        opacity: isDragging ? 0.65 : 1,
        bgcolor: 'background.paper',
        borderColor: issueCount > 0 ? 'warning.main' : 'divider',
        transform: CSS.Transform.toString(transform),
        transition,
        '&:hover': { borderColor: issueCount > 0 ? 'warning.main' : 'text.disabled' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.75, sm: 1.25 }}
        sx={{ p: { xs: 1, sm: 1.25 } }}
      >
        {!readOnly && (
          <IconButton
            size="small"
            aria-label={`Reorder ${stage.name}`}
            sx={{
              width: { xs: 44, md: 36 },
              height: { xs: 44, md: 36 },
              flexShrink: 0,
            }}
            {...attributes}
            {...listeners}
          >
            <Iconify icon="mdi:drag-vertical" />
          </IconButton>
        )}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            typography: 'subtitle2',
            color: 'text.primary',
            bgcolor: 'background.neutral',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {stepNumber}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {stage.name}
            </Typography>
            {stage.isEntryStage && (
              <Label color="info" variant="soft">
                Entry
              </Label>
            )}
            {stage.isTerminalStage && <Label variant="soft">Final</Label>}
            {issueCount > 0 && (
              <Label
                color="warning"
                variant="soft"
                startIcon={<Iconify icon="mdi:alert-outline" />}
              >
                {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
              </Label>
            )}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {stage.description || stage.code}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, minWidth: 0 }}>
            <Iconify
              icon={stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:arrow-right'}
              width={16}
              color={
                !stage.isTerminalStage && orderedTransitions.length === 0
                  ? 'warning.main'
                  : 'text.disabled'
              }
            />
            {stage.isTerminalStage ? (
              <Typography variant="caption" color="text.secondary">
                End of journey
              </Typography>
            ) : orderedTransitions.length === 0 ? (
              <Typography variant="caption" color="warning.main">
                Choose the next step before publishing
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" noWrap>
                {orderedTransitions
                  .map((path) => `${getTransitionSummary(path)} → ${getDestination(path)}`)
                  .join(' · ')}
              </Typography>
            )}
          </Stack>
        </Box>

        {!readOnly && !stage.isTerminalStage && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:source-branch-plus" width={17} />}
            onClick={onAddPath}
            sx={{
              minHeight: { xs: 44, md: 36 },
              flexShrink: 0,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            {orderedTransitions.some((path) => path.isDefault) ? 'Add special outcome' : 'Choose next step'}
          </Button>
        )}

        <ThreeDotsActions
          moreLabel={`Actions for ${stage.name}`}
          sx={{
            '& .MuiIconButton-root': {
              width: { xs: 44, md: 36 },
              height: { xs: 44, md: 36 },
            },
          }}
          actions={({ popover }) => (
            <>
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  onEdit();
                }}
              >
                <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
                {readOnly ? 'View stage' : 'Edit stage'}
              </MenuItem>
              {!readOnly && (
                <MenuItem
                  onClick={() => {
                    popover.onClose();
                    onDuplicate();
                  }}
                >
                  <Iconify icon="mdi:content-copy" /> Duplicate stage
                </MenuItem>
              )}
              {!readOnly && !stage.isTerminalStage && (
                <MenuItem
                  onClick={() => {
                    popover.onClose();
                    onAddPath();
                  }}
                >
                  <Iconify icon="mdi:source-branch-plus" /> {orderedTransitions.some((path) => path.isDefault) ? 'Add special outcome' : 'Choose next step'}
                </MenuItem>
              )}
              {orderedTransitions.length > 0 && <Divider />}
              {orderedTransitions.map((path) => (
                <Box key={path.id}>
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      onEditPath(path);
                    }}
                  >
                    <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
                    {readOnly ? 'View' : 'Edit'} route to {getDestination(path)}
                  </MenuItem>
                  {!readOnly && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onDeletePath(path.id);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify icon="mdi:delete-outline" /> Remove route to {getDestination(path)}
                    </MenuItem>
                  )}
                </Box>
              ))}
              {!readOnly && <Divider />}
              {!readOnly && (
                <MenuItem
                  onClick={() => {
                    popover.onClose();
                    onDelete();
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify icon="mdi:delete-outline" /> Delete stage
                </MenuItem>
              )}
            </>
          )}
        />
      </Stack>
    </Card>
  );
}
