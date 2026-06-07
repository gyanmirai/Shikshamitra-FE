import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { buildEventPayload, isMeetingEventTypeName } from './buildEventPayload';

const baseValues = {
  title: 'Annual Day',
  type: 'event-type-1',
  description: 'Description',
  attachment: '',
  eventMode: 'offline',
  venue: 'Auditorium',
  isRecurring: false,
  startTime: dayjs('2026-06-10T09:00:00Z'),
  endTime: dayjs('2026-06-10T10:00:00Z'),
  audience: ['group-1'],
};

describe('buildEventPayload', () => {
  it('recognizes both UI and backend meeting event names', () => {
    expect(isMeetingEventTypeName('Meeting')).toBe(true);
    expect(isMeetingEventTypeName('Meeting Event')).toBe(true);
    expect(isMeetingEventTypeName('Annual Event')).toBe(false);
  });

  it('sends only meetingDate for backend meeting events', () => {
    const payload = buildEventPayload(
      {
        ...baseValues,
        typeName: 'Meeting Event',
        meetingDate: dayjs('2026-06-15'),
        startDate: dayjs('2026-06-01'),
        endDate: dayjs('2026-06-02'),
      },
      'academic-year-1'
    );

    expect(payload.meetingDate).toBe('2026-06-15');
    expect(payload.startDate).toBeUndefined();
    expect(payload.endDate).toBeUndefined();
  });

  it('sends date range and omits meetingDate for normal events', () => {
    const payload = buildEventPayload(
      {
        ...baseValues,
        typeName: 'Annual Event',
        meetingDate: dayjs('2026-06-15'),
        startDate: dayjs('2026-06-01T09:00:00Z'),
        endDate: dayjs('2026-06-02T10:00:00Z'),
      },
      'academic-year-1'
    );

    expect(payload.meetingDate).toBeUndefined();
    expect(payload.startDate).toBe(dayjs('2026-06-01T09:00:00Z').toISOString());
    expect(payload.endDate).toBe(dayjs('2026-06-02T10:00:00Z').toISOString());
  });
});
