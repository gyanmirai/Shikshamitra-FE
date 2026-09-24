'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Button, Typography } from '@mui/material';
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
  const stageIds = new Set(stages.map((stage) => stage.id));
  const hasEntryStage = stages.filter((stage) => stage.isEntryStage).length === 1;
  const hasTerminalStage = stages.some((stage) => stage.isTerminalStage);
  const hasCompleteRoutes = stages.every(
    (stage) =>
      stage.isTerminalStage || transitions.some((transition) => transition.fromStageId === stage.id)
  );
  const hasValidDestinations = transitions.every(
    (transition) => stageIds.has(transition.fromStageId) && stageIds.has(transition.toStageId)
  );
  const journeyReady =
    stages.length > 0 &&
    hasEntryStage &&
    hasTerminalStage &&
    hasCompleteRoutes &&
    hasValidDestinations;

  return (
    <Stack
      component="section"
      aria-labelledby="workflow-stages-heading"
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflowY: { xs: 'visible', md: 'auto' },
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
            <Typography id="workflow-stages-heading" variant="h6" fontWeight={700}>
              Journey
            </Typography>
            {stages.length > 0 && <Label variant="outlined">{stages.length} stages</Label>}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Arrange each stage and confirm where every applicant outcome goes next.
          </Typography>
        </Box>
        {!readOnly && stages.length > 0 && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={onAdd}
            disabled={loadingStageTypes}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: 'stretch', sm: 'center' },
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': { bgcolor: 'text.secondary' },
            }}
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
                  sx={{
                    mt: 2,
                    minHeight: { xs: 44, md: 36 },
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    '&:hover': { bgcolor: 'text.secondary' },
                  }}
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
        <Box sx={{ minWidth: 0, p: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={stages.map((stage) => stage.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack
                spacing={1.25}
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 34,
                    bottom: 34,
                    left: { xs: 26, sm: 32 },
                    width: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
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
      {stages.length > 0 && (
        <Stack
          role="status"
          aria-label="Journey validation summary"
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          sx={{
            mt: 'auto',
            position: { xs: 'static', md: 'sticky' },
            bottom: 0,
            zIndex: 2,
            px: { xs: 1.5, sm: 3 },
            py: 1.25,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            boxShadow: { xs: 'none', md: '0 -6px 16px rgba(15, 23, 42, 0.04)' },
          }}
        >
          <Iconify
            icon={journeyReady ? 'mdi:check-circle' : 'mdi:alert-circle-outline'}
            color={journeyReady ? 'success.main' : 'warning.main'}
            width={20}
          />
          <Typography
            variant="body2"
            fontWeight={600}
            color={journeyReady ? 'success.main' : 'warning.main'}
          >
            {journeyReady ? 'Journey valid' : 'Journey needs attention'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            · {stages.length} stages · {transitions.length} routes
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
