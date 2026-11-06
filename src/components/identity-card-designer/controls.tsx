import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Switch, TextField, FormControlLabel } from '@mui/material';

export function DesignerSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <CustomSelect
      label={label}
      name={label.replaceAll(' ', '-').toLowerCase()}
      size="small"
      fullWidth
      value={value}
      options={options}
      disabled={disabled}
      onChange={(next) => onChange(String(next))}
    />
  );
}

export function DesignerNumber({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  required = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const message = !Number.isFinite(value)
    ? 'Enter a number.'
    : min !== undefined && value < min
      ? `Enter a value of at least ${min}.`
      : max !== undefined && value > max
        ? `Enter a value no greater than ${max}.`
        : '';
  const error = touched && Boolean(message);
  return (
    <ShakingTextField error={error}>
      <TextField
        name={label.replaceAll(' ', '-').toLowerCase()}
        label={label}
        size="small"
        fullWidth
        type="number"
        required={required}
        error={error}
        helperText={error ? message : undefined}
        onBlur={() => setTouched(true)}
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? Number.NaN : Number(event.target.value))
        }
        inputProps={{ min, max, step: 'any' }}
        disabled={disabled}
      />
    </ShakingTextField>
  );
}

export function DesignerSwitch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <FormControlLabel
      label={label}
      control={
        <Switch
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(_, value) => onChange(value)}
        />
      }
    />
  );
}

export const designerGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 2,
};
