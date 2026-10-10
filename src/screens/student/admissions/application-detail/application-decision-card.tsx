'use client';

import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import { useLazyGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';
import {
  Box,
  Card,
  Chip,
  Alert,
  Paper,
  Stack,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionStatus } from './application-decision-status';
import { ApplicationDecisionActions } from './application-decision-actions';
import { ApplicationDecisionHistory } from './application-decision-history';
import { ApplicationFinalizedSummary } from './application-finalized-summary';
import { ApplicationFinalizationDialog } from './application-finalization-dialog';
import { ApplicationFinalizationCallout } from './application-finalization-callout';
import { ApplicationDecisionReviewSummary } from './application-decision-review-summary';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';
import {
  canPerformAdmissionDecision,
  type AdmissionDecisionAction,
  useAdmissionApplicationDecisions,
} from './use-admission-application-decisions';

type Props = {
  application: AdmissionApplication;
  journeyCompleted: boolean;
  compact?: boolean;
  disabled?: boolean;
  navigationDisabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  workflow?: AdmissionApplicationWorkflow;
  onSelectStage?: (stageId: string) => void;
  onFinalizationOpenChange?: (open: boolean) => void;
  hideFinalizedActions?: boolean;
};
const ACTIONS: AdmissionDecisionAction[] = ['approve', 'waitlist', 'reject'];

export function ApplicationDecisionCard({
  application,
  journeyCompleted,
  compact = false,
  disabled = false,
  navigationDisabled = disabled,
  onBusyChange,
  workflow,
  onSelectStage,
  onFinalizationOpenChange,
  hideFinalizedActions = false,
}: Props) {
  const decisions = useAdmissionApplicationDecisions(
    application.id,
    application.status,
    journeyCompleted
  );
  const finalizationDialog = useBoolean();
  const history = useBoolean();
  const [reloadApplication] = useLazyGetAdmissionApplicationQuery();
  const [action, setAction] = useState<AdmissionDecisionAction | null>(null);
  const [decisionApplication, setDecisionApplication] = useState(application);
  const { canDecide, canFinalize } = decisions;
  useEffect(() => {
    onBusyChange?.(decisions.isBusy);
  }, [decisions.isBusy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    onFinalizationOpenChange?.(compact && finalizationDialog.value && application.status !== 11);
  }, [compact, finalizationDialog.value, application.status, onFinalizationOpenChange]);
  useEffect(() => () => onFinalizationOpenChange?.(false), [onFinalizationOpenChange]);
  const visibleActions = ACTIONS.filter(
    (item) => canDecide && canPerformAdmissionDecision(application.status, item)
  );

  const finalization = (
    <ApplicationFinalizationDialog
      open={finalizationDialog.value}
      presentation={compact ? 'inline' : 'dialog'}
      application={application}
      applicantId={application.applicantId}
      busy={disabled || decisions.isBusy}
      preview={decisions.finalizationPreviewQuery.data}
      loading={
        decisions.finalizationPreviewQuery.isLoading ||
        decisions.finalizationPreviewQuery.isFetching
      }
      hasError={decisions.finalizationPreviewQuery.isError}
      onRetry={() => decisions.finalizationPreviewQuery.refetch()}
      onClose={finalizationDialog.onFalse}
      onSubmit={(value) =>
        disabled || decisions.isBusy
          ? Promise.resolve(false)
          : decisions.runFinalization(application.concurrencyStamp, value)
      }
    />
  );

  if (application.status === 11)
    return (
      <ApplicationFinalizedSummary
        application={application}
        workflow={workflow}
        history={decisions.historyQuery.currentData}
        historyLoading={
          decisions.historyQuery.isLoading ||
          (decisions.historyQuery.isFetching && !decisions.historyQuery.currentData)
        }
        historyError={decisions.historyQuery.isError}
        onRetryHistory={() => decisions.historyQuery.refetch()}
        navigationDisabled={navigationDisabled || decisions.isBusy}
        hideActions={hideFinalizedActions}
      />
    );

  if (compact && finalizationDialog.value) return finalization;

  return (
    <Card
      id="admission-decision"
      variant={compact ? 'outlined' : undefined}
      sx={
        compact
          ? { border: 0, boxShadow: 'none', bgcolor: 'transparent', borderRadius: 0 }
          : undefined
      }
    >
      <CardContent sx={compact ? { p: 1.5, '&:last-child': { pb: 1.5 } } : undefined}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6" component="h2">
                Admission decision
              </Typography>
              {compact && (
                <CustomTooltip
                  title="Review the saved stage outcomes, then record the admission decision. Approval and journey completion are required before finalizing admission."
                  arrow
                >
                  <IconButton
                    size="small"
                    aria-label="Admission decision information"
                    sx={{ color: 'info.main' }}
                  >
                    <Iconify icon="mdi:information-outline" width={18} />
                  </IconButton>
                </CustomTooltip>
              )}
            </Stack>
            {compact && (
              <Typography variant="body2" color="text.secondary">
                {application.status === 6
                  ? 'Approved. Finalize admission once the journey is complete.'
                  : application.status === 0
                    ? 'Submit the application before recording an admission decision.'
                    : application.status >= 10 || !visibleActions.length
                      ? 'Review the saved admission decision.'
                      : 'Review the application, then choose Approve, Waitlist, or Reject.'}
              </Typography>
            )}
            {!compact && (
              <Typography variant="body2" color="text.secondary">
                Approve, waitlist, or reject this application, then finalize an approved admission
                after its journey is complete.
              </Typography>
            )}
          </Stack>
          {!compact && (
            <Chip
              label={getAdmissionApplicationStatusLabel(application.status)}
              color={getAdmissionApplicationStatusColor(application.status)}
              size="small"
              sx={compact ? { alignSelf: 'flex-start' } : undefined}
            />
          )}
        </Stack>
        <Box
          sx={
            compact
              ? {
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    lg: 'minmax(0, 1fr) minmax(0, 1fr)',
                  },
                  gap: 1.5,
                  mt: 1.5,
                }
              : undefined
          }
        >
          {compact && (
            <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0, boxShadow: 'none' }}>
              <ApplicationDecisionReviewSummary
                application={application}
                workflow={workflow}
                disabled={navigationDisabled || decisions.isBusy}
                onSelectStage={onSelectStage}
              />
            </Paper>
          )}
          <Box
            component={compact ? Paper : 'div'}
            {...(compact ? { variant: 'outlined' as const } : {})}
            sx={compact ? { p: 1.5, minWidth: 0, boxShadow: 'none' } : undefined}
          >
            {compact && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ mb: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider' }}
              >
                <Typography variant="subtitle1" component="h3">
                  Record decision
                </Typography>
                <Chip
                  label={getAdmissionApplicationStatusLabel(application.status)}
                  color={getAdmissionApplicationStatusColor(application.status)}
                  size="small"
                />
              </Stack>
            )}
            <ApplicationDecisionStatus application={application} compact={compact} />
            {compact && visibleActions.length > 0 && (
              <>
                <Typography variant="subtitle2">Choose an outcome</Typography>
                <Typography variant="body2" color="text.secondary">
                  Each decision is recorded in the application history.
                </Typography>
              </>
            )}
            {visibleActions.length > 0 && (
              <ApplicationDecisionActions
                actions={visibleActions}
                busy={disabled || decisions.isBusy}
                compact={compact}
                onSelect={(next) => {
                  setDecisionApplication(application);
                  setAction(next);
                }}
              />
            )}
            {compact && visibleActions.some((item) => item === 'waitlist' || item === 'reject') && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Waitlist and rejection require a reason.
              </Typography>
            )}
            {application.status === 6 && journeyCompleted && canFinalize && (
              <ApplicationFinalizationCallout
                busy={disabled || decisions.isBusy}
                onOpen={finalizationDialog.onTrue}
                compact={compact}
              />
            )}
            {!canDecide && !canFinalize && application.status !== 10 && (
              <Alert severity="info" sx={{ mt: compact ? 1 : 2 }}>
                Decision actions are not available for your role. You can still review the
                application details.
              </Alert>
            )}
            {compact ? (
              <CustomAccordion
                title="Decision history"
                expanded={history.value}
                onChange={history.onToggle}
                content={
                  <ApplicationDecisionHistory
                    isLoading={decisions.historyQuery.isLoading}
                    isError={decisions.historyQuery.isError}
                    data={decisions.historyQuery.data}
                    onRetry={() => decisions.historyQuery.refetch()}
                    compact
                  />
                }
              />
            ) : (
              <ApplicationDecisionHistory
                isLoading={decisions.historyQuery.isLoading}
                isError={decisions.historyQuery.isError}
                data={decisions.historyQuery.data}
                onRetry={() => decisions.historyQuery.refetch()}
              />
            )}
          </Box>
        </Box>
      </CardContent>
      <ApplicationDecisionDialog
        key={action ?? 'closed'}
        open={Boolean(action)}
        action={action}
        application={decisionApplication}
        onReload={() => reloadApplication(application.id).unwrap()}
        busy={disabled || decisions.isBusy}
        onClose={() => setAction(null)}
        onSubmit={(input) =>
          disabled || decisions.isBusy
            ? Promise.resolve(false)
            : decisions.runDecision(action as AdmissionDecisionAction, input)
        }
      />
      {!compact && finalization}
    </Card>
  );
}
