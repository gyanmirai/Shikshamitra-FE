import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import CustomizableTable from 'src/components/customizabaleTable';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

type FeeCollectionOutcomePanelProps = {
  collectResponse: CollectFeeOutput;
  onClose?: () => void;
  showAuditTrail?: boolean;
  receiptAccessUnavailable?: boolean;
};

export default function FeeCollectionOutcomePanel({
  collectResponse,
  onClose,
  showAuditTrail = true,
  receiptAccessUnavailable = false,
}: FeeCollectionOutcomePanelProps) {
  const summary = collectResponse.auditSummary;
  const lines = summary?.allocationLines ?? [];
  const auditTrailHref = collectResponse.correlationId
    ? `/finance/audit-trail?studentId=${
        collectResponse.studentId
      }&correlationId=${encodeURIComponent(collectResponse.correlationId)}`
    : `/finance/audit-trail?studentId=${collectResponse.studentId}`;
  return (
    <DetailSection
      title={summary?.headline ?? 'Payment recorded'}
      icon="mdi:clipboard-check-outline"
      action={
        collectResponse.status === FeeCollectionStatusType.InReconciliation ? (
          <Label color="warning">Pending verification</Label>
        ) : undefined
      }
    >
      <DetailGrid>
        <DetailField
          label="Total received"
          value={formatNumber(summary?.totalAmount ?? collectResponse.receivedAmount, 'INR')}
        />
        {collectResponse.receiptNumber && (
          <DetailField label="Collection reference" value={collectResponse.receiptNumber} />
        )}
      </DetailGrid>
      <Typography variant="body2" color="text.secondary">
        {collectResponse.feeReceiptId && collectResponse.chargeReceiptId
          ? 'Two receipts generated: fees and charges.'
          : 'One receipt generated.'}
        {collectResponse.status === FeeCollectionStatusType.InReconciliation &&
          (collectResponse.feeReceiptId && collectResponse.chargeReceiptId
            ? ' Reconciliation shows two entries for this payment, verified together.'
            : ' Reconciliation shows one entry for this payment.')}
      </Typography>
      {receiptAccessUnavailable && (
        <Typography variant="body2" color="text.secondary">
          Payment recorded. Receipt access is unavailable for your account.
        </Typography>
      )}
      {lines.length > 0 && (
        <CustomizableTable
          tableId="collection-outcome-allocations"
          tableTitle="Payment Allocation"
          columns={[
            { id: 'feeHeadName', label: 'Fee head' },
            { id: 'installmentLabel', label: 'Period' },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'amountPaid',
              label: 'Paid',
              filterType: 'number',
              align: 'left',
              render: (value: number) => formatNumber(value, 'INR'),
            },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'pendingAfter',
              label: 'Pending after',
              filterType: 'number',
              align: 'left',
              render: (value: number) => formatNumber(value, 'INR'),
            },
          ]}
          data={lines}
          isSearch={false}
          isFilter={false}
          isPagination={false}
          isShowedDense={false}
          showToolbar={false}
          wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
          tableContainerProps={{ sx: { height: 'auto' } }}
        />
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {showAuditTrail && collectResponse.studentId && (
          <Button
            component={NextLink}
            href={auditTrailHref}
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:history" width={18} />}
          >
            View in audit trail
          </Button>
        )}
        {onClose && (
          <Button
            startIcon={<Iconify icon="mdi:close" />}
            size="small"
            variant="text"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </Box>
    </DetailSection>
  );
}
