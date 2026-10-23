import type { FocusEventHandler, ChangeEventHandler } from 'react';

import { Iconify } from 'src/components/iconify';
import { TextField, InputAdornment } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { MIN_CHAPTER_NUMBER, MAX_CHAPTER_NUMBER } from '../chapterNumber';

interface ChapterNumberFieldProps {
  value: number | string;
  error?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
}

export function ChapterNumberField({ value, error, onChange, onBlur }: ChapterNumberFieldProps) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        fullWidth
        label="Chapter number *"
        name="chapterNo"
        type="number"
        placeholder="e.g. 1"
        slotProps={{
          htmlInput: {
            min: MIN_CHAPTER_NUMBER,
            max: MAX_CHAPTER_NUMBER,
            step: 1,
            inputMode: 'numeric',
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:pound" width={15} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        onKeyDown={(event) => {
          if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
        }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        size="small"
        error={Boolean(error)}
        helperText={error}
      />
    </ShakingTextField>
  );
}
