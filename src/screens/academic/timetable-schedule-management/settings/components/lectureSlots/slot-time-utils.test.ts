import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { cascadeFromIndex } from './slot-time-utils';

it('cascades an edited end time while preserving a later break duration and the original draft', () => {
  const slots = [
    {
      id: 'period',
      startTime: dayjs('2026-11-03T12:00:00'),
      endTime: dayjs('2026-11-03T12:45:00'),
      slotType: 'period',
      breakType: '',
    },
    {
      id: 'break',
      startTime: dayjs('2026-11-03T12:30:00'),
      endTime: dayjs('2026-11-03T12:45:00'),
      slotType: 'break',
      breakType: 'short',
    },
    {
      id: 'next',
      startTime: dayjs('2026-11-03T12:45:00'),
      endTime: dayjs('2026-11-03T13:15:00'),
      slotType: 'period',
      breakType: '',
    },
  ];
  const next = cascadeFromIndex(slots, 0);
  expect(next[1].startTime?.format('HH:mm')).toBe('12:45');
  expect(next[1].endTime?.format('HH:mm')).toBe('13:00');
  expect(next[1].slotType).toBe('break');
  expect(next[2].startTime?.format('HH:mm')).toBe('13:00');
  expect(next[2].endTime?.format('HH:mm')).toBe('13:30');
  expect(slots[1].startTime.format('HH:mm')).toBe('12:30');
});
