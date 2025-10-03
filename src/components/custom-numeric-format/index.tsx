import type { TextFieldProps } from '@mui/material';
import type { NumericFormatProps } from 'react-number-format';

import React from 'react';
import { TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';

const NumericFormatCustom = ({
  value,
  onChange,
  ...props
}: Omit<NumericFormatProps, 'size'> & TextFieldProps) => (
  <NumericFormat
    value={value as any}
    onChange={onChange}
    isAllowed={(values) => {
      const { floatValue } = values;
      return floatValue === undefined || floatValue <= 9999999; // only allow up to 5 digits
    }}
    // @ts-ignore
    customInput={TextField}
    thousandSeparator
    valueIsNumericString={false}
    prefix="₹ "
    allowNegative={false}
    thousandsGroupStyle="lakh"
    variant="outlined"
    {...props}
  />
);

export default NumericFormatCustom;
