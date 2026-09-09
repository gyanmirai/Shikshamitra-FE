import type { AccountHeadType } from 'src/types/finance/account-head';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { useAccountHeadOptions } from 'src/hooks/useAccountHeadOptions';

interface HeadSelectorProps {
  name?: string;
  label?: string;
  headType?: AccountHeadType;
  categoryType?: 'Income' | 'Expense';
  value: string;
  onChange: (value: string | number | string[] | number[]) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  excludeId?: string;
}

export default function HeadSelector({
  name,
  label = 'Account Head',
  headType,
  categoryType,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  excludeId,
}: HeadSelectorProps) {
  const {
    options,
    isLoading,
    errorMessage,
    disabled: optionsDisabled,
    needsAcademicYear,
  } = useAccountHeadOptions(headType, categoryType);

  const selectOptions =
    options
      ?.filter((opt: any) => opt.id !== excludeId)
      .map((opt: any) => ({
        value: opt.id,
        label: opt.name,
      })) || [];

  const handleChange = (val: string | number | string[] | number[]) => {
    onChange(val);
  };

  return (
    <CustomSelect
      label={required ? `${label} *` : label}
      options={selectOptions}
      value={value}
      onChange={handleChange}
      formControlProps={{ fullWidth: true, size: 'small' }}
      error={error || Boolean(errorMessage)}
      helperText={
        errorMessage ||
        helperText ||
        (needsAcademicYear ? 'Select an academic year to load Account Heads.' : undefined) ||
        (!isLoading && !optionsDisabled && selectOptions.length === 0
          ? 'No eligible Account Heads are available. Check the type and active status in Accounts > Settings > Account Heads.'
          : undefined)
      }
      disabled={disabled || isLoading || optionsDisabled}
    />
  );
}
