'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationIssue,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import {
  Box,
  Card,
  Stack,
  Alert,
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
  issues: AdmissionWorkflowValidationIssue[];
  incomingRoute?: AdmissionWorkflowTransition;
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
  issues,
  incomingRoute,
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
  const hasMissingNextStep = !stage.isTerminalStage && orderedTransitions.length === 0;
  const hasMissingIncomingRoute = issues.some(
    (issue) => issue.code === 'Admissions.WorkflowOrphanStage'
  );
  const source = incomingRoute && stages.find((item) => item.id === incomingRoute.fromStageId);
  const visibleIssues = issues.filter(({ code }) => {
    if (
      hasMissingNextStep &&
      (code === 'Admissions.WorkflowDeadEndStage' ||
        code === 'Admissions.WorkflowTerminalUnreachable')
    )
      return false;
    if (hasMissingIncomingRoute && code === 'Admissions.WorkflowOrphanStage') return false;
    if (hasMissingIncomingRoute && code === 'Admissions.WorkflowUnreachableStage') return false;
    return true;
  });
  const documentPolicy =
    stage.stageType === 5 ? readAdmissionDocumentPolicy(stage.configurationJson) : null;
  const isMissingDocumentIssue = (issue: AdmissionWorkflowValidationIssue) =>
    stage.stageType === 5 &&
    issue.code === 'Admissions:Documents:InvalidPolicy' &&
    /configure between 1 and 30 document requirements/i.test(issue.message) &&
    (!documentPolicy || documentPolicy.requirements.length === 0);
  const issueCount = visibleIssues.filter((issue) => !isMissingDocumentIssue(issue)).length;
  const renderIssue = (issue: AdmissionWorkflowValidationIssue, index: number) => {
    if (isMissingDocumentIssue(issue)) {
      return (
        <Typography
          key={`missing-documents-${index}`}
          variant="caption"
          color="error.main"
          sx={{ display: 'block', mt: 0.5 }}
        >
          At least one document is required for this stage.
        </Typography>
      );
    }
    const issueTransition = transitions.find((item) => item.id === issue.transitionId);
    let action = onEdit;
    let actionLabel = readOnly ? 'View Stage' : 'Edit Stage';
    if (issueTransition) {
      action = () => onEditPath(issueTransition);
      actionLabel = readOnly ? 'View Route' : 'Edit Route';
    } else if (stage.stageType === 5 && issue.code === 'Admissions:Documents:InvalidPolicy') {
      actionLabel = readOnly ? 'View Document Setup' : 'Edit Document Setup';
    }
    return (
      <Alert
        key={`${issue.code}-${issue.transitionId ?? issue.stageId ?? 'workflow'}-${index}`}
        severity={issue.severity === 0 ? 'error' : 'warning'}
        variant="outlined"
        action={
          <Button size="small" onClick={action} aria-label={`${actionLabel} for ${stage.name}`}>
            {actionLabel}
          </Button>
        }
        sx={{
          mt: 1,
          alignItems: 'center',
          bgcolor: 'background.paper',
          '& .MuiAlert-message': { overflowWrap: 'anywhere' },
          '& .MuiAlert-action': { alignItems: 'center', pt: 0 },
        }}
      >
        {issue.message}
      </Alert>
    );
  };

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
                  sx={{
                    ...textActionFocusSx,
                    typography: 'inherit',
                    textAlign: 'left',
                    borderRadius: 0.5,
                  }}
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
                {issueCount} {issueCount === 1 ? 'Issue' : 'Issues'}
              </Label>
            )}
          </Stack>
          {stage.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: { xs: 'none', sm: 'block' },
                lineHeight: 1.5,
                overflowWrap: 'anywhere',
              }}
            >
              {stage.description}
            </Typography>
          )}
          {visibleIssues.map(renderIssue)}
          {hasMissingIncomingRoute && (
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.25 }}
            >
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                <Iconify
                  icon="mdi:arrow-right"
                  width={16}
                  color="warning.main"
                  sx={{ flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {source
                    ? `Connect ${source.name} to ${stage.name} before publishing.`
                    : 'Connect this stage before publishing.'}
                </Typography>
              </Stack>
              {!readOnly && incomingRoute && (
                <Button
                  size="small"
                  onClick={() => onEditPath(incomingRoute)}
                  aria-label={`Connect Route for ${stage.name}`}
                >
                  Connect Route
                </Button>
              )}
            </Stack>
          )}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, minWidth: 0 }}>
            <Iconify
              icon={stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:arrow-right'}
              width={16}
              color={hasMissingNextStep ? 'warning.main' : 'text.disabled'}
            />
            {stage.isTerminalStage ? (
              <Typography variant="caption" color="text.secondary">
                End of Journey
              </Typography>
            ) : hasMissingNextStep ? (
              <Typography variant="caption" color="warning.main">
                Choose the Next Step Before Publishing
              </Typography>
            ) : (
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.5} sx={{ minWidth: 0 }}>
                {orderedTransitions.map((path) => (
                  <Stack key={path.id} direction="row" alignItems="center" sx={{ minWidth: 0 }}>
                    <ButtonBase
                      aria-label={`${readOnly || !path.isDefault ? 'View' : 'Edit'} Route To ${getDestination(path)}`}
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
                      <CustomTooltip title={`Remove Route To ${getDestination(path)}`}>
                        <IconButton
                          size="small"
                          aria-label={`Remove Route To ${getDestination(path)}`}
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
            Choose Next Step
          </Button>
        )}

        {!readOnly && (
          <ThreeDotsActions
            showThreeDots={false}
            sx={{ gridColumn: 3, gridRow: 1, flexShrink: 0, gap: 0 }}
            directActions={[
              {
                id: 'edit',
                label: 'Edit Stage',
                ariaLabel: `Edit ${stage.name}`,
                icon: GlobalIcons.edit,
                onClick: onEdit,
              },
              {
                id: 'duplicate',
                label: 'Duplicate Stage',
                ariaLabel: `Duplicate ${stage.name}`,
                icon: 'mdi:content-copy',
                onClick: onDuplicate,
              },
              {
                id: 'delete',
                label: 'Delete Stage',
                ariaLabel: `Delete ${stage.name}`,
                icon: GlobalIcons.delete,
                color: 'error.main',
                onClick: onDelete,
              },
            ]}
          />
        )}
      </Stack>
    </Card>
  );
}
