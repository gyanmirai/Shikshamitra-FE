import React, { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, ButtonBase, Typography } from '@mui/material';

import { dayMarks, getActiveDaysLabel } from '../utils/dayMarks';

interface IActiveDaysSliderProps {
  value: number[];
  disabled?: boolean;
  error?: string;
  onChange: (next: number[]) => void;
  onBlur?: () => void;
  rightElement?: React.ReactNode;
}

const QUICK_SELECTIONS = [
  { label: 'Mon–Fri', days: [0, 1, 2, 3, 4] },
  { label: 'Mon–Sat', days: [0, 1, 2, 3, 4, 5] },
] as const;

const ActiveDaysSlider: React.FC<IActiveDaysSliderProps> = ({
  value,
  disabled,
  error,
  onChange,
  onBlur,
  rightElement,
}) => {
  const selectedDays = useMemo(
    () =>
      [...new Set((value || []).filter((day) => dayMarks.some((mark) => mark.value === day)))].sort(
        (a, b) => a - b
      ),
    [value]
  );

  const commit = (next: number[]) => {
    onChange([...new Set(next)].sort((a, b) => a - b));
    onBlur?.();
  };

  const handleDayToggle = (dayValue: number) => {
    if (disabled) return;
    commit(
      selectedDays.includes(dayValue)
        ? selectedDays.filter((day) => day !== dayValue)
        : [...selectedDays, dayValue]
    );
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: (theme) => `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:calendar-week" width={18} color="primary.main" />
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
            Active Days
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            ({getActiveDaysLabel(selectedDays) || 'None selected'})
          </Typography>
        </Box>
        {rightElement && <Box sx={{ display: 'flex', alignItems: 'center' }}>{rightElement}</Box>}
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {dayMarks.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <ButtonBase
              key={day.value}
              onClick={() => handleDayToggle(day.value)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${day.label}: ${isSelected ? 'active' : 'inactive'}`}
              sx={{
                height: 32,
                minWidth: 44,
                px: 1.5,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                border: '1.5px solid',
                borderColor: (theme) =>
                  isSelected
                    ? alpha(theme.palette.primary.main, 0.8)
                    : alpha(theme.palette.grey[500], 0.35),
                bgcolor: (theme) =>
                  isSelected ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
                color: isSelected ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, isSelected ? 0.22 : 0.08),
                  borderColor: 'primary.main',
                },
                '&:focus-visible': {
                  outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                },
              }}
            >
              {day.label}
            </ButtonBase>
          );
        })}
      </Stack>

      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
          {error}
        </Typography>
      ) : (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.disabled">
            Toggle individual days or quick select:
          </Typography>
          {QUICK_SELECTIONS.map((selection) => (
            <Button
              key={selection.label}
              size="small"
              variant="text"
              disabled={disabled}
              onClick={() => commit([...selection.days])}
              sx={{ minWidth: 0, px: 0.5, py: 0, fontSize: '0.7rem' }}
            >
              {selection.label}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ActiveDaysSlider;
