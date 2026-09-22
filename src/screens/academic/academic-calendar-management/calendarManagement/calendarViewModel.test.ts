import { it, expect, describe } from 'vitest';
import { DayType } from 'src/enums/academic-calendar';

import { calculateCalendarSummary } from './calendarSummary';
import {
  buildCalendarDayMap,
  flattenCalendarDayMap,
} from './calendarViewModel';

describe('academic calendar view model', () => {
  it('collapses duplicate class records before expanding a date range', () => {
    const duplicateRange = {
      date: '2026-10-01T00:00:00Z',
      endDate: '2026-10-03T00:00:00Z',
      dayType: DayType.Vacation,
      title: 'Navratri break',
    };

    const dayMap = buildCalendarDayMap(
      [
        { ...duplicateRange, id: 'class-1', standardId: '1' },
        { ...duplicateRange, id: 'class-2', standardId: '2' },
      ],
      '2026-06-01',
      '2027-05-31'
    );

    expect(Object.keys(dayMap)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    expect(flattenCalendarDayMap(dayMap)).toHaveLength(3);
  });

  it('clips broad ranges to the selected calendar boundaries', () => {
    const dayMap = buildCalendarDayMap(
      [
        {
          date: '2000-01-01T00:00:00Z',
          endDate: '2100-01-01T00:00:00Z',
          dayType: DayType.Holiday,
          title: 'Invalid broad range',
        },
      ],
      '2026-06-01',
      '2026-06-03'
    );

    expect(Object.keys(dayMap)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
  });

  it('does not re-expand API rows that already materialize every range date', () => {
    const materializedRange = ['01', '02', '03'].map((day) => ({
      date: `2026-10-${day}T00:00:00Z`,
      endDate: '2026-10-03T00:00:00Z',
      dayType: DayType.Vacation,
      title: 'Navratri break',
    }));

    const dayMap = buildCalendarDayMap(materializedRange, '2026-06-01', '2027-05-31');

    expect(flattenCalendarDayMap(dayMap)).toHaveLength(3);
    expect(Object.keys(dayMap)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
  });

  it('counts unique holiday dates and honors working-day overrides', () => {
    const summary = calculateCalendarSummary(
      [
        {
          date: '2026-06-01T00:00:00Z',
          endDate: '2026-06-02T00:00:00Z',
          dayType: DayType.Holiday,
          title: 'Break',
        },
        {
          date: '2026-06-06T00:00:00Z',
          dayType: DayType.WorkingDay,
          title: 'Working Saturday',
        },
      ],
      '2026-06-01',
      '2026-06-07'
    );

    expect(summary).toEqual({ totalWorkingDays: 4, totalHolidays: 2 });
  });
});
