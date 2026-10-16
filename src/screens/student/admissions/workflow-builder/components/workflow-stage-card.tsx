'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Stack,
  Button,
  Avatar,
  ButtonBase,
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

const textActionFocusSx = {
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
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
  const orderedTransitions = transitions
    .slice()
    .sort(
      (left, right) =>
        Number(right.isDefault) - Number(left.isDefault) || left.priority - right.priority
    );
  const getDestination = (path: AdmissionWorkflowTransition) =>
    stages.find((item) => item.id === path.toStageId)?.name ?? 'Missing stage';
  const canChooseNextStep =
    !readOnly && !stage.isTerminalStage && !orderedTransitions.some((path) => path.isDefault);

  return (
    <Card
      id={`workflow-stage-${stage.id}`}
      component="li"
      variant="outlined"
      sx={{
        zIndex: 1,
        minWidth: 0,
        borderRadius: 2,
        bgcolor: 'background.paper',
        borderColor: issueCount > 0 ? 'warning.main' : 'divider',
        '&:hover': { borderColor: issueCount > 0 ? 'warning.main' : 'text.disabled' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0, sm: 1.25 }}
        sx={{
          p: { xs: 1, sm: 1.25 },
          display: { xs: 'grid', sm: 'flex' },
          gridTemplateColumns: '36px minmax(0, 1fr) auto',
          rowGap: 0.75,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            gridColumn: 1,
            gridRow: 1,
            typography: 'subtitle2',
            color: 'text.primary',
            bgcolor: 'background.neutral',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {stepNumber}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0, gridColumn: '1 / -1', gridRow: 2 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {readOnly ? (
                <ButtonBase
                  onClick={onEdit}
                  aria-label={`View ${stage.name}`}
                    sx={{ ...textActionFocusSx, typography: 'inherit', textAlign: 'left', borderRadius: 0.5 }}
                >
                  {stage.name}
                </ButtonBase>
              ) : (
                stage.name
              )}
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
          {stage.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {stage.description}
            </Typography>
          )}
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
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.5} sx={{ minWidth: 0 }}>
                {orderedTransitions.map((path) => (
                  <Stack key={path.id} direction="row" alignItems="center" sx={{ minWidth: 0 }}>
                    <ButtonBase
                      aria-label={`${readOnly || !path.isDefault ? 'View' : 'Edit'} route to ${getDestination(path)}`}
                      onClick={() => onEditPath(path)}
                      sx={{
                        ...textActionFocusSx,
                        typography: 'caption',
                        color: 'text.secondary',
                        textAlign: 'left',
                        borderRadius: 0.5,
                        overflowWrap: 'anywhere',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {getTransitionSummary(path)} → {getDestination(path)}
                    </ButtonBase>
                    {!readOnly && path.isDefault && (
                      <CustomTooltip title={`Remove route to ${getDestination(path)}`}>
                        <IconButton
                          size="small"
                          aria-label={`Remove route to ${getDestination(path)}`}
                          onClick={() => onDeletePath(path.id)}
                        >
                          <Iconify icon="mdi:close" width={16} />
                        </IconButton>
                      </CustomTooltip>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>

        {canChooseNextStep && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:source-branch-plus" width={17} />}
            onClick={onAddPath}
            sx={{
              flexShrink: 0,
              gridColumn: '1 / -1',
              gridRow: 3,
              justifySelf: 'start',
            }}
          >
            Choose next step
          </Button>
        )}

        {!readOnly && (
          <Stack direction="row" sx={{ gridColumn: 3, gridRow: 1, flexShrink: 0 }}>
            <CustomTooltip title="Edit stage">
              <IconButton size="small" aria-label={`Edit ${stage.name}`} onClick={onEdit}>
                <Iconify icon="mdi:pencil-outline" width={20} />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Duplicate stage">
              <IconButton size="small" aria-label={`Duplicate ${stage.name}`} onClick={onDuplicate}>
                <Iconify icon="mdi:content-copy" width={20} />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Delete stage">
              <IconButton size="small" aria-label={`Delete ${stage.name}`} onClick={onDelete}>
                <Iconify icon="mdi:delete-outline" width={20} />
              </IconButton>
            </CustomTooltip>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
