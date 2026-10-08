import type { TextFieldProps } from '@mui/material';

import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';

import { MAX_ASSIGNMENT_AMOUNT } from './assignmentMoney';

type AssignmentMoneyInputProps = Pick<
  TextFieldProps,
  'label' | 'helperText' | 'disabled' | 'error' | 'fullWidth' | 'required'
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
    <NumericFormat
      {...props}
      customInput={TextField}
      value={draft}
      valueIsNumericString
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
