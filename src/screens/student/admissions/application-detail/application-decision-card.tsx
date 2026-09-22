'use client';

import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import Link from 'next/link';
import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { Card, Chip, Alert, Stack, Button, Typography, CardContent } from '@mui/material';
import { useLazyGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';

import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionStatus } from './application-decision-status';
import { ReviewDecisionGuidance } from '../review/review-decision-guidance';
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

type Props = { application: AdmissionApplication; managedOffer?: boolean };
const ACTIONS: AdmissionDecisionAction[] = [
  'review',
  'approve',
  'waitlist',
  'reject',
  'offer',
  'accept',
  'decline',
];

export function ApplicationDecisionCard({ application, managedOffer }: Props) {
  const decisions = useAdmissionApplicationDecisions(application.id, application.status);
  const finalizationDialog = useBoolean();
  const [reloadApplication] = useLazyGetAdmissionApplicationQuery();
  const [action, setAction] = useState<AdmissionDecisionAction | null>(null);
  const [decisionApplication, setDecisionApplication] = useState(application);
  const reaffirmApproval = Boolean(
    application.reviewDecision?.managedReviewEnabled &&
    !application.reviewDecision.isSatisfied &&
    application.reviewDecision.canApprove &&
    [6, 7, 8].includes(application.status)
  );
  const { canDecide, canOffer, canFinalize } = decisions;
  const visibleActions = ACTIONS.filter((item) => {
    if (managedOffer && (item === 'offer' || item === 'accept' || item === 'decline')) return false;
    if (
      !canPerformAdmissionDecision(application.status, item) &&
      !(item === 'approve' && reaffirmApproval)
    )
      return false;
    if (item === 'offer' || item === 'accept' || item === 'decline') return canOffer;
    return canDecide;
  });

  return (
    <Card id="admission-decision">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Admission decision</Typography>
            <Typography variant="body2" color="text.secondary">
              Move this application through review, offer, and admission finalization with an
              auditable history.
            </Typography>
          </Stack>
          <Chip
            label={getAdmissionApplicationStatusLabel(application.status)}
            color={getAdmissionApplicationStatusColor(application.status)}
            size="small"
          />
        </Stack>
        <ApplicationDecisionStatus application={application} />
        <ReviewDecisionGuidance capabilities={application.reviewDecision} />
        {visibleActions.length > 0 && (
          <ApplicationDecisionActions
            actions={visibleActions}
            busy={decisions.isBusy}
            reviewDecision={application.reviewDecision}
            reaffirmApproval={reaffirmApproval}
            onSelect={(next) => {
              setDecisionApplication(application);
              setAction(next);
            }}
          />
        )}
        {application.status === 8 && canFinalize && (
          <ApplicationFinalizationCallout
            application={application}
            busy={decisions.isBusy}
            onOpen={finalizationDialog.onTrue}
          />
        )}
        {application.status === 11 && application.onboardingCaseId ? (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
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
        {!canDecide &&
          !canOffer &&
          !canFinalize &&
          application.status !== 10 &&
          application.status !== 11 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Decision actions are not available for your role. You can still review the application
              details.
            </Alert>
          )}
        <ApplicationDecisionHistory
          isLoading={decisions.historyQuery.isLoading}
          isError={decisions.historyQuery.isError}
          data={decisions.historyQuery.data}
          onRetry={() => decisions.historyQuery.refetch()}
        />
      </CardContent>
      <ApplicationDecisionDialog
        key={action ?? 'closed'}
        open={Boolean(action)}
        action={action}
        application={decisionApplication}
        onReload={() => reloadApplication(application.id).unwrap()}
        busy={decisions.isBusy}
        onClose={() => setAction(null)}
        onSubmit={(input) => decisions.runDecision(action as AdmissionDecisionAction, input)}
      />
      <ApplicationFinalizationDialog
        open={finalizationDialog.value}
        applicantId={application.applicantId}
        busy={decisions.isBusy}
        preview={decisions.finalizationPreviewQuery.data}
        loading={
          decisions.finalizationPreviewQuery.isLoading ||
          decisions.finalizationPreviewQuery.isFetching
        }
        hasError={decisions.finalizationPreviewQuery.isError}
        onRetry={() => decisions.finalizationPreviewQuery.refetch()}
        onClose={finalizationDialog.onFalse}
        onSubmit={(value) => decisions.runFinalization(application.concurrencyStamp, value)}
      />
    </Card>
  );
}
