import type { AccountHeadType } from 'src/types/finance/account-head';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { useAccountHeadOptions } from 'src/hooks/useAccountHeadOptions';

interface HeadSelectorProps {
  name?: string;
  label?: string;
  headType?: AccountHeadType;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function HeadSelector({
  name,
  label = 'Account Head',
  headType,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
}: HeadSelectorProps) {
  const { options, isLoading } = useAccountHeadOptions(headType);

  const selectOptions =
    options?.map((opt: any) => ({
      value: opt.id,
      label: `${opt.headName} (${opt.headCode})`,
    })) || [];

  return (
    <CustomSelect
      label={required ? `${label} *` : label}
      options={selectOptions}
      value={value}
      onChange={onChange}
      formControlProps={{ fullWidth: true, size: 'small' }}
      error={error}
      helperText={helperText as string}
      disabled={disabled || isLoading}
    />
  );
}
