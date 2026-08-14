'use client';

import { Box, Checkbox, MenuItem, TextField, FormControlLabel } from '@mui/material';

type Field = {
  code: string;
  label: string;
  fieldType: number;
  required: boolean;
  readOnly: boolean;
  placeholder?: string | null;
  helpText?: string | null;
};

type Props = {
  field: Field;
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
};

const options = ['Yes', 'No'];

export default function AdmissionRuntimeField({ field, value, disabled, error, onChange }: Props) {
  if (field.fieldType === 9) {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={value === 'true'}
            disabled={disabled}
            onChange={(event) => onChange(String(event.target.checked))}
          />
        }
        label={field.label}
      />
    );
  }

  if (field.fieldType === 10) {
    return (
      <TextField
        fullWidth
        label={field.label}
        value={value}
        disabled
        helperText="File upload will be enabled in a future phase."
      />
    );
  }

  if (field.fieldType === 11) {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        label={field.label}
        value={value}
        required={field.required}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || field.helpText || undefined}
        placeholder={field.placeholder ?? 'Enter address'}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  const isChoice = field.fieldType === 6 || field.fieldType === 8;
  const isMultiSelect = field.fieldType === 7;
  const selectedValues = isMultiSelect ? parseMultiValue(value) : [];
  return (
    <TextField
      fullWidth
      select={isChoice || isMultiSelect}
      SelectProps={isMultiSelect ? { multiple: true } : undefined}
      multiline={field.fieldType === 1}
      minRows={field.fieldType === 1 ? 3 : undefined}
      type={
        field.fieldType === 5
          ? 'date'
          : field.fieldType === 2
            ? 'number'
            : field.fieldType === 3
              ? 'email'
              : field.fieldType === 4
                ? 'tel'
                : 'text'
      }
      label={field.label}
      required={field.required}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error || field.helpText || undefined}
      placeholder={field.placeholder ?? undefined}
      value={isMultiSelect ? selectedValues : value}
      onChange={(event) => {
        const next = event.target.value;
        onChange(
          isMultiSelect
            ? JSON.stringify(typeof next === 'string' ? next.split(',') : next)
            : String(next)
        );
      }}
      InputLabelProps={field.fieldType === 5 ? { shrink: true } : undefined}
    >
      {(isChoice || isMultiSelect) &&
        options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      {isMultiSelect && selectedValues.length === 0 && (
        <Box component="span" sx={{ display: 'none' }} />
      )}
    </TextField>
  );
}

function parseMultiValue(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
