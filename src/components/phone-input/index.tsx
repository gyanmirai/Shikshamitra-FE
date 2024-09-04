import type { TextFieldProps } from '@mui/material';

import React from 'react';
import Input from 'react-phone-number-input';

import { Box, TextField } from '@mui/material';

type PhoneInputProps = TextFieldProps & {
  value: string;
  onChange: (value: any) => void;
};

const PhoneInput = ({ value, onChange, error, label, ...props }: PhoneInputProps) => (
  <Box>
    <Input
      defaultCountry="IN"
      international
      withCountryCallingCode
      value={value}
      onChange={onChange}
      inputComponent={CustomInput}
      countryCallingCodeEditable={false}
      error={error}
      placeholder={label}
      textFieldProps={props}
    />
  </Box>
);

export default PhoneInput;

const CustomInput = React.forwardRef<any, { textFieldProps?: any; [key: string]: any }>(
  (props, ref) => {
    const { textFieldProps, ...other } = props;

    return (
      <TextField
        inputRef={ref}
        size="small"
        label={other.placeholder}
        {...other}
        error={!!other.error}
        helperText={other.error}
        {...textFieldProps}
        sx={{ ...(textFieldProps?.sx || {}) }}
      />
    );
  }
);
