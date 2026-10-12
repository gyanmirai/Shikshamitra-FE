'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
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
          gridTemplateColumns: '36px minmax(0, 1fr) 44px 44px',
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
              <Typography variant="caption" color="text.secondary" noWrap>
                {orderedTransitions
                  .map((path) => `${getTransitionSummary(path)} → ${getDestination(path)}`)
                  .join(' · ')}
              </Typography>
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
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Choose next step
          </Button>
        )}

        <CustomTooltip title={readOnly ? 'View stage' : 'Edit stage'}>
          <IconButton
            size="small"
            aria-label={`${readOnly ? 'View' : 'Edit'} ${stage.name}`}
            onClick={onEdit}
            sx={{
              gridColumn: 3,
              gridRow: 1,
              width: { xs: 44, md: 36 },
              height: { xs: 44, md: 36 },
              flexShrink: 0,
            }}
          >
            <Iconify icon={readOnly ? 'mdi:eye-outline' : 'mdi:pencil-outline'} width={20} />
          </IconButton>
        </CustomTooltip>

        {(!readOnly || orderedTransitions.length > 0) && (
          <ThreeDotsActions
            moreLabel={`Actions for ${stage.name}`}
            sx={{
              gridColumn: 4,
              gridRow: 1,
              '& .MuiIconButton-root': {
                width: { xs: 44, md: 36 },
                height: { xs: 44, md: 36 },
              },
            }}
            actions={({ popover }) => (
              <>
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
                {canChooseNextStep && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      onAddPath();
                    }}
                  >
                    <Iconify icon="mdi:source-branch-plus" /> Choose next step
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
                      <Iconify
                        icon={
                          readOnly || !path.isDefault ? 'mdi:eye-outline' : 'mdi:pencil-outline'
                        }
                      />
                      {readOnly || !path.isDefault ? 'View' : 'Edit'} route to{' '}
                      {getDestination(path)}
                    </MenuItem>
                    {!readOnly && path.isDefault && (
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
        )}
      </Stack>
    </Card>
  );
}
