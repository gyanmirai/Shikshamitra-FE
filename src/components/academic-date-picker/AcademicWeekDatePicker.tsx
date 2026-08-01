'use client';

import type { Dayjs } from 'dayjs';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Box, Card, Stack, Button, Popover, Typography, IconButton } from '@mui/material';

interface CustomWeekPickersDayProps extends PickersDayProps {
  selectedDate?: Dayjs | null;
  hoveredDate?: Dayjs | null;
  setHoveredDate?: (d: Dayjs | null) => void;
}

const StyledWeekPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelectedWeek' &&
    prop !== 'isFirstDay' &&
    prop !== 'isLastDay' &&
    prop !== 'isHoveredWeek',
})<{
  isSelectedWeek?: boolean;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isHoveredWeek?: boolean;
}>(({ theme, isSelectedWeek, isFirstDay, isLastDay, isHoveredWeek }) => ({
  ...(isSelectedWeek && {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: '#FFFFFF !important',
    fontWeight: 'bold',
    borderRadius: '0 !important',
    '&:hover': {
      backgroundColor: `${theme.palette.primary.dark} !important`,
    },
    ...(isFirstDay && {
      borderTopLeftRadius: '16px !important',
      borderBottomLeftRadius: '16px !important',
    }),
    ...(isLastDay && {
      borderTopRightRadius: '16px !important',
      borderBottomRightRadius: '16px !important',
    }),
  }),
  ...(!isSelectedWeek &&
    isHoveredWeek && {
      backgroundColor: `${alpha(theme.palette.primary.main, 0.22)} !important`,
      borderRadius: '0 !important',
      ...(isFirstDay && {
        borderTopLeftRadius: '16px !important',
        borderBottomLeftRadius: '16px !important',
      }),
      ...(isLastDay && {
        borderTopRightRadius: '16px !important',
        borderBottomRightRadius: '16px !important',
      }),
    }),
}));

function WeekPickersDay(props: CustomWeekPickersDayProps) {
  const { day, selectedDate, hoveredDate, setHoveredDate, onMouseEnter, onMouseLeave, ...other } =
    props;

  const safeDay = day ? dayjs(day) : null;
  const safeSelectedDate = selectedDate ? dayjs(selectedDate) : null;
  const safeHoveredDate =
    hoveredDate && typeof (hoveredDate as any).startOf === 'function' ? dayjs(hoveredDate) : null;

  const isSelectedWeek = React.useMemo(() => {
    if (!safeSelectedDate || !safeDay) return false;
    const start = safeSelectedDate.startOf('week');
    const end = safeSelectedDate.endOf('week');
    return safeDay.isAfter(start.subtract(1, 'second')) && safeDay.isBefore(end.add(1, 'second'));
  }, [safeDay, safeSelectedDate]);

  const isHoveredWeek = React.useMemo(() => {
    if (!safeHoveredDate || !safeDay) return false;
    const start = safeHoveredDate.startOf('week');
    const end = safeHoveredDate.endOf('week');
    return safeDay.isAfter(start.subtract(1, 'second')) && safeDay.isBefore(end.add(1, 'second'));
  }, [safeDay, safeHoveredDate]);

  const isFirstDay = safeDay ? safeDay.isSame(safeDay.startOf('week'), 'day') : false;
  const isLastDay = safeDay ? safeDay.isSame(safeDay.endOf('week'), 'day') : false;

  return (
    <StyledWeekPickersDay
      {...(other as PickersDayProps)}
      day={day}
      isSelectedWeek={isSelectedWeek}
      isHoveredWeek={isHoveredWeek}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
      onMouseEnter={(event) => {
        if (day) setHoveredDate?.(dayjs(day));
        (onMouseEnter as any)?.(event, day);
      }}
      onMouseLeave={(event) => {
        setHoveredDate?.(null);
        (onMouseLeave as any)?.(event, day);
      }}
    />
  );
}

export interface AcademicWeekDatePickerProps {
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  label?: string;
  subLabel?: string;
}

export default function AcademicWeekDatePicker({
  value,
  onChange,
  label,
  subLabel = 'Current week',
}: AcademicWeekDatePickerProps) {
  const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLElement | null>(null);

  const selectedVal = value ? dayjs(value) : dayjs();

  const handlePrevWeek = () => {
    onChange(selectedVal.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    onChange(selectedVal.add(1, 'week'));
  };

  const handleCurrentWeek = () => {
    onChange(dayjs());
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);

  return (
    <Card
      variant="outlined"
      sx={{
        p: label ? 1.5 : 1,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        borderColor: 'divider',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: label ? 1 : 0,
      }}
    >
      {/* Title / Timezone Label */}
      {label && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:calendar-bold" width={16} color="text.secondary" />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {label}
          </Typography>
        </Stack>
      )}

      {/* Week Selector Control Row */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Prev Week Button */}
        <IconButton
          size="small"
          onClick={handlePrevWeek}
          sx={{
            bgcolor: 'background.paper',
            border: (t) => `1px solid ${t.palette.divider}`,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          title="Previous Week"
        >
          <Iconify icon="mdi:chevron-left" width={18} />
        </IconButton>

        {/* Date Display Pill / Button */}
        <Button
          variant="outlined"
          onClick={handleOpenPopover}
          sx={{
            bgcolor: 'background.paper',
            borderColor: isOpen ? 'primary.main' : 'divider',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: 13,
            px: 2,
            py: 0.75,
            minWidth: 140,
            borderRadius: 1.5,
            textTransform: 'none',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
            },
          }}
        >
          {selectedVal.format('MMM DD, YYYY')}
        </Button>

        {/* Next Week Button */}
        <IconButton
          size="small"
          onClick={handleNextWeek}
          sx={{
            bgcolor: 'background.paper',
            border: (t) => `1px solid ${t.palette.divider}`,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          title="Next Week"
        >
          <Iconify icon="mdi:chevron-right" width={18} />
        </IconButton>

        {/* Current Week Quick Button */}
        <Button
          variant="text"
          size="small"
          onClick={handleCurrentWeek}
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            fontSize: 12,
            textTransform: 'none',
            px: 1,
          }}
        >
          {subLabel}
        </Button>
      </Stack>

      {/* Popover containing the DatePicker calendar with week highlighting */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              borderRadius: 2,
              boxShadow: 'var(--shadows-16)',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <DatePicker
          value={selectedVal}
          onChange={(newVal) => {
            if (newVal) {
              onChange(dayjs(newVal));
              handleClosePopover();
            }
          }}
          slots={{
            day: WeekPickersDay as any,
          }}
          slotProps={{
            day: {
              selectedDate: selectedVal,
              hoveredDate,
              setHoveredDate,
            } as any,
          }}
        />
      </Popover>
    </Card>
  );
}
