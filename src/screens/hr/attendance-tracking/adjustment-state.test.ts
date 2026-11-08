import { it, expect, describe } from 'vitest';

import {
  validateAttendanceDraft,
  getAttendanceAdjustmentTimes,
  usesAttendanceAdjustmentTimes,
  reconcileBulkAttendanceAdjustment,
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

describe('bulk attendance outcome reconciliation', () => {
  const recorded = {
    attendanceId: 'saved-1',
    employeeId: 'employee-1',
    employeeName: 'Staff One',
    attendanceDate: '2026-10-01',
  };
  const unmarked = {
    attendanceId: null,
    employeeId: 'employee-2',
    employeeName: 'Staff Two',
    attendanceDate: '2026-10-02',
  };
  const updated = { ...recorded, updated: true };
  const skipped = {
    ...unmarked,
    attendanceId: '00000000-0000-0000-0000-000000000000',
    updated: false,
    reason: 'Payroll is locked.',
  };

  it('removes confirmed updates and retains only skipped targets with staff/date reasons', () => {
    const result = reconcileBulkAttendanceAdjustment([recorded, unmarked], {
      updatedCount: 1,
      skippedCount: 1,
      rows: [updated, skipped],
    });
    expect(result).toMatchObject({
      complete: false,
      updatedCount: 1,
      pendingRows: [unmarked],
      retryBlocked: false,
    });
    expect(result.message).toContain('Staff Two (2026-10-02): Payroll is locked.');
  });

  it('matches a newly created attendance row by employee/date without resubmitting it', () => {
    expect(
      reconcileBulkAttendanceAdjustment([unmarked], {
        updatedCount: 1,
        skippedCount: 0,
        rows: [{ ...unmarked, attendanceId: 'new-id', updated: true }],
      })
    ).toMatchObject({ complete: true, pendingRows: [], retryBlocked: false, message: null });
  });

  it('retains an all-skipped selection and supplies a fallback for an absent reason', () => {
    const result = reconcileBulkAttendanceAdjustment([recorded], {
      updatedCount: 0,
      skippedCount: 1,
      rows: [{ ...recorded, updated: false }],
    });
    expect(result).toMatchObject({ complete: false, pendingRows: [recorded], retryBlocked: false });
    expect(result.message).toContain('Not adjusted. Check whether the day is still editable.');
  });

  it.each([
    undefined,
    {},
    { updatedCount: 1, skippedCount: 0, rows: [] },
    { updatedCount: 1, skippedCount: 0, rows: [{ attendanceId: 'someone-else', updated: true }] },
    { updatedCount: 2, skippedCount: 0, rows: [updated, updated] },
    { updatedCount: 1, skippedCount: 0, rows: [{ ...recorded, updated: false }] },
    { updatedCount: 0, skippedCount: 0, rows: [updated] },
  ])('blocks blind retries for incomplete or inconsistent acknowledgements %j', (result) => {
    const outcome = reconcileBulkAttendanceAdjustment([recorded], result);
    expect(outcome.complete).toBe(false);
    expect(outcome.retryBlocked).toBe(true);
    expect(outcome.message).toContain('Close and refresh');
  });

  it('does not confuse two unmarked dates for the same employee', () => {
    const otherDate = { ...unmarked, attendanceDate: '2026-10-03' };
    const result = reconcileBulkAttendanceAdjustment([unmarked, otherDate], {
      updatedCount: 1,
      skippedCount: 1,
      rows: [
        { ...unmarked, attendanceId: 'new-id', updated: true },
        { ...otherDate, updated: false, reason: 'Attendance day is locked.' },
      ],
    });
    expect(result.pendingRows).toEqual([otherDate]);
    expect(result.retryBlocked).toBe(false);
  });
});
