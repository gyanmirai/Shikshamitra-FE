import React, { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionHeader } from 'src/components/form-section-card';

import { dayMarks } from '../utils/dayMarks';
import ActiveDayButton from './ActiveDayButton';

interface IActiveDaysSliderProps {
  value: number[];
  disabled?: boolean;
  error?: string;
  onChange: (next: number[]) => void;
  onBlur?: () => void;
  fieldName?: string;
}

const SCHEDULES = [
  { value: 'weekdays', label: 'Mon–Fri', days: [0, 1, 2, 3, 4] },
  { value: 'six-days', label: 'Mon–Sat', days: [0, 1, 2, 3, 4, 5] },
] as const;

const ActiveDaysSlider: React.FC<IActiveDaysSliderProps> = ({
  value,
  disabled,
  error,
  onChange,
  onBlur,
  fieldName,
}) => {
  const errorId = useId();
  const selectedDays = [
    ...new Set((value || []).filter((day) => dayMarks.some((mark) => mark.value === day))),
  ].sort((a, b) => a - b);
  const schedule =
    SCHEDULES.find((item) => item.days.join(',') === selectedDays.join(','))?.value ?? 'custom';
  const scheduleOptions = [
    ...SCHEDULES.map(({ value: scheduleValue, label }) => ({ value: scheduleValue, label })),
    ...(schedule === 'custom' ? [{ value: 'custom', label: 'Custom' }] : []),
  ];

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
    <ShakingTextField error={Boolean(error)}>
      <Box
        component="fieldset"
        name={fieldName}
        tabIndex={-1}
        role="group"
        aria-label="Active Days (required)"
        aria-describedby={error ? errorId : undefined}
        sx={{
          m: 0,
          minWidth: 0,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
          p: 0,
          border: 0,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <FormSectionHeader
            icon={GlobalIcons.calendar}
            title="Active Days *"
            titleTypographyProps={{ fontWeight: 600 }}
            descriptionTooltipLabel="Active Days information"
            descriptionTooltip="Choose a schedule preset or toggle individual weekdays. Custom selections are shown automatically. Presets replace the selected days."
            action={
              <CustomSelect
                label="Schedule"
                value={schedule}
                options={scheduleOptions}
                disabled={disabled}
                formControlProps={{ sx: { width: { xs: 1, sm: 180 } } }}
                onChange={(next) => {
                  const preset = SCHEDULES.find((item) => item.value === next);
                  if (preset) commit([...preset.days]);
                }}
              />
            }
            actionFullWidthOnMobile
          />
        </Box>

        <Box
          role="group"
          aria-label="Weekdays"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              sm: 'repeat(6, minmax(0, 1fr))',
            },
            gap: '1px',
            border: 1,
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1,
            bgcolor: 'divider',
            overflow: 'hidden',
          }}
        >
          {dayMarks.map((day) => (
            <ActiveDayButton
              key={day.value}
              label={day.label}
              selected={selectedDays.includes(day.value)}
              disabled={disabled}
              onClick={() => handleDayToggle(day.value)}
            />
          ))}
        </Box>

        {error && (
          <Typography
            data-slot-error
            id={errorId}
            variant="caption"
            color="error"
            sx={{ mt: 0.75, display: 'block' }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </ShakingTextField>
  );
};

export default ActiveDaysSlider;
