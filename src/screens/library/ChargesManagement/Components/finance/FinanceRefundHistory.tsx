import { FormSectionCard } from 'src/components/form-section-card';
import { FeeRefundStatusOptions } from 'src/enums/feeRefund-status-type';
import { Stack, Alert, Button, Pagination, Typography } from '@mui/material';

import { financeAmount } from './FinanceAssessmentSummary';

import type { useLibraryFinanceAccess } from './useLibraryFinanceAccess';
import type { FinanceRefundRecord, FinanceRefundDecision } from './finance-refund-action-types';

export function FinanceRefundHistory({
  rows,
  total,
  page,
  setPage,
  access,
  disabled,
  onAction,
  onReceipt,
}: {
  rows: FinanceRefundRecord[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  access: ReturnType<typeof useLibraryFinanceAccess>;
  disabled: boolean;
  onAction: (decision: FinanceRefundDecision) => void;
  onReceipt: (row: FinanceRefundRecord) => void;
}) {
  return (
    <FormSectionCard
      title="Refund History"
      icon="mdi:history"
      descriptionTooltip="These requests and payments belong to this saved Finance source and billing year. Requested, approved, paid and returned amounts remain separate."
    >
      <Stack spacing={2}>
        {!rows.length && (
          <Typography variant="body2">No refund requests found for this assessment.</Typography>
        )}
        {rows.map((row) => {
          const actions = row.availableActions || [];
          const available = [
            { action: 'approve' as const, label: 'Approve', allowed: access.refundApprove },
            { action: 'reject' as const, label: 'Reject', allowed: access.refundReject },
            {
              action: 'recordPayout' as const,
              label: 'Record payment',
              allowed: access.refundProcess,
            },
            {
              action: 'returnPayout' as const,
              label: 'Return payout',
              allowed: access.refundReverse,
            },
          ].filter((item) => item.allowed && actions.includes(item.action));
          return (
            <Stack key={row.id} spacing={1} sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
              <Typography variant="subtitle2">{row.voucherNumber}</Typography>
              <Typography variant="body2">
                {row.payerName || row.studentName || 'Payer name not recorded'} ·{' '}
                {row.academicYearName || 'Recorded assessment year'}
              </Typography>
              <Typography variant="body2">
                {FeeRefundStatusOptions.find((status) => status.value === row.status)?.label ||
                  'Status unavailable'}
              </Typography>
              <Typography variant="body2">
                Original receipt: {row.originalReceiptNumber || 'Not recorded'}
              </Typography>
              <Typography variant="body2">
                Requested: {financeAmount(row.totalAmount, row.currency)} · Approved:{' '}
                {financeAmount(row.approvedAmount, row.currency)}
              </Typography>
              <Typography variant="body2">
                Payment recorded: {financeAmount(row.processedAmount, row.currency)} · Returned:{' '}
                {financeAmount(row.reversedAmount, row.currency)}
              </Typography>
              {row.reason && <Typography variant="body2">{row.reason}</Typography>}
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {available.map((item) => (
                  <Button
                    key={item.action}
                    size="small"
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => onAction({ id: row.id, action: item.action })}
                  >
                    {item.label}
                  </Button>
                ))}
                {access.refundView && row.processedAmount > 0 && (
                  <Button size="small" disabled={disabled} onClick={() => onReceipt(row)}>
                    Refund receipt
                  </Button>
                )}
              </Stack>
              {row.status === 6 && (
                <Alert severity="info">
                  This recorded recovery state requires Finance review. No new payment is started
                  here.
                </Alert>
              )}
            </Stack>
          );
        })}
        {total > 10 && (
          <Pagination
            page={page + 1}
            count={Math.ceil(total / 10)}
            disabled={disabled}
            onChange={(_, value) => setPage(value - 1)}
          />
        )}
      </Stack>
    </FormSectionCard>
  );
}
