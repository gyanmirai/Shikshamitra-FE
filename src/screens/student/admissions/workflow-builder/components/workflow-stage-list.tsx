'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';
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
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  loadingStageTypes: boolean;
  issueCountByStage: Record<string, number>;
  onAdd: () => void;
  onEdit: (stage: AdmissionWorkflowStage) => void;
  onDuplicate: (stage: AdmissionWorkflowStage) => void;
  onDelete: (stage: AdmissionWorkflowStage) => void;
  onAddPath: (stage: AdmissionWorkflowStage) => void;
  onEditPath: (transition: AdmissionWorkflowTransition) => void;
  onDeletePath: (transitionId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function WorkflowStageList({
  stages,
  transitions,
  readOnly,
  loadingStageTypes,
  issueCountByStage,
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
  onAddPath,
  onEditPath,
  onDeletePath,
  onDragEnd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <Stack
      component="section"
      aria-labelledby="workflow-stages-heading"
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          top: 0,
          zIndex: 2,
          px: 2,
          py: 1.5,
          position: 'sticky',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography id="workflow-stages-heading" variant="subtitle1" fontWeight={700}>
              Admission journey
            </Typography>
            {stages.length > 0 && (
              <Chip size="small" variant="outlined" label={`${stages.length} stages`} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Arrange each stage and confirm where every applicant outcome goes next.
          </Typography>
        </Box>
        {!readOnly && stages.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={onAdd}
            disabled={loadingStageTypes}
            sx={{ minHeight: 44, flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Add stage
          </Button>
        )}
      </Stack>
      {stages.length === 0 && (
        <Box sx={{ p: 2 }}>
          <EmptyContent
            filled
            title="Build the admission journey"
            description="Start with the first step an applicant enters. Before publishing, the journey must also include a final stage."
            action={
              !readOnly ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mdi:plus" />}
                  onClick={onAdd}
                  disabled={loadingStageTypes}
                  sx={{ mt: 2, minHeight: 44 }}
                >
                  Add first stage
                </Button>
              ) : undefined
            }
            sx={{ minHeight: 280, py: 4 }}
            slotProps={{ img: { maxWidth: 104 } }}
          />
        </Box>
      )}
      {stages.length > 0 && (
        <Box sx={{ p: 1.5 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={stages.map((stage) => stage.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={1.25}>
                {stages.map((stage, index) => (
                  <WorkflowStageCard
                    key={stage.id}
                    stage={stage}
                    stages={stages}
                    transitions={transitions.filter((item) => item.fromStageId === stage.id)}
                    stepNumber={index + 1}
                    readOnly={readOnly}
                    issueCount={issueCountByStage[stage.id] ?? 0}
                    onEdit={() => onEdit(stage)}
                    onDuplicate={() => onDuplicate(stage)}
                    onDelete={() => onDelete(stage)}
                    onAddPath={() => onAddPath(stage)}
                    onEditPath={onEditPath}
                    onDeletePath={onDeletePath}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </Box>
      )}
    </Stack>
  );
}
