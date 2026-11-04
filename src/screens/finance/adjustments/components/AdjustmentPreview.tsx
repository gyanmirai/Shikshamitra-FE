import type { IColumn } from 'src/components/customizabaleTable/types';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import type { AdjustmentApplicationLineInput } from '../types/adjustmentApply.types';

const columns: IColumn[] = [
  { id: 'installmentLabel', label: 'Installment', minWidth: 160, isSort: false, isFilter: false },
  { id: 'feeHeadName', label: 'Fee head', minWidth: 150, isSort: false, isFilter: false },
  ...[
    { id: 'originalPendingAmount', label: 'Original pending' },
    { id: 'appliedAmount', label: 'Applying now' },
    { id: 'finalPendingAmount', label: 'Final pending' },
  ].map(({ id, label }): IColumn => ({
    id,
    label,
    minWidth: 140,
    align: 'right',
    isSort: false,
    isFilter: false,
    render: (value) => formatNumber(value, 'INR', { fractionDigits: 2 }),
  })),
];
export default function AdjustmentPreview({ lines }: { lines: AdjustmentApplicationLineInput[] }) {
  return (
    <CustomizableTable
      tableId="adjustment-allocation-preview"
      tableTitle="Adjustment allocation preview"
      variant="embedded"
      columns={columns}
      data={lines}
      showToolbar={false}
      isPagination={false}
      isFilter={false}
      isSearch={false}
      isShowedDense={false}
    />
  );
}
