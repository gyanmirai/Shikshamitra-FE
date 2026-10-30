import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

import { getCalendarDayTitle } from './academic-date-picker-utils';
import AcademicCalendarPickersDay from './AcademicCalendarPickersDay';
import { useAcademicDatePickerRules } from './useAcademicDatePickerRules';

import type { AcademicDatePickerProps } from './types';

export default function AcademicDatePicker({
  calendarId,
  standardId,
  divisionId,
  divisionIds,
  academicYearId: _academicYearId,
  academicMediumId,
  validationType: _validationType,
  blockedDayTypes,
  helperText,
  showCalendarMarkers = true,
  onBlockedDateClick,
  shouldDisableDate,
  onMonthChange,
  onChange,
  slots,
  slotProps,
  ...datePickerProps
}: AcademicDatePickerProps) {
  const { daysByDate, isFetching, setVisibleMonth, getBlockingDay } = useAcademicDatePickerRules({
    calendarId,
    standardId,
    divisionId,
    divisionIds,
    academicMediumId,
    blockedDayTypes,
    anchorDate: datePickerProps.value || null,
  });

  const [clickedBlockedMessage, setClickedBlockedMessage] = React.useState('');

  const getBlockedDateMessage = (date: Dayjs) => {
    const blockedDay = getBlockingDay(date);
    return blockedDay ? `${getCalendarDayTitle(blockedDay)} is blocked in academic calendar.` : '';
  };

  return (
    <DatePicker
      {...datePickerProps}
      onMonthChange={(month) => {
        setVisibleMonth(month);
        onMonthChange?.(month);
      }}
      onChange={(value, context) => {
        setClickedBlockedMessage('');
        onChange?.(value, context);
      }}
      shouldDisableDate={(date) =>
        Boolean(getBlockingDay(date)) || Boolean(shouldDisableDate?.(date))
      }
      slots={{
        ...slots,
        day: showCalendarMarkers
          ? (AcademicCalendarPickersDay as NonNullable<DatePickerProps['slots']>['day'])
          : slots?.day,
      }}
      format="DD/MM/YYYY"
      slotProps={{
        ...slotProps,
        day: {
          ...(slotProps?.day as object),
          calendarDaysByDate: showCalendarMarkers ? daysByDate : {},
          onBlockedClick: (clickedDay: Dayjs) => {
            const blockedDay = getBlockingDay(clickedDay);
            if (blockedDay) {
              setClickedBlockedMessage(
                `${getCalendarDayTitle(blockedDay)} is blocked in academic calendar.`
              );
              setTimeout(() => setClickedBlockedMessage(''), 3000);
              onBlockedDateClick?.(blockedDay);
            }
          },
        } as NonNullable<DatePickerProps['slotProps']>['day'],
        textField: {
          ...(slotProps?.textField as object),
          error: Boolean(clickedBlockedMessage) || (slotProps?.textField as any)?.error,
          helperText:
            clickedBlockedMessage ||
            helperText ||
            (datePickerProps.value ? getBlockedDateMessage(datePickerProps.value) : undefined),
          FormHelperTextProps: {
            sx: {
              mx: 0,
              mt: 1,
              fontSize: '11px',
              fontWeight: 600,
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 10,
              whiteSpace: 'nowrap',
              bgcolor: 'background.paper',
              color: 'error.main',
              px: 1.5,
              py: 0.5,
              borderRadius: 0.75,
              border: (t) => `1px solid ${t.palette.error.main}`,
              boxShadow: 'var(--shadows-4)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -5,
                left: 16,
                width: 8,
                height: 8,
                bgcolor: 'background.paper',
                borderTop: (t) => `1px solid ${t.palette.error.main}`,
                borderLeft: (t) => `1px solid ${t.palette.error.main}`,
                transform: 'rotate(45deg)',
              },
              ...(slotProps?.textField as any)?.FormHelperTextProps?.sx,
            },
            ...(slotProps?.textField as any)?.FormHelperTextProps,
          },
        },
      }}
      loading={datePickerProps.loading || isFetching}
      renderLoading={datePickerProps.renderLoading || (() => <DayCalendarSkeleton />)}
    />
  );
}
