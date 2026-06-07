import { it, expect, describe } from 'vitest';

import { EventStatus, EventStatusOptions } from './event-type';
import { HolidayStatus, HolidayStatusOptions } from './holiday-status-type';

describe('calendar status enums', () => {
  it('matches backend event status values', () => {
    expect(EventStatus.Upcoming).toBe(0);
    expect(EventStatus.Active).toBe(1);
    expect(EventStatus.Completed).toBe(2);
    expect(EventStatusOptions).toEqual([
      { label: 'Active', value: 1 },
      { label: 'Upcoming', value: 0 },
      { label: 'Completed', value: 2 },
    ]);
  });

  it('matches backend holiday status values', () => {
    expect(HolidayStatus.Upcoming).toBe(0);
    expect(HolidayStatus.Ongoing).toBe(1);
    expect(HolidayStatus.Completed).toBe(2);
    expect(HolidayStatusOptions).toEqual([
      { label: 'Ongoing', value: 1 },
      { label: 'Upcoming', value: 0 },
      { label: 'Completed', value: 2 },
    ]);
  });
});
