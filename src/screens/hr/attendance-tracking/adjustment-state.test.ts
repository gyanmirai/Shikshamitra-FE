import { it, expect, describe } from 'vitest';

import {
  validateAttendanceDraft,
  getAttendanceAdjustmentTimes,
  usesAttendanceAdjustmentTimes,
  getSingleAttendanceAdjustmentFailure,
} from './adjustment-state';

const manual = { captureMode: 'manual_status' as const, canEdit: true };
const timed = { captureMode: 'manual_with_time' as const, canEdit: true };
const integrated = { captureMode: 'integrated' as const, canEdit: true };
const draft = {
  status: 'Present',
  inTime: '',
  outTime: '',
  remarks: 'Retained',
  reason: 'Correction',
};

describe('attendance register capture-aware corrections', () => {
  it.each(['Present', 'HalfDayLeave', 'FullDayLeave'])(
    'accepts %s without invented punch times for status-only attendance',
    (status) => {
      expect(validateAttendanceDraft({ ...draft, status }, [manual])).toEqual({});
      expect(usesAttendanceAdjustmentTimes([manual])).toBe(false);
    }
  );

  it('strips stale hidden time fields from all-status-only requests', () => {
    const changed = { ...draft, inTime: '09:00', outTime: '17:00' };
    expect(getAttendanceAdjustmentTimes(changed, [manual])).toEqual({ inTime: '', outTime: '' });
    expect(changed).toMatchObject({ inTime: '09:00', outTime: '17:00' });
  });

  it.each([timed, integrated, { canEdit: true }])(
    'keeps required punches for a time-based or unknown mode %j',
    (row) => {
      expect(validateAttendanceDraft(draft, [row])).toEqual({
        inTime: 'In time is required.',
        outTime: 'Out time is required.',
      });
      expect(validateAttendanceDraft({ ...draft, status: 'HalfDayLeave' }, [row])).toHaveProperty(
        'inTime'
      );
      expect(validateAttendanceDraft({ ...draft, status: 'FullDayLeave' }, [row])).toEqual({});
    }
  );

  it('requires times for mixed editable selections but ignores locked timed rows', () => {
    expect(usesAttendanceAdjustmentTimes([manual, timed])).toBe(true);
    expect(validateAttendanceDraft(draft, [manual, timed])).toHaveProperty('outTime');
    expect(validateAttendanceDraft(draft, [manual, { ...timed, canEdit: false }])).toEqual({});
    const withTimes = { ...draft, inTime: '09:00', outTime: '17:00' };
    expect(validateAttendanceDraft(withTimes, [manual, timed])).toEqual({});
    expect(getAttendanceAdjustmentTimes(withTimes, [manual, timed])).toEqual({
      inTime: '09:00',
      outTime: '17:00',
    });
  });

  it.each([
    ['09:00', '', 'outTime'],
    ['', '17:00', 'inTime'],
    ['25:00', '17:00', 'inTime'],
    ['09:00', '17:99', 'outTime'],
    ['17:00', '09:00', 'outTime'],
    ['09:00', '09:00', 'outTime'],
  ])('retains pair, range and order validation for %s to %s', (inTime, outTime, field) => {
    expect(validateAttendanceDraft({ ...draft, inTime, outTime }, [timed])).toHaveProperty(field);
  });
});

describe('single-row adjustment acknowledgements', () => {
  it('accepts a confirmed update only', () => {
    expect(
      getSingleAttendanceAdjustmentFailure({
        updatedCount: 1,
        skippedCount: 0,
        rows: [{ updated: true }],
      })
    ).toBeNull();
  });

  it('reports the concurrent lock reason without treating HTTP success as an update', () => {
    expect(
      getSingleAttendanceAdjustmentFailure({
        updatedCount: 0,
        skippedCount: 1,
        rows: [{ updated: false, reason: 'Payroll is locked.' }],
      })
    ).toBe('Payroll is locked.');
  });

  it.each([
    null,
    undefined,
    {},
    { updatedCount: 0, skippedCount: 0 },
    { updatedCount: 1, skippedCount: 1 },
    { updatedCount: 1, skippedCount: 0, rows: [{ updated: false }] },
  ])('rejects an absent, empty or contradictory acknowledgement %j', (result) => {
    expect(getSingleAttendanceAdjustmentFailure(result)).toContain('Attendance was not adjusted.');
  });
});
