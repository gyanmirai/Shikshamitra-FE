import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import AcademicCalendarPickersDay from './AcademicCalendarPickersDay';
import { getCalendarDayTitle } from './academic-date-picker-utils';
import { useAcademicDatePickerRules } from './useAcademicDatePickerRules';

import type { AcademicDateTimePickerProps } from './types';

export default function AcademicDateTimePicker({
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
  ...dateTimePickerProps
}: AcademicDateTimePickerProps) {
  const { daysByDate, isFetching, setVisibleMonth, getBlockingDay } = useAcademicDatePickerRules({
    calendarId,
    standardId,
    divisionId,
    academicYearId,
    blockedDayTypes,
    anchorDate: dateTimePickerProps.value || null,
  });

  const getBlockedDateMessage = (date: NonNullable<AcademicDateTimePickerProps['value']>) => {
    const blockedDay = getBlockingDay(date);
    return blockedDay ? `${getCalendarDayTitle(blockedDay)} is blocked in academic calendar.` : '';
  };

  return (
    <DateTimePicker
      {...dateTimePickerProps}
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
          ? (AcademicCalendarPickersDay as NonNullable<DateTimePickerProps['slots']>['day'])
          : slots?.day,
      }}
      slotProps={{
        ...slotProps,
        day: {
          ...(slotProps?.day as object),
          calendarDaysByDate: showCalendarMarkers ? daysByDate : {},
        } as NonNullable<DateTimePickerProps['slotProps']>['day'],
        textField: {
          ...(slotProps?.textField as object),
          helperText:
            helperText ||
            (dateTimePickerProps.value ? getBlockedDateMessage(dateTimePickerProps.value) : undefined),
        },
      }}
      loading={dateTimePickerProps.loading || isFetching}
    />
  );
}
