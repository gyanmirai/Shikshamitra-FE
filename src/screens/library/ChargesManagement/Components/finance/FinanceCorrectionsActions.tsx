import { Stack, Alert, Button, Typography } from '@mui/material';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import { FinanceWaiverPanel } from './FinanceWaiverPanel';
import { FinanceRefundPanel } from './FinanceRefundPanel';

import type { useFinanceCashier, FinanceCorrectionAction } from './useFinanceCashier';

export function FinanceCorrectionsActions({
  state,
}: {
  state: ReturnType<typeof useFinanceCashier>;
}) {
  const { source, access, correctionAction, correctionNavigationLocked, selectCorrection } = state;
  if (!source) return null;
  const choices = [
    { action: FinanceWaiverAction.Apply, label: 'Request waiver', allowed: access.waiverApply },
    { action: FinanceWaiverAction.Approve, label: 'Review waivers', allowed: access.waiverApprove },
    { action: FinanceWaiverAction.Reject, label: 'Reject waivers', allowed: access.waiverReject },
    { action: FinanceWaiverAction.Reverse, label: 'Reverse waiver', allowed: access.waiverReverse },
    { action: 'refund' as const, label: 'Refunds', allowed: access.refundView },
  ];
  const active = choices.find((choice) => choice.action === correctionAction);
  const refundActionOnly =
    !access.refundView &&
    (access.refundAdd ||
      access.refundApprove ||
      access.refundReject ||
      access.refundProcess ||
      access.refundReverse);
  if (!choices.some((choice) => choice.allowed) && !active && !refundActionOnly) return null;
  const choose = (action: FinanceCorrectionAction) => {
    if (correctionNavigationLocked) return;
    if (action === null || choices.some((choice) => choice.action === action && choice.allowed))
      selectCorrection(action);
  };
  const panelProps = {
    source,
    disabled: state.blocked('corrections') || active?.allowed !== true,
    onChanged: state.changed,
    ...state.callbacks.corrections,
  };
  return (
    <Stack spacing={2}>
      {correctionAction === null ? (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {choices
            .filter((choice) => choice.allowed)
            .map((choice) => (
              <Button
                key={choice.action}
                type="button"
                size="small"
                variant="outlined"
                disabled={correctionNavigationLocked || state.opened.query.isError}
                onClick={() => choose(choice.action)}
              >
                {choice.label}
              </Button>
            ))}
        </Stack>
      ) : (
        <>
          <Button
            type="button"
            size="small"
            variant="text"
            disabled={correctionNavigationLocked}
            onClick={() => choose(null)}
          >
            Back to Finance actions
          </Button>
          {active?.allowed !== true && (
            <Alert severity="warning">Your access to this action has changed.</Alert>
          )}
          {correctionAction === 'refund' ? (
            <FinanceRefundPanel {...panelProps} />
          ) : (
            <FinanceWaiverPanel key={correctionAction} {...panelProps} action={correctionAction} />
          )}
        </>
      )}
      {correctionNavigationLocked && (
        <Typography variant="caption" color="text.secondary">
          Complete or clear the current draft before changing Finance actions.
        </Typography>
      )}
      {refundActionOnly && (
        <Typography variant="body2" color="text.secondary">
          Refund viewing access is required to open refund history.
        </Typography>
      )}
    </Stack>
  );
}
