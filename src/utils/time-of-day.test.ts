import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { parseWallClockTime, formatWallClockTime } from './time-of-day';

describe('parseWallClockTime', () => {
  it('strips ISO offset and returns wall-clock Dayjs (the bug scenario)', () => {
    // Backend sends 13:00 with +00:00 offset — must NOT shift to IST
    const result = parseWallClockTime('2026-08-10T13:00:00+00:00');
    expect(result).not.toBeNull();
    expect(result!.hour()).toBe(13);
    expect(result!.minute()).toBe(0);
    // Double-check: naive dayjs would give 18:30 IST — we must NOT get that
    expect(result!.hour()).not.toBe(18);
  });

  it('strips ISO offset for end time too', () => {
    const result = parseWallClockTime('2026-08-10T17:00:00+00:00');
    expect(result).not.toBeNull();
    expect(result!.hour()).toBe(17);
    expect(result!.minute()).toBe(0);
  });

  it('parses bare HH:mm:ss strings', () => {
    const result = parseWallClockTime('09:30:00');
    expect(result).not.toBeNull();
    expect(result!.hour()).toBe(9);
    expect(result!.minute()).toBe(30);
  });

  it('parses bare HH:mm strings', () => {
    const result = parseWallClockTime('14:45');
    expect(result).not.toBeNull();
    expect(result!.hour()).toBe(14);
    expect(result!.minute()).toBe(45);
  });

  it('parses 12-hour clock strings', () => {
    const result = parseWallClockTime('02:30 PM');
    expect(result).not.toBeNull();
    expect(result!.hour()).toBe(14);
    expect(result!.minute()).toBe(30);
  });

  it('returns null for empty / null / undefined', () => {
    expect(parseWallClockTime(null)).toBeNull();
    expect(parseWallClockTime(undefined)).toBeNull();
    expect(parseWallClockTime('')).toBeNull();
  });

  it('returns null for completely unparseable strings', () => {
    expect(parseWallClockTime('not-a-time')).toBeNull();
  });
});

describe('formatWallClockTime', () => {
  it('formats ISO offset strings as hh:mm A', () => {
    expect(formatWallClockTime('2026-08-10T13:00:00+00:00')).toBe('01:00 PM');
    expect(formatWallClockTime('2026-08-10T09:30:00+00:00')).toBe('09:30 AM');
  });

  it('formats bare HH:mm:ss strings', () => {
    expect(formatWallClockTime('17:00:00')).toBe('05:00 PM');
    expect(formatWallClockTime('08:15:00')).toBe('08:15 AM');
  });

  it('returns dash for falsy input', () => {
    expect(formatWallClockTime(null)).toBe('-');
    expect(formatWallClockTime('')).toBe('-');
  });
});
