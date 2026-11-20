import type { FocusEventHandler, ChangeEventHandler } from 'react';

import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function ReservationReason({
  value,
  error,
  disabled,
  onChange,
  onBlur,
}: {
  value: string;
  error?: string;
  disabled: boolean;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        label="Reason"
        name="reason"
        required
        fullWidth
        size="small"
        multiline
        minRows={3}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        inputProps={{ maxLength: 500 }}
        error={Boolean(error)}
        helperText={error || `${value.length}/500 · Saved in the reservation event history.`}
      />
    </ShakingTextField>
  );
}
