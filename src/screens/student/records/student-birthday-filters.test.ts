import { it, expect, describe } from 'vitest';

import {
  parseBirthdayDate,
  readBirthdayPeriod,
  formatBirthdayDate,
  birthdaySchoolClock,
  getBirthdayDateRange,
} from './student-birthday-filters';

describe('student birthday filters', () => {
  it('selects Today for missing or unsupported periods', () => {
    expect(readBirthdayPeriod(null)).toBe('today');
    expect(readBirthdayPeriod('year')).toBe('today');
    expect(readBirthdayPeriod('next7Days')).toBe('next7Days');
    expect(readBirthdayPeriod('thisMonth')).toBe('thisMonth');
    expect(readBirthdayPeriod('custom')).toBe('custom');
  });

  it('accepts only real, explicitly date-only calendar values', () => {
    expect(parseBirthdayDate('2028-02-29')?.format('YYYY-MM-DD')).toBe('2028-02-29');
    ['', '2027-02-29', '2027-04-31', '2027-1-05', '2027-01-05T00:00:00Z'].forEach((value) => {
      expect(parseBirthdayDate(value)).toBeNull();
    });
  });

  it('keeps historical birthdays as civil dates in any device timezone', () => {
    expect(formatBirthdayDate('2011-12-30', 'DD MMM YYYY')).toBe('30 Dec 2011');
  });

  it('allows same-day and 366-day inclusive custom ranges', () => {
    expect(getBirthdayDateRange('2028-02-29', '2028-02-29').error).toBeUndefined();
    expect(getBirthdayDateRange('2028-01-01', '2028-12-31').error).toBeUndefined();
    expect(getBirthdayDateRange('2027-12-31', '2028-12-31').error).toMatch(/366/);
  });

  it('reports incomplete, reversed and malformed ranges', () => {
    expect(getBirthdayDateRange('', '').error).toBeUndefined();
    expect(getBirthdayDateRange('2026-11-25', '').error).toBeTruthy();
    expect(getBirthdayDateRange('2026-11-26', '2026-11-25').error).toMatch(/on or after/);
    expect(getBirthdayDateRange('2027-04-31', '2027-05-01').error).toBeTruthy();
  });

  it('rotates cache dates at India midnight, independently of the device timezone', () => {
    const before = birthdaySchoolClock(Date.parse('2026-11-25T18:29:59.999Z'));
    const after = birthdaySchoolClock(Date.parse('2026-11-25T18:30:00Z'));
    expect(before.delay).toBe(1);
    expect(before.schoolDate).toBe('2026-11-25');
    expect(after.schoolDate).toBe('2026-11-26');
    expect(after.delay).toBe(24 * 60 * 60 * 1000);
  });
});
