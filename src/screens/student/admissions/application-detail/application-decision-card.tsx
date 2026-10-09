'use client';

import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import CustomAccordion from 'src/components/custom-accordian';
import { Card, Chip, Alert, Stack, Button, Typography, CardContent } from '@mui/material';
import { useLazyGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';

import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionStatus } from './application-decision-status';
import { ApplicationDecisionActions } from './application-decision-actions';
import { ApplicationDecisionHistory } from './application-decision-history';
import { ApplicationFinalizationDialog } from './application-finalization-dialog';
import { ApplicationFinalizationCallout } from './application-finalization-callout';
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
  onBusyChange?: (busy: boolean) => void;
};
const ACTIONS: AdmissionDecisionAction[] = ['approve', 'waitlist', 'reject'];

export function ApplicationDecisionCard({
  application,
  journeyCompleted,
  compact = false,
  disabled = false,
  onBusyChange,
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
  const visibleActions = ACTIONS.filter(
    (item) => canDecide && canPerformAdmissionDecision(application.status, item)
  );

  return (
    <Card
      id="admission-decision"
      variant={compact ? 'outlined' : undefined}
      sx={compact ? { borderRadius: 1 } : undefined}
    >
      <CardContent sx={compact ? { p: 1.5, '&:last-child': { pb: 1.5 } } : undefined}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.5}>
            <Typography variant={compact ? 'subtitle2' : 'h6'}>Admission decision</Typography>
            {compact && (
              <Typography variant="body2" color="text.secondary">
                {application.status === 6
                  ? 'Approved. Finalize admission once the journey is complete.'
                  : application.status >= 10
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
          <Chip
            label={getAdmissionApplicationStatusLabel(application.status)}
            color={getAdmissionApplicationStatusColor(application.status)}
            size="small"
            sx={compact ? { alignSelf: 'flex-start' } : undefined}
          />
        </Stack>
        <ApplicationDecisionStatus application={application} compact={compact} />
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
        {application.status === 6 && journeyCompleted && canFinalize && (
          <ApplicationFinalizationCallout
            busy={disabled || decisions.isBusy}
            onOpen={finalizationDialog.onTrue}
            compact={compact}
          />
        )}
        {application.status === 11 && application.onboardingCaseId ? (
          <Alert
            severity="success"
            sx={{ mt: compact ? 1 : 2 }}
            action={
              <Button
                component={Link}
                color="inherit"
                size="small"
                href={`${studentPaths.onboarding.setup}?search=${encodeURIComponent(application.applicationNumber)}`}
              >
                Continue onboarding
              </Button>
            }
          >
            Admission is finalized. The student&apos;s durable onboarding case is ready for
            placement, identifiers, readiness checks, and activation.
          </Alert>
        ) : null}
        {!canDecide && !canFinalize && application.status !== 10 && application.status !== 11 && (
          <Alert severity="info" sx={{ mt: compact ? 1 : 2 }}>
            Decision actions are not available for your role. You can still review the application
            details.
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
      <ApplicationFinalizationDialog
        open={finalizationDialog.value}
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
    </Card>
  );
}
