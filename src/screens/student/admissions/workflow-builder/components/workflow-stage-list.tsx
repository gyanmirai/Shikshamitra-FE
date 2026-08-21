'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  PointerSensor,
  closestCenter,
  KeyboardSensor,
} from '@dnd-kit/core';

import { WorkflowStageCard } from './workflow-stage-card';

type Props = {
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  loadingStageTypes: boolean;
  issueCountByStage: Record<string, number>;
  onAdd: () => void;
  onEdit: (stage: AdmissionWorkflowStage) => void;
  onDuplicate: (stage: AdmissionWorkflowStage) => void;
  onDelete: (stage: AdmissionWorkflowStage) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function WorkflowStageList({ stages, readOnly, loadingStageTypes, issueCountByStage, onAdd, onEdit, onDuplicate, onDelete, onDragEnd }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <Stack sx={{ p: 2, minHeight: 0, overflowY: 'auto', borderRight: { md: 1 }, borderColor: { md: 'divider' } }} spacing={1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Stages</Typography>
          <Typography variant="caption" color="text.secondary">
            Drag to organize the canvas. Entry and terminal flags control behavior.
          </Typography>
        </Box>
        {!readOnly && (
          <Button size="small" startIcon={<Iconify icon="mdi:plus" />} onClick={onAdd} disabled={loadingStageTypes}>
            Add stage
          </Button>
        )}
      </Stack>
      {stages.length === 0 && <Alert severity="info">Add an entry stage and at least one terminal stage to begin.</Alert>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={stages.map((stage) => stage.id)} strategy={verticalListSortingStrategy}>
          {stages.map((stage) => (
            <WorkflowStageCard
              key={stage.id}
              stage={stage}
              readOnly={readOnly}
              issueCount={issueCountByStage[stage.id] ?? 0}
              onEdit={() => onEdit(stage)}
              onDuplicate={() => onDuplicate(stage)}
              onDelete={() => onDelete(stage)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </Stack>
  );
}
