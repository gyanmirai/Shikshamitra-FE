import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';

import { dayMarks } from '../utils/dayMarks';

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
}) => {
  const [start, end] = value?.length === 2 ? value : [0, 5];

  const handleChipClick = (dayValue: number) => {
    if (disabled) return;
    let newStart = start;
    let newEnd = end;

    if (dayValue < start) {
      newStart = dayValue; // extend range left
    } else if (dayValue > end) {
      newEnd = dayValue; // extend range right
    } else if (dayValue === start && start < end) {
      newStart = start + 1; // shrink from left boundary
    } else if (dayValue === end && end > start) {
      newEnd = end - 1; // shrink from right boundary
    }
    // clicking interior chip: no-op (range is always contiguous)

    onChange([newStart, newEnd]);
    onBlur?.();
  };

  const startLabel = dayMarks.find((d) => d.value === start)?.label ?? '';
  const endLabel = dayMarks.find((d) => d.value === end)?.label ?? '';
  const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;

  return (
    <Box
      sx={{
        px: 2,
        pt: 1.5,
        pb: 2,
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: (theme) =>
          `1px solid ${
            error
              ? theme.palette.error.main
              : theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)'
          }`,
        transition: 'border-color 150ms ease',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
        <Iconify icon="mdi:calendar-week" width={18} color="primary.main" />
        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
          Active Days
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.25, fontWeight: 500 }}>
          ({rangeLabel})
        </Typography>
      </Box>

      {/* Day chips */}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {dayMarks.map((day) => {
          const isSelected = day.value >= start && day.value <= end;
          const isBoundary = day.value === start || day.value === end;
          const isInterior = isSelected && !isBoundary;

          const chipLabel = (
            <Chip
              key={day.value}
              label={day.label}
              size="small"
              onClick={isInterior || disabled ? undefined : () => handleChipClick(day.value)}
              aria-pressed={isSelected}
              aria-label={`${day.label}: ${isSelected ? 'active' : 'inactive'}`}
              sx={{
                height: 32,
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: disabled ? 'not-allowed' : isInterior ? 'default' : 'pointer',
                userSelect: 'none',
                transition: 'all 150ms ease',
                ...(isSelected
                  ? {
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.2 : 0.1
                        ),
                      color: 'primary.main',
                      border: (theme) =>
                        `1.5px solid ${alpha(theme.palette.primary.main, isBoundary ? 0.65 : 0.3)}`,
                      '&:hover':
                        disabled || isInterior
                          ? {}
                          : {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                              borderColor: 'primary.main',
                            },
                      '& .MuiChip-label': { px: 1.25 },
                    }
                  : {
                      bgcolor: 'transparent',
                      color: 'text.secondary',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      '&:hover': disabled
                        ? {}
                        : {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                            color: 'primary.main',
                          },
                      '& .MuiChip-label': { px: 1.25 },
                    }),
              }}
            />
          );

          if (isBoundary && !disabled) {
            const tooltipTitle =
              day.value === start && start < end
                ? 'Click to exclude this day from the start'
                : day.value === end && end > start
                  ? 'Click to exclude this day from the end'
                  : '';
            return tooltipTitle ? (
              <Tooltip key={day.value} title={tooltipTitle} arrow placement="top">
                <span>{chipLabel}</span>
              </Tooltip>
            ) : (
              <React.Fragment key={day.value}>{chipLabel}</React.Fragment>
            );
          }

          return <React.Fragment key={day.value}>{chipLabel}</React.Fragment>;
        })}
      </Stack>

      {/* Helper / error text */}
      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
          {error}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: 'block' }}>
          Click boundary chips to expand or shrink the active range
        </Typography>
      )}
    </Box>
  );
};

export default ActiveDaysSlider;
