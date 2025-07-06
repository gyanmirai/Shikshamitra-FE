import type { TextFieldProps } from '@mui/material';
import type { MuiTelInputInfo } from 'mui-tel-input';

import React from 'react';
import { MuiTelInput } from 'mui-tel-input';

type PhoneInputProps = Omit<TextFieldProps, 'value' | 'onChange' | 'placeholder'> & {
  value: string;
  onChange: (value: string | undefined, info?: MuiTelInputInfo) => void;
  placeholder?: string;
};

const PhoneInput = ({ value, onChange, error, label, helperText, ...props }: PhoneInputProps) => {
  const handleChange = (newPhone: string, info: MuiTelInputInfo) => {
    console.log('🚀 ~ handleChange ~ newPhone:', newPhone);
    if (newPhone === '+91') {
      onChange(undefined, info);
      return;
    }

    // Extract digits excluding the country code
    const digitsOnly = newPhone.replace(/\D/g, ''); // e.g., "+91 1234567890" => "911234567890"

    // Get country code length (e.g., 91 for India)
    const countryCode = info.countryCallingCode; // or dynamically extract based on country
    const nationalNumber = digitsOnly.startsWith(countryCode as string)
      ? digitsOnly.slice((countryCode as string).length)
      : digitsOnly;

    if (nationalNumber.length <= 10) {
      onChange(newPhone, info);
    }
  };

  return (
    <MuiTelInput
      forceCallingCode
      size="small"
      defaultCountry="IN"
      onChange={handleChange}
      value={value}
      error={error}
      helperText={helperText}
      fullWidth
      onlyCountries={['IN']}
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
};
export default PhoneInput;
