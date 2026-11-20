import { useState, useEffect } from 'react';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetFeeRefundByIdQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';

import { useLibraryFinanceAccess } from './useLibraryFinanceAccess';
import { FinanceRefundActionForm } from './FinanceRefundActionForm';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceRefundDecision } from './finance-refund-action-types';

export function FinanceRefundSelectedAction({
  decision,
  linkId,
  year,
  onComplete,
  onClose,
  ...props
}: FinanceActionProps & {
  decision: FinanceRefundDecision;
  linkId: string;
  year: string;
  onComplete: () => void;
  onClose: () => void;
}) {
  const detail = useGetFeeRefundByIdQuery(decision.id, { refetchOnMountOrArgChange: true });
  const access = useLibraryFinanceAccess();
  const row = detail.currentData;
  const [openedId, setOpenedId] = useState<string | null>(null);
  useEffect(() => {
    if (row && !detail.isFetching && !detail.isError) setOpenedId(decision.id);
  }, [row, detail.isFetching, detail.isError, decision.id]);
  const granted = {
    approve: access.refundApprove,
    reject: access.refundReject,
    recordPayout: access.refundProcess,
    returnPayout: access.refundReverse,
  }[decision.action];
  if (detail.isError)
    return (
      <Alert
        severity="error"
        action={<Button onClick={() => detail.refetch()}>Retry request</Button>}
      >
        {parseApiProblemDetail(detail.error).detail}
      </Alert>
    );
  if (!row || openedId !== decision.id)
    return <Typography role="status">Loading the saved refund request...</Typography>;
  if (
    !granted ||
    row.financeExternalSourceLinkId !== linkId ||
    row.academicYearId !== year ||
    !row.availableActions?.includes(decision.action)
  )
    return (
      <Stack spacing={1}>
        <Alert severity="warning">
          This action is no longer available for the selected source and saved assessment year.
        </Alert>
        <Button onClick={onClose}>Back to refund history</Button>
      </Stack>
    );
  return (
    <FinanceRefundActionForm
      {...props}
      disabled={props.disabled || detail.isFetching}
      row={row}
      action={decision.action}
      onComplete={onComplete}
      onClose={onClose}
      onCheckStatus={async () => {
        const result = await detail.refetch();
        if (!result.error) onComplete();
      }}
    />
  );
}
