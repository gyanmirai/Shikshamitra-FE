import type { FocusEventHandler, ChangeEventHandler } from 'react';

import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function CopyActionReason({
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
        name="reason"
        label="Reason"
        required
        fullWidth
        size="small"
        multiline
        minRows={2}
        value={value}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || 'This reason is recorded in the copy event history.'}
        slotProps={{ htmlInput: { maxLength: 500 } }}
        onChange={onChange}
        onBlur={onBlur}
      />
    </ShakingTextField>
  );
}
