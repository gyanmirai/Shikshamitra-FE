'use client';

import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Typography,
  CardContent,
} from '@mui/material';

import { ApplicationDecisionDialog } from './application-decision-dialog';
import { ApplicationDecisionActions } from './application-decision-actions';
import { ApplicationDecisionHistory } from './application-decision-history';
import { ApplicationEnrollmentDialog } from './application-enrollment-dialog';
import { formatWorkflowDateTime } from '../workflow-list/workflow-list-format';
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
  const enrollmentDialog = useBoolean();
  const [action, setAction] = useState<AdmissionDecisionAction | null>(null);
  const { canDecide, canOffer, canEnroll } = decisions;
  const visibleActions = ACTIONS.filter((item) => {
    if (!canPerformAdmissionDecision(application.status, item)) return false;
    if (item === 'offer' || item === 'accept' || item === 'decline') return canOffer;
    return canDecide;
  });

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Admission decision</Typography>
            <Typography variant="body2" color="text.secondary">
              Move this application through review, offer, and enrollment with an auditable history.
            </Typography>
          </Stack>
          <Chip
            label={getAdmissionApplicationStatusLabel(application.status)}
            color={getAdmissionApplicationStatusColor(application.status)}
            size="small"
          />
        </Stack>
        {application.decisionReason && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Latest note: {application.decisionReason}
          </Alert>
        )}
        {application.offerExpiresAt && application.status === 7 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Offer expires {formatWorkflowDateTime(application.offerExpiresAt)}.
          </Alert>
        )}
        {application.status === 10 && application.enrolledStudentId && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Enrolled student record: {application.enrolledStudentId}
          </Alert>
        )}
        {visibleActions.length > 0 && (
          <ApplicationDecisionActions
            actions={visibleActions}
            busy={decisions.isBusy}
            onSelect={setAction}
          />
        )}
        {application.status === 8 && canEnroll && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              The offer is accepted. Select a division and create the operational student enrollment record.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={decisions.isBusy}
              startIcon={<Iconify icon="mdi:school-outline" />}
              onClick={enrollmentDialog.onTrue}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Complete enrollment
            </Button>
          </>
        )}
        {!canDecide && !canOffer && !canEnroll && application.status !== 10 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Decision actions are not available for your role. You can still review the application details.
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
      <ApplicationEnrollmentDialog
        open={enrollmentDialog.value}
        busy={decisions.isBusy}
        options={decisions.enrollmentOptionsQuery.data}
        loading={
          decisions.enrollmentOptionsQuery.isLoading || decisions.enrollmentOptionsQuery.isFetching
        }
        hasError={decisions.enrollmentOptionsQuery.isError}
        onRetry={() => decisions.enrollmentOptionsQuery.refetch()}
        onClose={enrollmentDialog.onFalse}
        onSubmit={(divisionId) =>
          decisions.runEnrollment(application.concurrencyStamp, divisionId)
        }
      />
    </Card>
  );
}
