import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Tooltip, ButtonBase, Typography } from '@mui/material';

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
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {dayMarks.map((day) => {
          const isSelected = day.value >= start && day.value <= end;
          const isBoundary = day.value === start || day.value === end;
          const isInterior = isSelected && !isBoundary;

          const chipLabel = (
            <ButtonBase
              key={day.value}
              onClick={isInterior || disabled ? undefined : () => handleChipClick(day.value)}
              aria-pressed={isSelected}
              aria-label={`${day.label}: ${isSelected ? 'active' : 'inactive'}`}
              focusRipple={!isInterior && !disabled}
              disableRipple={isInterior || disabled}
              tabIndex={disabled ? -1 : 0}
              sx={{
                height: 32,
                minWidth: 44,
                px: 1.5,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
                lineHeight: 1,
                cursor: disabled ? 'not-allowed' : isInterior ? 'default' : 'pointer',
                userSelect: 'none',
                border: '1.5px solid',
                transition:
                  'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                ...(isSelected
                  ? {
                      backgroundColor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.2 : 0.12
                        ),
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.primary.light // #5BE49B — high contrast on dark bg
                          : theme.palette.primary.main,
                      borderColor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          isBoundary ? 0.8 : theme.palette.mode === 'dark' ? 0.55 : 0.35
                        ),
                      '&:hover':
                        disabled || isInterior
                          ? {}
                          : {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.28),
                              borderColor: 'primary.main',
                            },
                      '&:focus-visible': {
                        outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: '2px',
                      },
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.grey[300] // #DFE3E8 — ~10:1 contrast on dark surfaces
                          : theme.palette.text.secondary,
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[400], 0.5) // clear outline on dark bg
                          : alpha(theme.palette.grey[500], 0.35),
                      '&:hover': disabled
                        ? {}
                        : {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.45),
                            color: 'primary.main',
                          },
                      '&:focus-visible': {
                        outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: '2px',
                      },
                    }),
              }}
            >
              {day.label}
            </ButtonBase>
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
