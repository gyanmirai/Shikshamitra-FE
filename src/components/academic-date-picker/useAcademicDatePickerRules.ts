import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { resolveAcademicCalendarId } from 'src/utils/academic-calendar-selection';
import {
  useGetCalendarsQuery,
  useGetCalendarDaysQuery,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import {
  toDateKey,
  appliesToScope,
  isActiveCalendarDay,
  DEFAULT_BLOCKED_DAY_TYPES,
} from './academic-date-picker-utils';

import type { AcademicCalendarDay } from './types';

type Params = {
  academicMediumId?: string;
  calendarId?: string;
  standardId?: string | null;
  divisionId?: string | null;
  divisionIds?: string[];
  blockedDayTypes?: number[];
  anchorDate?: Dayjs | null;
};

export function useAcademicDatePickerRules({
  calendarId,
  standardId,
  divisionId,
  divisionIds,
  academicMediumId,
  anchorDate,
  blockedDayTypes = DEFAULT_BLOCKED_DAY_TYPES,
}: Params) {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(anchorDate || dayjs());
  const resolvedAcademicMediumId = academicMediumId || medium?.id;
  const anchorDateKey = anchorDate?.isValid() ? toDateKey(anchorDate) : undefined;

  useEffect(() => {
    if (anchorDateKey) {
      const date = dayjs(anchorDateKey);
      setVisibleMonth((previous) => date.isSame(previous, 'month') ? previous : date);
    }
  }, [anchorDateKey]);

  const { data: calendarsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicMediumId: resolvedAcademicMediumId },
    options: {
      skip: Boolean(calendarId) || !resolvedAcademicMediumId,
      refetchOnFocus: false,
      refetchOnMountOrArgChange: false,
    },
    popupConfig: { error: false },
  });

  /**
   * Memoization Justification:
   * Resolves the default calendar from API data once per calendar list change.
   * Prevents recalculating published/default fallback on every picker render.
   */
  const resolvedCalendarId = useMemo(() => {
    if (calendarId) return calendarId;
    return resolveAcademicCalendarId(calendarsData?.items || [], toDateKey(visibleMonth));
  }, [calendarId, calendarsData?.items, visibleMonth]);

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
    options: { skip: !resolvedCalendarId, refetchOnFocus: false, refetchOnMountOrArgChange: false },
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
      .filter((day: AcademicCalendarDay) => appliesToScope(day, standardId, divisionId, divisionIds));
  }, [calendarDaysData, divisionId, divisionIds, standardId]);

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
