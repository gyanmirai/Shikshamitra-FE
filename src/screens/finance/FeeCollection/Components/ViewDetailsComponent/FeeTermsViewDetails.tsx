import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FeeHeadSummary, FeeChargeDetail } from 'src/redux/feeCollection/feeCollection';

import { Stack } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailSection } from 'src/components/detail-view';
import { Label, type LabelColor } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

interface ConsolidatedFeeDetailsProps {
  feeHeads?: FeeHeadSummary[];
  charges?: FeeChargeDetail[];
}

export const ConsolidatedFeeDetails = ({
  feeHeads = [],
  charges = [],
}: ConsolidatedFeeDetailsProps) => {
  const columns = (isCharge: boolean): IColumn[] => [
    { id: 'name', label: isCharge ? 'Charge name' : 'Fee head', minWidth: 180 },
    ...['total', 'paid', 'pending'].map((id) => ({
      cellSx: { textAlign: 'right' as const },
      id,
      label: id === 'total' ? 'Total' : id === 'paid' ? 'Paid' : 'Pending',
      align: 'left' as const,
      render: (value: number) => formatNumber(value, 'INR'),
    })),
    {
      id: 'status',
      label: 'Status',
      render: (value) => (
        <Label
          color={
            FeeCollectionStatusTypeColors[
              value as keyof typeof FeeCollectionStatusTypeColors
            ] as LabelColor
          }
        >
          {isCharge ? chargeCollectionStatusLabel(value) : feeInstallmentStatusLabel(value)}
        </Label>
      ),
    },
  ];
  return (
    <Stack spacing={2}>
      <DetailSection title="Fee Breakdown" icon="mdi:format-list-bulleted">
        <CustomizableTable
          tableId="fee-detail-heads"
          tableTitle="Fee Breakdown"
          columns={columns(false)}
          data={(feeHeads ?? []).map((h) => ({
            name: h.feeHeadName,
            total: h.amount,
            paid: h.paidAmount,
            pending: h.pendingAmount ?? h.amount - h.paidAmount,
            status: h.status,
          }))}
          noDataText="No fee heads assigned."
          isSearch={false}
          isFilter={false}
          isPagination={false}
          showToolbar={false}
          isShowedDense={false}
          wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
          tableContainerProps={{ sx: { height: 'auto' } }}
        />
      </DetailSection>
      {!!charges?.length && (
        <DetailSection title="Additional Charges" icon="mdi:receipt-text-plus-outline">
          <CustomizableTable
            tableId="fee-detail-charges"
            tableTitle="Additional Charges"
            columns={columns(true)}
            data={charges.map((c) => ({
              name: c.name,
              total: c.amount,
              paid: c.paidAmount,
              pending: c.pendingAmount,
              status: c.status,
            }))}
            isSearch={false}
            isFilter={false}
            isPagination={false}
            showToolbar={false}
            isShowedDense={false}
            wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
            tableContainerProps={{ sx: { height: 'auto' } }}
          />
        </DetailSection>
      )}
    </Stack>
  );
};
