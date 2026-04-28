import React from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { dayMarks } from '../utils/dayMarks';
import { DayRangeSlider } from './DayRangeSlider';

interface IActiveDaysSliderProps {
  value: number[];
  disabled?: boolean;
  error?: string;
  onChange: (next: number[]) => void;
  onBlur?: () => void;
}

const ActiveDaysSlider: React.FC<IActiveDaysSliderProps> = ({
  value,
  disabled,
  error,
  onChange,
  onBlur,
}) => (
  <Box
    sx={{
      px: 2,
      pt: 1,
      pb: 2,
      borderRadius: 2,
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: (theme) =>
        `1px solid ${
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        }`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
      <Iconify icon="mdi:calendar-week" width={20} color="primary.main" />
      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
        Active Days
      </Typography>
    </Box>

    <Box sx={{ px: 1 }}>
      <DayRangeSlider
        value={value}
        marks={dayMarks}
        min={0}
        max={5}
        step={1}
        track="inverted"
        onChange={(_, newValue) => {
          onChange(newValue as number[]);
          onBlur?.();
        }}
        valueLabelDisplay="off"
        disableSwap
        disabled={disabled}
      />
      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  </Box>
);

export default ActiveDaysSlider;
