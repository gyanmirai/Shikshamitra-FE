'use client';

import NumericFormatCustom from 'src/components/custom-numeric-format';
import ShakingTextField from 'src/components/shaking-text-field';
import { formatNumber } from 'src/utils/formate_number';

interface RefundAmountFieldProps {
  item: { month: string; refundable: number; sourceAllocationId?: string; dueFeeId: string };
  refundValue: number | string;
  showInputError: boolean;
  mode?: 'refund' | 'adjustment';
  isFullRefund?: boolean;
  onAmountChange: (value: number | string) => void;
}

export default function RefundAmountField({
  item,
  refundValue,
  showInputError,
  mode = 'refund',
  isFullRefund = false,
  onAmountChange,
}: RefundAmountFieldProps) {
  const isAdj = mode === 'adjustment';
  const refundable = Math.max(0, item.refundable);
  return (
    <ShakingTextField error={showInputError}>
      <NumericFormatCustom
        size="small"
        label={isAdj ? 'Adjustment amount' : 'Refund amount'}
        fullWidth
        required
        name={`refund-${item.sourceAllocationId || item.dueFeeId}`}
        roundToWholeRupees={false}
        decimalScale={2}
        value={refundValue}
        onValueChange={(vals, source) => {
          if (source.source === 'event') onAmountChange(vals.value);
        }}
        onClick={(e) => e.stopPropagation()}
        isAllowed={
          ({ floatValue }) => floatValue === undefined || floatValue <= refundable // Limit to refundable/adjustable for both modes
        }
        disabled={isFullRefund}
        error={showInputError}
        helperText={
          showInputError
            ? Number(refundValue) > refundable
              ? `Max ${formatNumber(refundable, 'INR')}`
              : refundValue === ''
                ? 'Required'
                : 'Enter an amount above zero'
            : ' '
        }
        inputProps={{
          'aria-label': `${isAdj ? 'Adjustment' : 'Refund'} amount for ${item.month}`,
          style: {
            fontVariantNumeric: 'tabular-nums',
          },
        }}
      />
    </ShakingTextField>
  );
}
