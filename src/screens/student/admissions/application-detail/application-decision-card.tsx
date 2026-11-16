'use client';

import type {
  AdmissionApplication,
  AdmissionFinalizationResult,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import { useRef, useState, useEffect, useCallback } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Box, Card, Chip, Paper, Stack, IconButton, Typography, CardContent } from '@mui/material';
import { useLazyGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';

import { ApplicationDecisionForm } from './application-decision-form';
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
  onDirtyChange?: (dirty: boolean) => void;
  workflow?: AdmissionApplicationWorkflow;
  onSelectStage?: (stageId: string) => void;
  onFinalizationOpenChange?: (open: boolean) => void;
  hideFinalizedActions?: boolean;
  onPrepareFinalization?: () => Promise<boolean>;
  onFinalized?: (result: AdmissionFinalizationResult) => void;
};
const ACTIONS: AdmissionDecisionAction[] = ['approve', 'waitlist', 'reject'];

export function ApplicationDecisionCard({
  application,
  journeyCompleted,
  compact = false,
  disabled = false,
  navigationDisabled = disabled,
  onBusyChange,
  onDirtyChange,
  workflow,
  onSelectStage,
  onFinalizationOpenChange,
  hideFinalizedActions = false,
  onPrepareFinalization,
  onFinalized,
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
  const [preparingFinalization, setPreparingFinalization] = useState(false);
  const [decisionFormBusy, setDecisionFormBusy] = useState(false);
  const [inlineDraftDirty, setInlineDraftDirty] = useState(false);
  const onDecisionDirtyChange = useCallback(
    (dirty: boolean) => {
      setInlineDraftDirty(dirty);
      onDirtyChange?.(dirty);
    },
    [onDirtyChange]
  );
  const [preparationError, setPreparationError] = useState(false);
  const preparingRef = useRef(false);
  const { canDecide, canFinalize } = decisions;
  useEffect(() => {
    onBusyChange?.(decisions.isBusy || preparingFinalization || decisionFormBusy);
  }, [decisions.isBusy, preparingFinalization, decisionFormBusy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    onFinalizationOpenChange?.(compact && finalizationDialog.value && application.status !== 11);
  }, [compact, finalizationDialog.value, application.status, onFinalizationOpenChange]);
  useEffect(() => () => onFinalizationOpenChange?.(false), [onFinalizationOpenChange]);
  const visibleActions = ACTIONS.filter(
    (item) => canDecide && canPerformAdmissionDecision(application.status, item)
  );
  // Approved cases keep the guarded change-decision dialog beside finalization.
  const inlineDecision = compact && (application.status !== 6 || inlineDraftDirty);
  const openFinalization = async () => {
    if (preparingRef.current) return;
    finalizationDialog.onTrue();
    setPreparationError(false);
    if (journeyCompleted) return;
    if (!onPrepareFinalization) {
      setPreparationError(true);
      return;
    }
    preparingRef.current = true;
    setPreparingFinalization(true);
    try {
      setPreparationError(!(await onPrepareFinalization()));
    } catch {
      setPreparationError(true);
    } finally {
      preparingRef.current = false;
      setPreparingFinalization(false);
    }
  };

  const finalization = (
    <ApplicationFinalizationDialog
      open={finalizationDialog.value}
      presentation={compact ? 'inline' : 'dialog'}
      application={application}
      applicationId={application.id}
      applicantId={application.applicantId}
      busy={disabled || decisions.isBusy || preparingFinalization}
      preview={decisions.finalizationPreviewQuery.data}
      loading={
        preparingFinalization ||
        decisions.finalizationPreviewQuery.isLoading ||
        decisions.finalizationPreviewQuery.isFetching
      }
      hasError={
        !preparingFinalization &&
        ((preparationError && !journeyCompleted) || decisions.finalizationPreviewQuery.isError)
      }
      onRetry={() => {
        setPreparationError(false);
        if (!journeyCompleted) openFinalization();
        else decisions.finalizationPreviewQuery.refetch();
      }}
      onClose={finalizationDialog.onFalse}
      onFormCorrected={() => {
        decisions.resetFinalizationRequest();
        decisions.finalizationPreviewQuery.refetch();
      }}
      onSubmit={(value) =>
        disabled || decisions.isBusy
          ? Promise.resolve(false)
          : decisions.runFinalization(application.concurrencyStamp, value, onFinalized)
      }
    />
  );

  if (application.status === 11 && !inlineDraftDirty)
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

  const decisionHistory = compact ? (
    <CustomAccordion
      title="Decision History"
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
  );

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
                Admission Decision
              </Typography>
              {compact && (
                <CustomTooltip
                  title="Review the Saved Stage Outcomes, Then Record the Admission Decision. Approval and Journey Completion Are Required Before Finalizing Admission."
                  arrow
                >
                  <IconButton
                    size="small"
                    aria-label="Admission Decision Information"
                    sx={{ color: 'info.main' }}
                  >
                    <Iconify icon="mdi:information-outline" width={18} />
                  </IconButton>
                </CustomTooltip>
              )}
            </Stack>
            {compact && (application.status === 6 || !visibleActions.length) && (
              <Typography variant="body2" color="text.secondary">
                {application.status === 6
                  ? 'Approved. Finalize Admission Once the Journey Is Complete.'
                  : application.status === 0
                    ? 'Submit the Application Before Recording an Admission Decision.'
                    : application.status >= 10 || !visibleActions.length
                      ? 'Review the Saved Admission Decision.'
                      : 'Review the Application, Then Choose Approve, Waitlist, or Reject.'}
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
                  alignItems: 'start',
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
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="subtitle1" component="h3">
                    Record Decision
                  </Typography>
                  <InfoTooltipIcon
                    label="Record Decision Information"
                    title="Choose an outcome, then record the decision. Waitlist and rejection require a reason. Each decision is saved in the application history."
                  />
                </Stack>
                <Chip
                  label={getAdmissionApplicationStatusLabel(application.status)}
                  color={getAdmissionApplicationStatusColor(application.status)}
                  size="small"
                />
              </Stack>
            )}
            <ApplicationDecisionStatus application={application} compact={compact} />
            {inlineDecision && (visibleActions.length > 0 || inlineDraftDirty) && (
              <ApplicationDecisionForm
                key={application.id}
                application={application}
                actions={visibleActions}
                busy={disabled || decisions.isBusy}
                onBusyChange={setDecisionFormBusy}
                onDirtyChange={onDecisionDirtyChange}
                onReload={() => reloadApplication(application.id).unwrap()}
                onSubmit={async (next, input) => {
                  if (decisions.isBusy || !visibleActions.includes(next)) return false;
                  const success = await decisions.runDecision(next, input);
                  if (success && next === 'approve') openFinalization();
                  return success;
                }}
              >
                {decisionHistory}
              </ApplicationDecisionForm>
            )}
            {!inlineDecision && visibleActions.length > 0 && (
              <ApplicationDecisionActions
                actions={visibleActions}
                busy={disabled || decisions.isBusy}
                onSelect={(next) => {
                  setDecisionApplication(application);
                  setAction(next);
                }}
              />
            )}
            {application.status === 6 &&
              canFinalize &&
              (journeyCompleted || onPrepareFinalization) && (
                <ApplicationFinalizationCallout
                  busy={disabled || decisions.isBusy || inlineDraftDirty}
                  onOpen={() => {
                    openFinalization();
                  }}
                  compact={compact}
                />
              )}
            {!canDecide && !canFinalize && application.status !== 10 && (
              <StudentFeedback
                notificationKey="STU-0185"
                presentation="inline"
                severity="info"
                sx={{ mt: compact ? 1 : 2 }}
              >
                Decision actions are not available for your role. You can still review the
                application details.
              </StudentFeedback>
            )}
            {(!inlineDecision || (visibleActions.length === 0 && !inlineDraftDirty)) &&
              decisionHistory}
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
        onSubmit={async (input) => {
          if (disabled || decisions.isBusy) return false;
          const success = await decisions.runDecision(action as AdmissionDecisionAction, input);
          if (success && action === 'approve') openFinalization();
          return success;
        }}
      />
      {!compact && finalization}
    </Card>
  );
}
