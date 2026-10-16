import type { PaymentHistoryItem } from 'src/redux/feeCollection/feeCollection';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { DetailSection } from 'src/components/detail-view';
import CustomizableTable from 'src/components/customizabaleTable';

export default function PaymentHistory({ payments }: { payments?: PaymentHistoryItem[] }) {
  return (
    <DetailSection
      title="Payment History"
      icon="mdi:history"
      helpText="Receipts, payment dates and methods recorded for this student."
    >
      <CustomizableTable
        tableId="student-receipt-details"
        tableTitle="Payment History"
        noDataText="No payments recorded."
        isSearch={false}
        isFilter={false}
        isPagination={false}
        showToolbar={false}
        isShowedDense={false}
        wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
        tableContainerProps={{ sx: { height: 'auto' } }}
        columns={[
          { id: 'receiptNumber', label: 'Receipt number', minWidth: 160 },
          {
            id: 'date',
            label: 'Date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '—'),
          },
          {
            id: 'amount',
            label: 'Amount',
            align: 'right',
            render: (value: number) => formatNumber(value, 'INR'),
          },
          {
            id: 'paymentMethods',
            label: 'Payment method',
            render: (value: string[]) => <Label color="default">{value?.join(', ') || '—'}</Label>,
          },
        ]}
        data={payments ?? []}
      />
    </DetailSection>
  );
}
