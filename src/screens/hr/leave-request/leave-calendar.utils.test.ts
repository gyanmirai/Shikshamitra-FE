import { it, expect, describe } from 'vitest';
import {
  dedupeCalendarItemsById,
  shouldMarkCalendarCapReached,
  buildCalendarVisibleRangePayload,
} from 'src/screens/hr/leave-request/leave-calendar.utils';

describe('leave calendar utils', () => {
  it('builds offset-preserving calendar range payload', () => {
    const start = new Date('2026-04-01T00:00:00-07:00');
    const endExclusive = new Date('2026-05-01T00:00:00-07:00');

    const payload = buildCalendarVisibleRangePayload(start, endExclusive);

    expect(payload.rangeStart).not.toContain('Z');
    expect(payload.rangeEnd).not.toContain('Z');
    expect(payload.rangeStart).toMatch(/^2026-04-01T00:00:00\.000[+-]\d{2}:\d{2}$/);
    expect(payload.rangeEnd).toMatch(/^2026-04-30T23:59:59\.999[+-]\d{2}:\d{2}$/);
  });

  it('deduplicates calendar items by id while preserving latest occurrence', () => {
    const input = [
      { id: '1', status: 'PENDING' },
      { id: '2', status: 'APPROVED' },
      { id: '1', status: 'REJECTED' },
      { status: 'NO_ID' },
    ];

    const deduped = dedupeCalendarItemsById(input);

    expect(deduped).toEqual([
      { id: '1', status: 'REJECTED' },
      { id: '2', status: 'APPROVED' },
    ]);
  });

  it('can flag guard-cap scenario when total exceeds fetched rows', () => {
    expect(shouldMarkCalendarCapReached(true, 20500, 20000)).toBe(true);
    expect(shouldMarkCalendarCapReached(false, 20500, 20000)).toBe(false);
    expect(shouldMarkCalendarCapReached(true, 20000, 20000)).toBe(false);
  });
});
