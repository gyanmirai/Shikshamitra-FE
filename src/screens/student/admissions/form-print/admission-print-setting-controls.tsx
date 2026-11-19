import type { ReactNode } from 'react';

import { useId, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Switch, TextField, FormControlLabel } from '@mui/material';

export function PrintSettingsCards({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 2,
          alignItems: 'start',
          '@container (min-width: 620px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
          '& > section': { minWidth: 0, containerType: 'inline-size' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function PrintSettingsGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 340px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function PrintSettingSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  disabledValues,
  disabledLabel,
  helperText,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
  disabled?: boolean;
  disabledValues?: T[];
  disabledLabel?: string;
  helperText?: string;
}) {
  const id = useId();
  return (
    <CustomSelect
      size="small"
      fullWidth
      name={id}
      label={label}
      value={value}
      options={options.map(([option, text]) => ({ value: option, label: text }))}
      onChange={(next) => onChange(next as T)}
      disabled={disabled}
      disabledValues={disabledValues}
      disabledLabel={disabledLabel}
      helperText={helperText}
    />
  );
}

export function PrintSettingToggle({
  label,
  checked,
  onChange,
  disabled,
  descriptionId,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  descriptionId?: string;
}) {
  return (
    <FormControlLabel
      label={label}
      disabled={disabled}
      sx={{
        m: 0,
        justifyContent: 'space-between',
        gap: 1,
        '& .MuiFormControlLabel-label': { flex: 1 },
      }}
      labelPlacement="start"
      control={
        <Switch
          size="small"
          checked={checked}
          slotProps={{ input: { 'aria-describedby': descriptionId } }}
          onChange={(_, value) => onChange(value)}
        />
      }
    />
  );
}

export function PrintSettingNumber({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const invalid = draft !== '' && Number(draft) < min;
  return (
    <NumericFormatCustom
      id={id}
      name={id}
      label={label}
      value={draft}
      size="small"
      fullWidth
      disabled={disabled}
      prefix=""
      suffix={unit ? ` ${unit}` : ''}
      thousandSeparator={false}
      decimalScale={0}
      roundToWholeRupees={false}
      allowNegative={false}
      error={invalid}
      helperText={
        invalid
          ? `Enter a value from ${min} to ${max}${unit ? ` ${unit}` : ''}.`
          : `${min}–${max}${unit ? ` ${unit}` : ''}`
      }
      isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= max}
      onValueChange={({ value: nextDraft, floatValue }, source) => {
        if (source.source !== 'event') return;
        setDraft(nextDraft);
        if (floatValue !== undefined && floatValue >= min && floatValue <= max)
          onChange(floatValue);
      }}
      onBlur={() => {
        const next = draft === '' ? value : Math.max(min, Math.min(max, Number(draft)));
        setDraft(String(next));
        if (next !== value) onChange(next);
      }}
    />
  );
}

export function PrintSettingText({
  label,
  value,
  onChange,
  multiline,
  maxLength = 128,
  disabled,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
  helperText?: string;
}) {
  const id = useId();
  return (
    <TextField
      id={id}
      name={id}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="small"
      fullWidth
      disabled={disabled}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      slotProps={{ htmlInput: { maxLength } }}
      helperText={helperText}
    />
  );
}
