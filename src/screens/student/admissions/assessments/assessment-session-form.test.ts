import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { assessmentSessionSchema, assessmentSessionSchemaWithBookings } from './assessment-session-form';

const session = {
  name: 'Grade 6 entrance assessment', location: 'Room 12', capacity: 30,
  startsAt: '2026-10-12T09:00:00+05:30', endsAt: '2026-10-12T10:00:00+05:30',
};

describe('assessment session validation', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-10T00:00:00Z')); });
  afterEach(() => vi.useRealTimers());
  it('accepts a complete session with offset date-times', async () => {
    await expect(assessmentSessionSchema.validate(session)).resolves.toEqual(session);
  });

  it('compares time instants across offsets instead of local text order', async () => {
    await expect(assessmentSessionSchema.validate({ ...session, endsAt: '2026-10-12T04:00:00Z' })).resolves.toBeTruthy();
    await expect(assessmentSessionSchema.validate({ ...session, endsAt: '2026-10-12T03:00:00Z' }))
      .rejects.toThrow('End must be after the start');
  });

  it.each([0, -1, 1.5, 10001])('rejects invalid capacity %s before submitting', async (capacity) => {
    await expect(assessmentSessionSchema.validate({ ...session, capacity })).rejects.toThrow();
  });

  it('rejects blank dates and names', async () => {
    await expect(assessmentSessionSchema.validate({ ...session, name: '   ' })).rejects.toThrow('Session name is required');
    await expect(assessmentSessionSchema.validate({ ...session, startsAt: '', endsAt: '' })).rejects.toThrow();
  });

  it('uses the server text-length limits', async () => {
    await expect(assessmentSessionSchema.validate({ ...session, name: 'a'.repeat(129) })).rejects.toThrow();
    await expect(assessmentSessionSchema.validate({ ...session, location: 'a'.repeat(257) })).rejects.toThrow();
  });
  it('rejects sessions that already started', async () => {
    await expect(assessmentSessionSchema.validate({ ...session, startsAt: '2026-09-09T03:00:00Z' }))
      .rejects.toThrow('The session must start in the future');
  });
  it('protects existing bookings when reducing capacity', async () => {
    await expect(assessmentSessionSchemaWithBookings(12).validate({ ...session, capacity: 10 }))
      .rejects.toThrow('Capacity cannot be below the 12 existing bookings');
  });
});
