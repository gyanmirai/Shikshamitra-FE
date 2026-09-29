import { vi, it, expect, describe } from 'vitest';
import { DayType } from 'src/enums/academic-calendar';
import { render, screen, fireEvent } from '@testing-library/react';

import AcademicCalendarView from './AcademicCalendarView';

type CalendarEvent = {
  title: string;
  start: string;
  extendedProps: { markerId?: string };
};

type MockCalendarProps = {
  data: CalendarEvent[];
  dateClick: (arg: { dateStr: string }) => void;
  onDateClick: (arg: { event: { startStr: string; extendedProps: { markerId?: string } } }) => void;
};

vi.mock('src/components/calender', () => ({
  default: ({ data, dateClick, onDateClick }: MockCalendarProps) => (
    <div>
      {data.map((event) => (
        <button
          key={event.start}
          type="button"
          onClick={() =>
            onDateClick({
              event: { startStr: event.start, extendedProps: event.extendedProps },
            })
          }
        >
          {event.title}
        </button>
      ))}
      <button type="button" onClick={() => dateClick({ dateStr: '2026-09-26' })}>
        Empty academic day
      </button>
      <button type="button" onClick={() => dateClick({ dateStr: '2027-06-01' })}>
        Outside academic year
      </button>
    </div>
  ),
}));

describe('AcademicCalendarView', () => {
  it('opens the selected marker on its date', () => {
    const onDayClick = vi.fn();
    render(
      <AcademicCalendarView
        calendarId="calendar-1"
        dayMap={{
          '2026-09-25': [
            { id: 'exam-1', dayType: DayType.Exam, title: 'Computer science practical' },
          ],
        }}
        calendarStartDate="2026-06-01"
        calendarEndDate="2027-05-31"
        isLoading={false}
        onDayClick={onDayClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Computer science practical' }));
    expect(onDayClick).toHaveBeenCalledWith('2026-09-25', 'exam-1');
  });

  it('opens empty academic dates and ignores dates outside the calendar', () => {
    const onDayClick = vi.fn();
    render(
      <AcademicCalendarView
        calendarId="calendar-1"
        dayMap={{}}
        calendarStartDate="2026-06-01"
        calendarEndDate="2027-05-31"
        isLoading={false}
        onDayClick={onDayClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Empty academic day' }));
    fireEvent.click(screen.getByRole('button', { name: 'Outside academic year' }));
    expect(onDayClick).toHaveBeenCalledOnce();
    expect(onDayClick).toHaveBeenCalledWith('2026-09-26');
  });
});
