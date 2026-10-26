import React, { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionHeader } from 'src/components/form-section-card';
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
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <FormSectionHeader
          icon={GlobalIcons.calendar}
          title="Active Days"
          description={getActiveDaysLabel(selectedDays) || 'None selected'}
          descriptionTooltip="Select the weekdays that use this slot configuration. Quick selections replace the current selection."
          action={rightElement}
        />
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
                minHeight: 44,
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
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
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
