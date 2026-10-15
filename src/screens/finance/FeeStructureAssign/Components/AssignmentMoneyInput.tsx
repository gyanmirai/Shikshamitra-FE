import type { TextFieldProps } from '@mui/material';

import { useState, useEffect } from 'react';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { MAX_ASSIGNMENT_AMOUNT } from './assignmentMoney';

type AssignmentMoneyInputProps = Pick<
  TextFieldProps,
  'label' | 'name' | 'helperText' | 'disabled' | 'error' | 'fullWidth' | 'required'
> & {
  value: number | null;
  onAmountChange: (amount: number | null) => void;
  onBlur?: () => void;
};

/** Keeps an in-progress decimal (such as "1200.") visible while the form stores a number. */
export default function AssignmentMoneyInput({
  value,
  onAmountChange,
  onBlur,
  ...props
}: AssignmentMoneyInputProps) {
  const [draft, setDraft] = useState(value == null ? '' : String(value));

  useEffect(() => {
    setDraft(value == null ? '' : String(value));
  }, [value]);

  return (
    <NumericFormatCustom
      {...props}
      size="small"
      value={draft}
      valueIsNumericString
      roundToWholeRupees={false}
      inputMode="decimal"
      prefix="₹ "
      thousandSeparator=","
      thousandsGroupStyle="lakh"
      decimalScale={2}
      allowNegative={false}
      isAllowed={({ floatValue }) =>
        floatValue === undefined || floatValue <= MAX_ASSIGNMENT_AMOUNT
      }
      onValueChange={({ value: nextDraft, floatValue }, source) => {
        if (source.source !== 'event') return;
        setDraft(nextDraft);
        onAmountChange(nextDraft === '' ? null : (floatValue ?? null));
      }}
      onBlur={onBlur}
    />
  );
}
