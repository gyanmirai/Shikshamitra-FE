import { useState } from 'react';
import { TextField } from '@mui/material';

// Keep an unfinished decimal or empty value visible while updating the owning configuration.
export function WorkflowAssessmentMarksField({
  label,
  ariaLabel,
  value,
  max,
  required = true,
  disabled,
  showError,
  positive = false,
  onChange,
}: {
  label: string;
  ariaLabel?: string;
  value: number | null | undefined;
  max: number;
  required?: boolean;
  disabled: boolean;
  showError: boolean;
  positive?: boolean;
  onChange: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid =
    value == null ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    (positive && value === 0);
  return (
    <TextField
      size="small"
      fullWidth
      required={required}
      label={label}
      disabled={disabled}
      value={draft ?? value ?? ''}
      onFocus={() => setDraft(value == null ? '' : String(value))}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        const raw = event.target.value;
        if (!/^\d*(\.\d*)?$/.test(raw)) return;
        setDraft(raw);
        onChange(raw === '' ? null : Number(raw));
      }}
      slotProps={{ htmlInput: { inputMode: 'decimal', 'aria-label': ariaLabel ?? label } }}
      error={showError && invalid}
      helperText={
        showError && invalid ? `Enter ${positive ? 'more than 0' : '0'} to ${max}.` : undefined
      }
    />
  );
}
