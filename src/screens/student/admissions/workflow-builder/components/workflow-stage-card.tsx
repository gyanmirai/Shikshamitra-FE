'use client';

import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, IconButton, Typography } from '@mui/material';

type Props = {
  stage: AdmissionWorkflowStage;
  readOnly: boolean;
  issueCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function WorkflowStageCard({
  stage,
  readOnly,
  issueCount,
  onEdit,
  onDuplicate,
  onDelete,
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
        p: 1.5,
        opacity: isDragging ? 0.65 : 1,
        borderColor: issueCount > 0 ? 'warning.main' : undefined,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {!readOnly && (
          <IconButton
            size="small"
            aria-label={`Reorder ${stage.name}`}
            {...attributes}
            {...listeners}
          >
            <Iconify icon="mdi:drag-vertical" />
          </IconButton>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography fontWeight={600} noWrap>{stage.name}</Typography>
            {stage.isEntryStage && <Chip size="small" color="info" label="Entry" />}
            {stage.isTerminalStage && <Chip size="small" color="success" label="Terminal" />}
            {stage.isRequired && <Chip size="small" variant="outlined" label="Required" />}
            {stage.allowManualSkip && <Chip size="small" variant="outlined" label="Manual skip" />}
            {issueCount > 0 && (
              <Chip
                size="small"
                color="warning"
                icon={<Iconify icon="mdi:alert-outline" />}
                label={`${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">{stage.code}</Typography>
        </Box>
        <IconButton size="small" aria-label={`Edit ${stage.name}`} onClick={onEdit}>
          <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} />
        </IconButton>
        {!readOnly && (
          <>
            <IconButton size="small" aria-label={`Duplicate ${stage.name}`} onClick={onDuplicate}>
              <Iconify icon="mdi:content-copy" />
            </IconButton>
            <IconButton size="small" color="error" aria-label={`Delete ${stage.name}`} onClick={onDelete}>
              <Iconify icon="mdi:delete-outline" />
            </IconButton>
          </>
        )}
      </Stack>
    </Card>
  );
}
