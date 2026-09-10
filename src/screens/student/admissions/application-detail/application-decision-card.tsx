'use client';

import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Card, Chip, Alert, Stack, Button, Divider, Typography, CardContent } from '@mui/material';

import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionStatus } from './application-decision-status';
import { ApplicationDecisionActions } from './application-decision-actions';
import { ApplicationDecisionHistory } from './application-decision-history';
import { ApplicationFinalizationDialog } from './application-finalization-dialog';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';
import {
  canPerformAdmissionDecision,
  type AdmissionDecisionAction,
  useAdmissionApplicationDecisions,
} from './use-admission-application-decisions';

type Props = { application: AdmissionApplication };
const ACTIONS: AdmissionDecisionAction[] = [
  'review',
  'approve',
  'waitlist',
  'reject',
  'offer',
  'accept',
  'decline',
];

export function ApplicationDecisionCard({ application }: Props) {
  const decisions = useAdmissionApplicationDecisions(application.id, application.status);
  const finalizationDialog = useBoolean();
  const [action, setAction] = useState<AdmissionDecisionAction | null>(null);
  const { canDecide, canOffer, canFinalize } = decisions;
  const visibleActions = ACTIONS.filter((item) => {
    if (!canPerformAdmissionDecision(application.status, item)) return false;
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
        {visibleActions.length > 0 && (
          <ApplicationDecisionActions
            actions={visibleActions}
            busy={decisions.isBusy}
            onSelect={setAction}
          />
        )}
        {application.status === 8 && canFinalize && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              The offer is accepted. Finalize Admissions to link the Student identity and start
              onboarding. Placement and enrollment happen later.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={decisions.isBusy}
              startIcon={<Iconify icon="mdi:school-outline" />}
              onClick={finalizationDialog.onTrue}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Finalize admission
            </Button>
          </>
        )}
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
        open={Boolean(action)}
        action={action}
        application={application}
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
