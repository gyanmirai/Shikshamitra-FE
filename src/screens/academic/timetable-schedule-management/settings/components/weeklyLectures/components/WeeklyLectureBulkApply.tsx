'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, InputAdornment } from '@mui/material';

import {
  normalizeWeeklyLectureValue,
  preventInvalidWeeklyLectureKey,
  MAX_WEEKLY_LECTURES_PER_SUBJECT,
  MIN_WEEKLY_LECTURES_PER_SUBJECT,
} from '../weeklyLectureValue';

interface WeeklyLectureBulkApplyProps {
  onApply: (lectureCount: number) => void;
}

export function WeeklyLectureBulkApply({ onApply }: WeeklyLectureBulkApplyProps) {
  const [value, setValue] = useState<number | ''>('');

  const applyValue = () => {
    if (value !== '') onApply(value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <TextField
        type="number"
        size="small"
        placeholder="Apply to all"
        value={value}
        onChange={(event) => setValue(normalizeWeeklyLectureValue(event.target.value))}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          preventInvalidWeeklyLectureKey(event);
          if (event.key === 'Enter') applyValue();
        }}
        inputProps={{
          min: MIN_WEEKLY_LECTURES_PER_SUBJECT,
          max: MAX_WEEKLY_LECTURES_PER_SUBJECT,
          step: 1,
          inputMode: 'numeric',
          'aria-label': 'Apply lecture count to all subjects',
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                lec/wk
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          width: '140px',
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
            { WebkitAppearance: 'none' },
          '& input[type=number]': { MozAppearance: 'textfield' },
        }}
      />
      <Button
        size="small"
        variant="outlined"
        onClick={applyValue}
        disabled={value === ''}
        sx={{ whiteSpace: 'nowrap', height: 32, fontSize: '12px' }}
      >
        Apply to all
      </Button>
    </Box>
  );
}
