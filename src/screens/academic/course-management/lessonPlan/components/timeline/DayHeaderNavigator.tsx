'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Tooltip, IconButton } from '@mui/material';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';

type Props = {
  selectedDate: Dayjs;
  onChangeDate: (date: Dayjs) => void;
};

export const DayHeaderNavigator: React.FC<Props> = ({ selectedDate, onChangeDate }) => {
  const handlePrevDay = () => onChangeDate(selectedDate.subtract(1, 'day').startOf('day'));
  const handleNextDay = () => onChangeDate(selectedDate.add(1, 'day').startOf('day'));
  const handleToday = () => onChangeDate(dayjs().startOf('day'));

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      spacing={1.25}
      sx={{
        p: { xs: 1, sm: 1.25 },
        mb: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {/* Left: Day Stepper & Date Picker */}
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
        <Tooltip title="Previous Day" arrow>
          <IconButton
            onClick={handlePrevDay}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:chevron-left" width={18} />
          </IconButton>
        </Tooltip>

        <DatePicker
          label="Selected Date"
          value={selectedDate}
          onChange={(newVal) => newVal && onChangeDate(newVal.startOf('day'))}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              sx: {
                minWidth: 145,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  fontWeight: 600,
                  fontSize: 12.5,
                  py: 0.75,
                },
              },
            },
          }}
        />

        <Tooltip title="Next Day" arrow>
          <IconButton
            onClick={handleNextDay}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:chevron-right" width={18} />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleToday}
          startIcon={<Iconify icon="solar:calendar-linear" width={15} />}
          sx={{
            fontWeight: 600,
            fontSize: 12,
            px: 1.25,
            py: 0.5,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Today
        </Button>
      </Stack>
    </Stack>
  );
};

export default DayHeaderNavigator;
