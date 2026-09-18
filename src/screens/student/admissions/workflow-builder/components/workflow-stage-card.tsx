'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Button, Avatar, IconButton, Typography } from '@mui/material';

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

  return (
    <Card
      id={`workflow-stage-${stage.id}`}
      ref={setNodeRef}
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        opacity: isDragging ? 0.65 : 1,
        borderColor: issueCount > 0 ? 'warning.main' : undefined,
        transform: CSS.Transform.toString(transform),
        transition,
        '&:hover': {
          borderColor: issueCount > 0 ? 'warning.main' : 'text.disabled',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
        sx={{ p: 1.25 }}
      >
        {!readOnly && (
          <IconButton
            size="small"
            aria-label={`Reorder ${stage.name}`}
            sx={{ width: 44, height: 44 }}
            {...attributes}
            {...listeners}
          >
            <Iconify icon="mdi:drag-vertical" />
          </IconButton>
        )}
        <Avatar
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            border: 1,
            typography: 'subtitle2',
            color: 'text.primary',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
          }}
        >
          {stepNumber}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: { xs: 'calc(100% - 96px)', sm: 0 } }}>
          <Stack direction="row" alignItems="center" spacing={0.75} useFlexGap flexWrap="wrap">
            <Typography fontWeight={600}>{stage.name}</Typography>
            {stage.isEntryStage && <Chip size="small" color="info" label="Entry" />}
            {stage.isTerminalStage && <Chip size="small" color="success" label="Terminal" />}
            {issueCount > 0 && (
              <Chip
                size="small"
                color="warning"
                icon={<Iconify icon="mdi:alert-outline" />}
                label={`${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {stage.description || stage.code}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
              {stage.code}
            </Typography>
            {stage.isRequired && (
              <Typography variant="caption" color="text.disabled">
                · Required
              </Typography>
            )}
            {stage.allowManualSkip && (
              <Typography variant="caption" color="text.disabled">
                · Manual skip allowed
              </Typography>
            )}
          </Stack>
        </Box>
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ width: { xs: 1, sm: 'auto' }, ml: { xs: 'auto', sm: 0 }, mt: { xs: 0.5, sm: 0 } }}
        >
          <IconButton
            size="small"
            aria-label={`${readOnly ? 'View' : 'Edit'} ${stage.name}`}
            sx={{ width: 44, height: 44 }}
            onClick={onEdit}
          >
            <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
          </IconButton>
          {!readOnly && (
            <>
              <IconButton
                size="small"
                aria-label={`Duplicate ${stage.name}`}
                sx={{ width: 44, height: 44 }}
                onClick={onDuplicate}
              >
                <Iconify icon="mdi:content-copy" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${stage.name}`}
                sx={{ width: 44, height: 44 }}
                onClick={onDelete}
              >
                <Iconify icon="mdi:delete-outline" />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.neutral',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Iconify
              icon={stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:source-branch'}
              width={17}
              color="text.secondary"
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {stage.isTerminalStage ? 'Journey complete' : 'Next step'}
            </Typography>
          </Stack>
          {!readOnly && !stage.isTerminalStage && (
            <Button
              size="small"
              startIcon={<Iconify icon="mdi:source-branch-plus" width={17} />}
              onClick={onAddPath}
              sx={{ minHeight: 44 }}
            >
              Add route
            </Button>
          )}
        </Stack>

        {stage.isTerminalStage ? (
          <Typography variant="body2" color="text.secondary">
            The applicant journey ends at this stage.
          </Typography>
        ) : transitions.length === 0 ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Iconify icon="mdi:alert-outline" width={17} color="warning.main" />
            <Typography variant="body2" color="warning.main">
              No next step configured. Add a route before publishing.
            </Typography>
          </Stack>
        ) : (
          <Stack>
            {transitions
              .slice()
              .sort(
                (left, right) =>
                  Number(right.isDefault) - Number(left.isDefault) || left.priority - right.priority
              )
              .map((path) => {
                const destination =
                  stages.find((item) => item.id === path.toStageId)?.name ?? 'Missing stage';
                return (
                  <Stack
                    key={path.id}
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{ minHeight: 44, '& + &': { borderTop: 1, borderColor: 'divider' } }}
                  >
                    <Iconify
                      icon={path.isDefault ? 'mdi:arrow-right' : 'mdi:source-branch'}
                      width={17}
                      color="text.secondary"
                    />
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                      {getTransitionSummary(path)} → <strong>{destination}</strong>
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`${readOnly ? 'View' : 'Edit'} path to ${destination}`}
                      onClick={() => onEditPath(path)}
                      sx={{ width: 44, height: 44 }}
                    >
                      <Iconify
                        icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'}
                        width={17}
                      />
                    </IconButton>
                    {!readOnly && (
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Remove path to ${destination}`}
                        onClick={() => onDeletePath(path.id)}
                        sx={{ width: 44, height: 44 }}
                      >
                        <Iconify icon="mdi:delete-outline" width={17} />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
