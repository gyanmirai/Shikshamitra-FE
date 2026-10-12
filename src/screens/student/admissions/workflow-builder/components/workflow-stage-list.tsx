'use client';

import type { ReactNode } from 'react';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Button, IconButton, Typography } from '@mui/material';

import { WorkflowStageCard } from './workflow-stage-card';
import { AdmissionDialogTitle } from '../../admission-dialog-title';

type Props = {
  dirty?: boolean;
  footerActions: ReactNode;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
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
};

export function WorkflowStageList({
  dirty = false,
  footerActions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
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
}: Props) {
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
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
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          flexShrink: 0,
          px: 1,
          py: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              id="workflow-stages-heading"
              aria-label="Journey"
              variant="h6"
              fontWeight={700}
              component="div"
            >
              <AdmissionDialogTitle
                title="Journey"
                helpText="Stages are shown in their saved sequence. Each stage’s next step controls where applicants continue."
                helpLabel="Journey arrangement information"
              />
            </Typography>
            {stages.length > 0 && <Label variant="outlined">{stages.length} stages</Label>}
          </Stack>
        </Box>
        {!readOnly && (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Stack role="group" aria-label="Journey edit history" direction="row" spacing={0.5}>
              <CustomTooltip title="Undo">
                <span>
                  <IconButton
                    aria-label="Undo"
                    disabled={!canUndo}
                    onClick={onUndo}
                    sx={{
                      width: 30,
                      height: 30,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Iconify icon="mdi:undo" width={20} />
                  </IconButton>
                </span>
              </CustomTooltip>
              <CustomTooltip title="Redo">
                <span>
                  <IconButton
                    aria-label="Redo"
                    disabled={!canRedo}
                    onClick={onRedo}
                    sx={{
                      width: 30,
                      height: 30,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Iconify icon="mdi:redo" width={20} />
                  </IconButton>
                </span>
              </CustomTooltip>
            </Stack>
            {stages.length > 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={onAdd}
                disabled={loadingStageTypes}
                sx={{
                  flexShrink: 0,
                  bgcolor: 'text.primary',
                  color: 'background.paper',
                  '&:hover': { bgcolor: 'text.secondary' },
                }}
              >
                Add stage
              </Button>
            )}
          </Stack>
        )}
      </Stack>
      <Scrollbar
        fillContent
        sx={{ flex: 1 }}
        slotProps={{ content: { minWidth: 0 } }}
        ariaLabel="Admission journey stages"
      >
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
            <Stack
              component="ol"
              aria-label="Journey stage sequence"
              spacing={1.25}
              sx={{
                position: 'relative',
                listStyle: 'none',
                m: 0,
                p: 0,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 34,
                  bottom: 34,
                  left: 28,
                  width: '1px',
                  bgcolor: 'divider',
                },
              }}
            >
              {orderedStages.map((stage, index) => (
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
          </Box>
        )}
      </Scrollbar>
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{
          flexShrink: 0,
          px: 1,
          py: 1.25,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {stages.length > 0 ? (
          <Stack
            role="status"
            aria-label="Journey validation summary"
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            sx={{ minWidth: 0 }}
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
              {journeyReady ? 'Journey connected' : 'Journey needs attention'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              · {stages.length} stages · {transitions.length} routes
            </Typography>
            {dirty && <Label color="warning">Unsaved changes</Label>}
          </Stack>
        ) : (
          <Box />
        )}
        {footerActions}
      </Stack>
    </Stack>
  );
}
