import type { TextFieldProps } from '@mui/material';
import type { MuiTelInputInfo } from 'mui-tel-input';

import React from 'react';
import { MuiTelInput } from 'mui-tel-input';

type PhoneInputProps = Omit<TextFieldProps, 'value' | 'onChange' | 'placeholder'> & {
  value: string;
  onChange: (value: string, info?: MuiTelInputInfo) => void;
  placeholder?: string;
};

const PhoneInput = ({ value, onChange, error, label, helperText, ...props }: PhoneInputProps) => (
  <MuiTelInput
    forceCallingCode
    size="small"
    defaultCountry="IN"
    onChange={onChange}
    value={value}
    error={error}
    helperText={helperText}
    fullWidth
    // variant="outlined"
    label={label}
    sx={{
      '& .MuiInputBase-input': {
        font: 'unset',
        fontSize: '14px',
      },
    }}
    {...(props as any)}
  />
);
export default PhoneInput;
