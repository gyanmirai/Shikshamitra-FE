import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { Checkbox, Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomizableTable from 'src/components/customizabaleTable';
import type { AdjustmentApplyItem } from '../types/adjustmentApply.types';

interface Props {
  items: AdjustmentApplyItem[];
  disabled?: boolean;
  onSelectRow: (installmentId: string, checked: boolean) => void;
  onChangeAmount: (installmentId: string, amount: number | string) => void;
}

function AllocationAmount({
  item,
  disabled,
  onChange,
}: {
  item: AdjustmentApplyItem;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const draft = item.amountDraft ?? (item.appliedAmount ? String(item.appliedAmount) : '');
  const invalid =
    !/^\d+(\.\d{1,2})?$/.test(draft) ||
    Number(draft) <= 0 ||
    Math.abs(Number(draft) - item.appliedAmount) > 0.00001;
  const showError = item.isSelected && invalid && (touched || draft !== '');
  return (
    <ShakingTextField error={showError}>
      <NumericFormatCustom
        fullWidth
        size="small"
        required
        name={`allocation-${item.installmentId}`}
        label="Adjustment amount"
        value={draft}
        valueIsNumericString
        roundToWholeRupees={false}
        decimalScale={2}
        isAllowed={({ floatValue }) =>
          floatValue === undefined || (Number.isFinite(floatValue) && floatValue >= 0)
        }
        disabled={disabled || !item.isSelected}
        onBlur={() => setTouched(true)}
        onValueChange={({ value }, source) => {
          if (source.source === 'event') onChange(value);
        }}
        error={showError}
        helperText={
          showError
            ? Number(draft) > item.appliedAmount
              ? 'Exceeds the available balance'
              : 'Enter an amount above zero'
            : undefined
        }
        inputProps={{
          'aria-label': `Adjustment amount for ${item.feeHeadName} · ${item.installmentLabel}`,
        }}
      />
    </ShakingTextField>
  );
}

export default function AdjustmentPendingFeesTable({
  items,
  disabled,
  onSelectRow,
  onChangeAmount,
}: Props) {
  const columns: IColumn[] = [
    {
      id: 'installmentLabel',
      label: 'Installment',
      minWidth: 190,
      isSort: false,
      isFilter: false,
      render: (value, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Checkbox
            size="small"
            checked={row.isSelected}
            disabled={disabled || row.adjustableAmount <= 0}
            inputProps={{ 'aria-label': `Select ${row.feeHeadName} · ${value}` }}
            onChange={(_, checked) => onSelectRow(row.installmentId, checked)}
          />
          <Typography variant="body2">{value}</Typography>
        </Stack>
      ),
    },
    { id: 'feeHeadName', label: 'Fee head', minWidth: 150, isSort: false, isFilter: false },
    ...[
      { id: 'totalFees', label: 'Total' },
      { id: 'paidAmount', label: 'Paid' },
      { id: 'pendingAmount', label: 'Pending' },
      { id: 'adjustableAmount', label: 'Available' },
    ].map(({ id, label }): IColumn => ({
      id,
      label,
      minWidth: 110,
      align: 'right',
      isSort: false,
      isFilter: false,
      render: (value) => formatNumber(value, 'INR', { fractionDigits: 2 }),
    })),
    {
      cellSx: { textAlign: 'right' as const },
      id: 'appliedAmount',
      label: 'Adjustment amount',
      minWidth: 220,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => (
        <AllocationAmount
          item={row as AdjustmentApplyItem}
          disabled={disabled}
          onChange={(value) => onChangeAmount(row.installmentId, value)}
        />
      ),
    },
    {
      id: 'finalPendingAmount',
      label: 'Final pending',
      minWidth: 130,
      align: 'right',
      isSort: false,
      isFilter: false,
      render: (value) => formatNumber(value, 'INR', { fractionDigits: 2 }),
    },
  ];
  return (
    <CustomizableTable
      tableId="adjustment-pending-fees"
      tableTitle="Pending fees for adjustment"
      variant="embedded"
      columns={columns}
      data={items}
      showToolbar={false}
      isPagination={false}
      isFilter={false}
      isSearch={false}
      isShowedDense={false}
      noDataText="No eligible outstanding fees are available."
      rowProps={(row) => ({ selected: row.isSelected })}
      getRowAction={(row) => ({
        label: `${row.isSelected ? 'Deselect' : 'Select'} ${row.feeHeadName} · ${row.installmentLabel}`,
        disabled: disabled || row.adjustableAmount <= 0,
        onClick: () => onSelectRow(row.installmentId, !row.isSelected),
      })}
    />
  );
}
