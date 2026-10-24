import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FeeHeadSummary, FeeChargeDetail } from 'src/redux/feeCollection/feeCollection';

import { Stack } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailSection } from 'src/components/detail-view';
import { Label, type LabelColor } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  FeeCollectionStatusType,
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
    {
      id: 'name',
      label: isCharge ? 'Charge name' : 'Fee head',
      minWidth: 220,
      width: 220,
      sticky: true,
      stickyPosition: 'left',
      isFilter: true,
      filterType: 'string',
    },
    ...(isCharge
      ? ['total', 'paid', 'pending']
      : ['total', 'concession', 'netFee', 'paid', 'pending']
    ).map((id) => ({
      cellSx: { textAlign: 'right' as const },
      id,
      minWidth: 140,
      isFilter: true,
      filterType: 'number' as const,
      label: (
        {
          total: 'Total',
          concession: 'Concession',
          netFee: 'Net fee',
          paid: 'Paid',
          pending: 'Pending',
        } as Record<string, string>
      )[id],
      align: 'left' as const,
      render: (value: number) => formatNumber(value, 'INR'),
    })),
    {
      id: 'status',
      label: 'Status',
      width: 160,
      minWidth: 160,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: [
        FeeCollectionStatusType.Pending,
        FeeCollectionStatusType.Paid,
        FeeCollectionStatusType.Overdue,
        FeeCollectionStatusType.Reversed,
        FeeCollectionStatusType.Partial,
        FeeCollectionStatusType.InReconciliation,
        FeeCollectionStatusType.Waived,
      ].map((value) => ({
        value,
        label: isCharge ? chargeCollectionStatusLabel(value) : feeInstallmentStatusLabel(value),
      })),
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
      <DetailSection
        title="Fee Breakdown"
        icon="mdi:format-list-bulleted"
        helpText="Original principal fees by fee head, payments applied after refunds and excess payment, and currently generated pending fees."
      >
        <CustomizableTable
          tableId="fee-detail-heads"
          tableTitle="Fee Breakdown"
          variant="embedded"
          columns={columns(false)}
          data={(feeHeads ?? []).map((h) => ({
            name: h.feeHeadName,
            total: h.amount,
            concession: h.concessionAmount,
            netFee: h.netFee,
            paid: h.paidAmount,
            pending: h.pendingAmount ?? h.amount - h.paidAmount,
            status: h.status,
          }))}
          noDataText="No fee heads assigned."
          isSearch={false}
          isFilter
          isPagination={false}
          showToolbar={false}
          isShowedDense={false}
          wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
          tableContainerProps={{ sx: { height: 'auto' } }}
        />
      </DetailSection>
      {!!charges?.length && (
        <DetailSection
          title="Additional Charges"
          icon="mdi:receipt-text-plus-outline"
          helpText="Additional charges and late fees with their recorded payments, outstanding balances and collection status."
        >
          <CustomizableTable
            tableId="fee-detail-charges"
            tableTitle="Additional Charges"
            variant="embedded"
            columns={columns(true)}
            data={charges.map((c) => ({
              name: c.name,
              total: c.amount,
              paid: c.paidAmount,
              pending: c.pendingAmount,
              status: c.status,
            }))}
            isSearch={false}
            isFilter
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
