import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import NextLink from 'next/link';
import { Box, Button } from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

type FeeCollectionOutcomePanelProps = { collectResponse: CollectFeeOutput; onClose?: () => void };

export default function FeeCollectionOutcomePanel({
  collectResponse,
  onClose,
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
        collectResponse.status === 2 ? (
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
          <DetailField label="Receipt number" value={collectResponse.receiptNumber} />
        )}
      </DetailGrid>
      {lines.length > 0 && (
        <CustomizableTable
          tableId="collection-outcome-allocations"
          tableTitle="Payment Allocation"
          columns={[
            { id: 'feeHeadName', label: 'Fee head' },
            { id: 'installmentLabel', label: 'Period' },
            {
              id: 'amountPaid',
              label: 'Paid',
              align: 'right',
              render: (value: number) => formatNumber(value, 'INR'),
            },
            {
              id: 'pendingAfter',
              label: 'Pending after',
              align: 'right',
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
        <Button
          component={NextLink}
          href={auditTrailHref}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:history" width={18} />}
        >
          View in audit trail
        </Button>
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
