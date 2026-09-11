'use client';

import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Avatar, IconButton, Typography } from '@mui/material';

type Props = {
  stage: AdmissionWorkflowStage;
  stepNumber: number;
  readOnly: boolean;
  issueCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function WorkflowStageCard({
  stage,
  stepNumber,
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
      <Stack direction="row" alignItems="flex-start" spacing={1}>
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
          sx={{ width: 32, height: 32, mt: 0.75, bgcolor: 'primary.main', typography: 'subtitle2' }}
        >
          {stepNumber}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography fontWeight={600}>{stage.name}</Typography>
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
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {stage.description || stage.code}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {stage.code}
          </Typography>
        </Box>
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
    </Card>
  );
}
