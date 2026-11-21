import { useState, useCallback } from 'react';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import RefundReceiptDialog from 'src/screens/finance/feeRefund/Components/RefundReceiptDialog';

import { FinanceRefundHistory } from './FinanceRefundHistory';
import { useFinanceRefundData } from './useFinanceRefundData';
import { useLibraryFinanceAccess } from './useLibraryFinanceAccess';
import { FinanceRefundRequestForm } from './FinanceRefundRequestForm';
import { FinanceRefundSelectedAction } from './FinanceRefundSelectedAction';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceRefundRecord, FinanceRefundDecision } from './finance-refund-action-types';

export function FinanceRefundPanel(props: FinanceActionProps) {
  const { onBusyChange, onDirtyChange, disabled } = props;
  const access = useLibraryFinanceAccess();
  const state = useFinanceRefundData(props, access.refundAdd);
  const [decision, setDecision] = useState<FinanceRefundDecision | null>(null);
  const [receipt, setReceipt] = useState<FinanceRefundRecord | null>(null);
  const [requestOpen, setRequestOpen] = useState(access.refundAdd);
  const [childBusy, setChildBusy] = useState(false);
  const [childDirty, setChildDirty] = useState(false);
  const busy = useCallback(
    (value: boolean) => {
      setChildBusy(value);
      onBusyChange(value);
    },
    [onBusyChange]
  );
  const dirty = useCallback(
    (value: boolean) => {
      setChildDirty(value);
      onDirtyChange?.(value);
    },
    [onDirtyChange]
  );
  const completed = () => {
    setDecision(null);
    setRequestOpen(false);
    busy(false);
    dirty(false);
    if (state.form.isSuccess) state.form.refetch();
    if (state.history.isSuccess) state.history.refetch();
  };
  if (!access.refundView)
    return (
      <Alert severity="warning">
        Refund view access is required to open this source’s refund history.
      </Alert>
    );
  if (state.assessment.isError)
    return (
      <Alert severity="error">
        {parseApiProblemDetail(state.assessment.error).detail} Reopen the assessment to retry.
      </Alert>
    );
  if (state.linkIssue) return <Alert severity="warning">{state.linkIssue}</Alert>;
  if (!state.linkId || !state.year)
    return <Typography role="status">Loading the saved refund source...</Typography>;
  const locked = disabled || childBusy || childDirty;
  const childProps = { ...props, onBusyChange: busy, onDirtyChange: dirty };
  return (
    <Stack spacing={2}>
      {decision ? (
        <FinanceRefundSelectedAction
          {...childProps}
          decision={decision}
          linkId={state.linkId}
          year={state.year}
          onComplete={completed}
          onClose={() => setDecision(null)}
        />
      ) : (
        <>
          {access.refundAdd && !requestOpen && (
            <Button disabled={locked} onClick={() => setRequestOpen(true)}>
              Request refund
            </Button>
          )}
          {requestOpen &&
            access.refundAdd &&
            (state.form.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => state.form.refetch()}>Retry form</Button>}
              >
                {parseApiProblemDetail(state.form.error).detail}
              </Alert>
            ) : state.form.currentData ? (
              <FinanceRefundRequestForm
                {...childProps}
                data={state.form.currentData}
                refreshing={state.form.isFetching}
                onCreated={completed}
              />
            ) : (
              <Typography role="status">Loading the recorded refund policy...</Typography>
            ))}
          {state.history.isError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => state.history.refetch()}>Retry history</Button>}
            >
              {parseApiProblemDetail(state.history.error).detail}
            </Alert>
          ) : state.history.isFetching ? (
            <Typography role="status">Loading refund history...</Typography>
          ) : (
            state.history.currentData && (
              <FinanceRefundHistory
                rows={state.history.currentData.items}
                total={state.history.currentData.totalCount}
                page={state.page}
                setPage={state.setPage}
                access={access}
                disabled={locked}
                onAction={(value) => {
                  setRequestOpen(false);
                  setDecision(value);
                }}
                onReceipt={setReceipt}
              />
            )
          )}
        </>
      )}
      {receipt && (
        <RefundReceiptDialog
          refundId={receipt.id}
          provisional={receipt.processedAmount <= 0}
          onClose={() => setReceipt(null)}
        />
      )}
    </Stack>
  );
}
