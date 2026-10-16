import type { FeeReceiptDetail, ChargeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

import { paymentReceiptSummary } from './paymentReceiptSummary';

interface UnifiedReceiptDisplayProps {
  feeReceipt: FeeReceiptDetail | undefined;
  chargeReceipt: ChargeReceiptDetail | undefined;
  feeIsLoading: boolean;
  chargeIsLoading: boolean;
  feeBlobUrl: string | null;
  chargeBlobUrl: string | null;
  onOpenFeeInNewTab: () => void;
  onDownloadFee: () => void;
  onOpenChargeInNewTab: () => void;
  onDownloadCharge: () => void;
}

export default function UnifiedReceiptDisplay({
  feeReceipt,
  chargeReceipt,
  feeIsLoading,
  chargeIsLoading,
  feeBlobUrl,
  chargeBlobUrl,
  onOpenFeeInNewTab,
  onDownloadFee,
  onOpenChargeInNewTab,
  onDownloadCharge,
}: UnifiedReceiptDisplayProps) {
  const renderReceipt = (isFee: boolean) => {
    const receipt = isFee ? feeReceipt : chargeReceipt;
    const isLoading = isFee ? feeIsLoading : chargeIsLoading;
    const blobUrl = isFee ? feeBlobUrl : chargeBlobUrl;
    const name = isFee ? 'Fee' : 'Charge';
    if (!receipt && !isLoading) return null;
    const paidLines = isFee
      ? feeReceipt?.paidFeeHeads?.map((h) => ({ name: h.feeHeadName, amount: h.amountPaid }))
      : chargeReceipt?.paidCharges?.map((c) => ({ name: c.chargeName, amount: c.amountPaid }));
    return (
      <DetailSection title={`${name} Receipt`} icon="mdi:receipt-text-outline">
        {isLoading ? (
          <Stack spacing={1} role="status" aria-label={`Loading ${name.toLowerCase()} receipt`}>
            <Skeleton height={60} />
            <Skeleton height={160} />
          </Stack>
        ) : (
          receipt && (
            <Stack spacing={2}>
              <DetailGrid>
                <DetailField label="Receipt number" value={receipt.receiptNumber} />
                <DetailField
                  label="Amount received"
                  value={formatNumber(receipt.totalAmount, 'INR')}
                />
                <DetailField
                  label="Collected at"
                  value={receipt.collectedAt ? fDateTime(receipt.collectedAt) : null}
                />
              </DetailGrid>
              {!!paidLines?.length && (
                <CustomizableTable
                  tableId={isFee ? 'collected-fee-receipt-heads' : 'collected-charge-receipt-lines'}
                  tableTitle={isFee ? 'Paid Fee Heads' : 'Paid Charges'}
                  columns={[
                    { id: 'name', label: isFee ? 'Fee head' : 'Charge name' },
                    {
                      id: 'amount',
                      label: 'Amount',
                      align: 'right',
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={paidLines}
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  isShowedDense={false}
                  showToolbar={false}
                  wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                />
              )}
              {isFee && !!feeReceipt?.allocationDetails?.length && (
                <>
                  <Typography component="h3" variant="subtitle2">
                    Allocation Details
                  </Typography>
                  <CustomizableTable
                    tableId="collected-receipt-allocations"
                    tableTitle="Allocation Details"
                    columns={[
                      { id: 'feeHeadName', label: 'Fee head' },
                      {
                        id: 'installmentLabel',
                        label: 'Installment',
                        render: (value) => value || '—',
                      },
                      ...['pendingBefore', 'amountPaid', 'pendingAfter'].map((id) => ({
                        id,
                        label:
                          id === 'pendingBefore'
                            ? 'Pending before'
                            : id === 'amountPaid'
                              ? 'Paid'
                              : 'Pending after',
                        align: 'right' as const,
                        render: (value: number) => formatNumber(value, 'INR'),
                      })),
                    ]}
                    data={feeReceipt.allocationDetails}
                    isSearch={false}
                    isFilter={false}
                    isPagination={false}
                    isShowedDense={false}
                    showToolbar={false}
                    wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                    tableContainerProps={{ sx: { height: 'auto' } }}
                  />
                </>
              )}
              {receipt.auditSummary && (
                <DetailField
                  fullWidth
                  label={receipt.auditSummary.headline}
                  value={paymentReceiptSummary(receipt.auditSummary, receipt.totalAmount, isFee)}
                />
              )}
              {blobUrl && (
                <>
                  <Box
                    component="iframe"
                    title={`${name} Receipt PDF`}
                    src={blobUrl}
                    sx={{
                      width: '100%',
                      height: '60dvh',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mdi:open-in-new" />}
                      onClick={isFee ? onOpenFeeInNewTab : onOpenChargeInNewTab}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:download" />}
                      onClick={isFee ? onDownloadFee : onDownloadCharge}
                    >
                      Download
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          )
        )}
      </DetailSection>
    );
  };
  return (
    <Stack spacing={2}>
      {renderReceipt(true)}
      {renderReceipt(false)}
    </Stack>
  );
}
