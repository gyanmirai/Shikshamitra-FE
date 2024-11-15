import type { TextFieldProps } from '@mui/material';
import type { MuiTelInputInfo } from 'mui-tel-input';

import React from 'react';
import { MuiTelInput } from 'mui-tel-input';

import { Box } from '@mui/material';

type PhoneInputProps = Omit<TextFieldProps, 'value' | 'onChange' | 'placeholder'> & {
  value: string;
  onChange: (value: string, info?: MuiTelInputInfo) => void;
  placeholder?: string;
};

const PhoneInput = ({ value, onChange, error, label, helperText, ...props }: PhoneInputProps) => (
  <Box>
    <MuiTelInput
      forceCallingCode
      size="small"
      defaultCountry="IN"
      onChange={onChange}
      value={value}
      error={error}
      helperText={helperText}
      fullWidth
      {...(props as any)}
    />
  </Box>
);
export default PhoneInput;
