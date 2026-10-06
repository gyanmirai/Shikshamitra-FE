import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { useGetAdmissionPaymentStageQuery } from 'src/redux/student/admissions/admission-payment-api';
import {
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { PaymentTransactions } from './payment-transactions';
import { PaymentActionDialog } from './payment-action-dialog';
import { useApplicationPayment } from './use-application-payment';
import AdmissionFeeSelectionPanel, {
  useFeeSelectionEditorState,
} from '../fee-selection/admission-fee-selection-panel';

import type { AdmissionFeeSelectionEditorState } from '../fee-selection/admission-fee-selection-editor';

type Props = {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  onFeeSelectionStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
};
const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' =>
  status === 'settled' || status === 'waived'
    ? 'success'
    : status === 'overdue'
      ? 'error'
      : status === 'partial' || status.startsWith('pending')
        ? 'warning'
        : 'default';

export function ApplicationPaymentStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  onFeeSelectionStateChange,
}: Props) {
  const query = useGetAdmissionPaymentStageQuery({ applicationId, stageId: stage.id });
  const feeEditor = useFeeSelectionEditorState(onFeeSelectionStateChange);
  const state = query.data;
  const actions = useApplicationPayment(
    applicationId,
    stage.id,
    state?.concurrencyStamp ?? '',
    canAdvance && !advancing && !feeEditor.blocked,
    onComplete
  );
  if (query.isLoading)
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Skeleton height={120} />
      </Card>
    );
  if (query.isError || !state)
    return (
      <Alert severity="error">
        Payment details could not be loaded. Refresh before continuing.
      </Alert>
    );
  const percentage =
    state.requiredAmount > 0
      ? Math.min(100, (state.settledAmount / state.requiredAmount) * 100)
      : 0;
  return (
    <>
      <AdmissionFeeSelectionPanel
        applicationId={applicationId}
        outlined
        onEditorStateChange={feeEditor.update}
      />
      {feeEditor.blocked && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Save or discard your fee selection before recording payment or completing this step.
        </Alert>
      )}
      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack>
              <Typography variant="h6">
                {state.policy?.purposeName ?? 'Admission payment'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment is kept with the admission record and can be verified independently.
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={state.status.replace(/([A-Z])/g, ' $1')}
              color={statusColor(state.status)}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Stack flex={1}>
              <Typography variant="caption" color="text.secondary">
                Required
              </Typography>
              <Typography variant="h6">
                {state.currency} {Math.ceil(state.requiredAmount).toLocaleString('en-IN')}
              </Typography>
            </Stack>
            <Stack flex={1}>
              <Typography variant="caption" color="text.secondary">
                Settled
              </Typography>
              <Typography variant="h6" color="success.main">
                {state.currency} {Math.ceil(state.settledAmount).toLocaleString('en-IN')}
              </Typography>
            </Stack>
            <Stack flex={1}>
              <Typography variant="caption" color="text.secondary">
                Outstanding
              </Typography>
              <Typography variant="h6">
                {state.currency} {Math.ceil(state.outstandingAmount).toLocaleString('en-IN')}
              </Typography>
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={state.canComplete ? 'success' : 'primary'}
            sx={{ height: 7, borderRadius: 1 }}
          />
          {state.dueAt && (
            <Typography variant="caption" color={state.isOverdue ? 'error' : 'text.secondary'}>
              {state.isOverdue ? 'Overdue since' : 'Due'}{' '}
              {new Date(state.dueAt).toLocaleDateString()}
            </Typography>
          )}
          {state.blockers.map((blocker) => (
            <Alert key={blocker} severity="warning">
              {blocker}
            </Alert>
          ))}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {state.canRecord && (
              <Button
                size="small"
                variant="contained"
                disabled={feeEditor.blocked}
                startIcon={<Iconify icon="mdi:cash-plus" />}
                onClick={() => actions.open('record')}
              >
                Record payment
              </Button>
            )}
            {state.canWaive && (
              <Button
                size="small"
                variant="outlined"
                disabled={feeEditor.blocked}
                onClick={() => actions.open('waive')}
              >
                Record waiver
              </Button>
            )}
            {state.canComplete && (
              <Button
                size="small"
                variant="contained"
                disabled={!canAdvance || advancing || feeEditor.blocked}
                onClick={() => onComplete()}
              >
                Continue
              </Button>
            )}
          </Stack>
          <PaymentTransactions
            items={state.transactions}
            active={state.isActive && !feeEditor.blocked}
            onVerify={(item) => actions.open('verify', item)}
            onReject={(item) => actions.open('reject', item)}
            onReverse={(item) => actions.open('reverse', item)}
          />
        </Stack>
      </Card>
      <PaymentActionDialog
        action={actions.action}
        state={state}
        busy={actions.busy}
        onClose={actions.close}
        onSubmit={(value) => (feeEditor.blocked ? Promise.resolve() : actions.submit(value))}
      />
    </>
  );
}
