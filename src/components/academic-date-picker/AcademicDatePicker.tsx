import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import AcademicCalendarPickersDay from './AcademicCalendarPickersDay';
import { getCalendarDayTitle } from './academic-date-picker-utils';
import { useAcademicDatePickerRules } from './useAcademicDatePickerRules';

import type { AcademicDatePickerProps } from './types';

export default function AcademicDatePicker({
  calendarId,
  standardId,
  divisionId,
  academicYearId,
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
    academicYearId,
    blockedDayTypes,
    anchorDate: datePickerProps.value || null,
  });

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
        if (value) {
          const blockedDay = getBlockingDay(value);
          if (blockedDay) {
            onBlockedDateClick?.(blockedDay);
            return;
          }
        }
        onChange?.(value, context);
      }}
      shouldDisableDate={(date) => Boolean(getBlockingDay(date)) || Boolean(shouldDisableDate?.(date))}
      slots={{
        ...slots,
        day: showCalendarMarkers
          ? (AcademicCalendarPickersDay as NonNullable<DatePickerProps['slots']>['day'])
          : slots?.day,
      }}
      format='DD/MM/YYYY'
      slotProps={{
        ...slotProps,
        day: {
          ...(slotProps?.day as object),
          calendarDaysByDate: showCalendarMarkers ? daysByDate : {},
        } as NonNullable<DatePickerProps['slotProps']>['day'],
        textField: {
          ...(slotProps?.textField as object),
          helperText:
            helperText ||
            (datePickerProps.value ? getBlockedDateMessage(datePickerProps.value) : undefined),
        },
      }}
      loading={datePickerProps.loading || isFetching}
    />
  );
}
