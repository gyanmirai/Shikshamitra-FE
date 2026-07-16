import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarStatus } from 'src/enums/academic-calendar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetCalendarsQuery,
  useGetCalendarDaysQuery,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import type { RootState } from 'src/redux/store';
import type { AcademicCalendarDay } from './types';

import {
  toDateKey,
  appliesToScope,
  isActiveCalendarDay,
  DEFAULT_BLOCKED_DAY_TYPES,
} from './academic-date-picker-utils';

type Params = {
  academicYearId?: string;
  calendarId?: string;
  standardId?: string | null;
  divisionId?: string | null;
  blockedDayTypes?: number[];
  anchorDate?: Dayjs | null;
};

export function useAcademicDatePickerRules({
  calendarId,
  standardId,
  divisionId,
  academicYearId,
  anchorDate,
  blockedDayTypes = DEFAULT_BLOCKED_DAY_TYPES,
}: Params) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(anchorDate || dayjs());
  const resolvedAcademicYearId = academicYearId || currentYear?.id;

  useEffect(() => {
    if (anchorDate?.isValid() && !anchorDate.isSame(visibleMonth, 'month')) {
      setVisibleMonth(anchorDate);
    }
  }, [anchorDate, visibleMonth]);

  const { data: calendarsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicYearId: resolvedAcademicYearId },
    options: { skip: Boolean(calendarId) || !resolvedAcademicYearId },
    popupConfig: { error: false },
  });

  /**
   * Memoization Justification:
   * Resolves the default calendar from API data once per calendar list change.
   * Prevents recalculating published/default fallback on every picker render.
   */
  const resolvedCalendarId = useMemo(() => {
    if (calendarId) return calendarId;
    const calendars = calendarsData?.items || [];
    return (
      calendars.find((item: { status?: number }) => item.status === CalendarStatus.Published)?.id ||
      calendars.find((item: { isDefault?: boolean }) => item.isDefault)?.id ||
      calendars[0]?.id ||
      ''
    );
  }, [calendarId, calendarsData?.items]);

  const { data: calendarDaysData, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarDaysQuery,
    params: resolvedCalendarId
      ? {
          calendarId: resolvedCalendarId,
          month: visibleMonth.month() + 1,
          year: visibleMonth.year(),
        }
      : null,
    options: { skip: !resolvedCalendarId },
    popupConfig: { error: false },
  });

  /**
   * Memoization Justification:
   * Filters month calendar markers by active status and class/division scope.
   * The result is reused by day rendering and disable checks for each visible date cell.
   */
  const scopedDays = useMemo<AcademicCalendarDay[]>(() => {
    const days = Array.isArray(calendarDaysData) ? calendarDaysData : calendarDaysData?.items || [];
    return days
      .filter(isActiveCalendarDay)
      .filter((day: AcademicCalendarDay) => appliesToScope(day, standardId, divisionId));
  }, [calendarDaysData, divisionId, standardId]);

  /**
   * Memoization Justification:
   * DatePicker calls day rendering and shouldDisableDate many times per month.
   * A date-key map keeps those lookups constant-time instead of scanning all markers repeatedly.
   */
  const daysByDate = useMemo(
    () =>
      scopedDays.reduce<Record<string, AcademicCalendarDay[]>>((acc, day) => {
        const key = toDateKey(day.date);
        acc[key] = [...(acc[key] || []), day];
        return acc;
      }, {}),
    [scopedDays]
  );

  const blockedDayTypeSet = new Set(blockedDayTypes);

  const getBlockingDay = (date: Dayjs) =>
    (daysByDate[toDateKey(date)] || []).find((day) => blockedDayTypeSet.has(day.dayType));

  return {
    daysByDate,
    isFetching,
    visibleMonth,
    setVisibleMonth,
    getBlockingDay,
  };
}
