import type { DateRange } from 'src/components/custom-date-range-picker';
import type { BirthdayPeriod } from 'src/redux/student/records/student-birthdays-api';

import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { BIRTHDAY_PERIODS, parseBirthdayDate } from './student-birthday-filters';

interface Props {
  period: BirthdayPeriod;
  dates: DateRange;
  error?: string;
  schoolDate?: string;
  rangeLabel?: string;
  disabled: boolean;
  onPeriodChange: (value: BirthdayPeriod) => void;
  onDateChange: (range: DateRange) => void;
}

export default function StudentBirthdayPeriodFilter({
  period,
  dates,
  error,
  schoolDate,
  rangeLabel,
  disabled,
  onPeriodChange,
  onDateChange,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ px: 1, borderRadius: 2, flexShrink: 0, minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        gap={{ xs: 0, lg: 1 }}
        alignItems={{ lg: 'center' }}
      >
        <Typography
          id="birthday-period-label"
          variant="subtitle2"
          sx={{ flexShrink: 0, py: { xs: 0.5, lg: 0 } }}
        >
          Birthday period
        </Typography>
        <Box sx={{ overflowX: 'auto', minWidth: 0 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={period}
            disabled={disabled}
            aria-labelledby="birthday-period-label"
            onChange={(_, value: BirthdayPeriod | null) => {
              if (value) onPeriodChange(value);
            }}
            sx={{
              '& .MuiToggleButton-root': {
                minHeight: 44,
                border: 0,
                borderRadius: 0,
                borderBottom: '2px solid transparent',
                px: 1.5,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
              },
              '& .MuiToggleButton-root.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'transparent',
                borderBottomColor: 'primary.main',
              },
              '& .MuiToggleButton-root.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2,
              },
            }}
          >
            {BIRTHDAY_PERIODS.map(({ value, label }) => (
              <ToggleButton value={value} key={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        {rangeLabel && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: { lg: 'auto' }, pb: { xs: 0.75, lg: 0 } }}
          >
            {rangeLabel}
          </Typography>
        )}
      </Stack>
      {period === 'custom' && (
        <Box sx={{ maxWidth: 360, py: 1 }}>
          <CustomDateRangePicker
            label="Date range"
            dateFormat="DD/MM/YYYY"
            referenceDate={parseBirthdayDate(schoolDate ?? '') ?? undefined}
            value={dates}
            error={Boolean(error)}
            helperText={error}
            disabled={disabled}
            onChange={onDateChange}
          />
        </Box>
      )}
    </Paper>
  );
}
