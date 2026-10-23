import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  learningTaskDateTime,
  formatLearningTaskDateTime,
  serializeLearningTaskDateTime,
} from './learning-task-date-time';

describe('learning task school-local schedule round trips', () => {
  it.each(['2026-10-23T05:46:00Z', '2026-10-23T05:46:00', '2026-10-23T11:16:00+05:30'])(
    'displays %s as the same school time',
    (value) => {
      expect(formatLearningTaskDateTime(value)).toBe('23-10-2026 11:16');
      expect(serializeLearningTaskDateTime(learningTaskDateTime(value)!)).toBe(
        '2026-10-23T11:16:00+05:30'
      );
    }
  );
  it('preserves selected wall-clock times and sends an explicit offset', () => {
    const selected = dayjs('2026-10-30T17:00:00');
    const payload = serializeLearningTaskDateTime(selected);
    expect(payload).toBe('2026-10-30T17:00:00+05:30');
    expect(new Date(payload).toISOString()).toBe('2026-10-30T11:30:00.000Z');
    expect(formatLearningTaskDateTime(new Date(payload).toISOString())).toBe('30-10-2026 17:00');
  });
  it('does not invent missing or invalid schedule dates', () => {
    expect(learningTaskDateTime(null)).toBeNull();
    expect(formatLearningTaskDateTime('invalid')).toBe('-');
  });
});
