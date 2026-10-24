import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  PaymentHistoryItem,
  PaymentHistoryReceipt,
} from 'src/redux/feeCollection/feeCollection';

import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { DetailSection } from 'src/components/detail-view';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';
import { type PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';
import {
  feeInstallmentStatusLabel,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

export default function PaymentHistory({ payments }: { payments?: PaymentHistoryItem[] }) {
  const access = useFinancePermissions(financePermissions.fees.invoicesAndReceipts);
  const [downloadPdf] = useDownloadReceiptPdfMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const downloadLock = useRef(false);

  const downloadReceipt = async (receipt: PaymentHistoryReceipt) => {
    if (!access.canView || downloadLock.current) return;
    downloadLock.current = true;
    setDownloadingId(receipt.receiptId);
    try {
      // Saved document IDs, never collection IDs, identify downloadable receipts.
      const blob = await downloadPdf({ receiptId: receipt.receiptId }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail ||
          'Unable to download the receipt. Please try again.',
      });
    } finally {
      downloadLock.current = false;
      setDownloadingId(null);
    }
  };

  const columns: IColumn[] = [
    {
      id: 'receiptNumber',
      label: 'Receipt number',
      width: 180,
      minWidth: 180,
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string',
      isFilter: true,
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 150,
      filterType: 'date',
      isFilter: true,
      render: (value) => (value ? fDate(value, 'DD-MM-YYYY') : '—'),
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 140,
      filterType: 'number',
      isFilter: true,
      cellSx: { textAlign: 'right' },
      render: (value: number) => formatNumber(value, 'INR'),
    },
    {
      id: 'paymentMethodLabel',
      label: 'Payment method',
      minWidth: 180,
      filterType: 'string',
      isFilter: true,
    },
    {
      id: 'status',
      label: 'Status',
      width: 160,
      minWidth: 160,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      filterType: 'enum',
      enumOptions: FeeCollectionStatusOptions,
      isFilter: true,
      render: (value: PaymentHistoryItem['status']) =>
        value == null ? (
          '—'
        ) : (
          <Label color={FeeCollectionStatusTypeColors[value] || 'default'}>
            {feeInstallmentStatusLabel(value)}
          </Label>
        ),
    },
  ];

  if (access.canView)
    columns.push({
      id: 'actions',
      label: 'Actions',
      width: 100,
      minWidth: 100,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, row) => {
        const payment = row as PaymentHistoryItem;
        if (!payment.receipts?.length) return 'Unavailable';
        return (
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            collapseOnOverflow={false}
            moreLabel={`More receipts for ${payment.receiptNumber}`}
            sx={{ justifyContent: 'flex-end' }}
            actions={payment.receipts.map((receipt) => ({
              id: receipt.receiptId,
              label: `Download receipt ${receipt.receiptNumber}`,
              icon: GlobalIcons.download,
              loading: downloadingId === receipt.receiptId,
              disabled: downloadingId !== null,
              tooltip: downloadingId
                ? 'A receipt download is in progress.'
                : `${receipt.hasPdf ? 'Download' : 'Generate and download'} ${receipt.scope.toLowerCase()} receipt ${receipt.receiptNumber}`,
              onClick: () => {
                downloadReceipt(receipt);
              },
            }))}
          />
        );
      },
    });

  return (
    <DetailSection
      helpText="Original collection amounts, dates, methods and current transaction status. Reversed transactions remain in history. Download the linked saved receipt documents from Actions."
      title="Payment History"
      icon="mdi:history"
    >
      <CustomizableTable
        tableId="student-receipt-details"
        tableTitle="Payment History"
        variant="embedded"
        noDataText="No payments recorded."
        isSearch={false}
        isFilter
        isPagination={false}
        showToolbar={false}
        isShowedDense={false}
        wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
        tableContainerProps={{ sx: { height: 'auto' } }}
        columns={columns}
        data={(payments ?? []).map((payment) => ({
          ...payment,
          paymentMethodLabel:
            [...new Set(payment.paymentMethods ?? [])]
              .map((method) => PaymentMethodLabels[method as PaymentMethod] ?? 'Unknown method')
              .join(', ') || 'Not recorded',
        }))}
      />
    </DetailSection>
  );
}
