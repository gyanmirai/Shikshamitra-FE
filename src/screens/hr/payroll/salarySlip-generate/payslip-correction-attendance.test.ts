import { it, expect } from 'vitest';

import { correctionAttendanceDraft, correctionAttendancePayload } from './payslip-correction-attendance';

it('shows the payroll clock without browser or database-offset timezone drift', () => {
  expect(correctionAttendanceDraft([{ date: '2026-10-01', status: 0,
    timeIn: '2026-10-01T14:30:00+05:30', timeOut: '2026-10-01T19:00:12.345Z' }])).toEqual([
    { date: '2026-10-01', status: 0, timeIn: '09:00', timeOut: '19:00' },
  ]);
});

it('retains exact untouched timestamp evidence when only the status changes', () => {
  const source = [{ date: '2026-10-01', status: 0 as const,
    timeIn: '2026-10-01T14:30:00+05:30', timeOut: '2026-10-01T19:00:12.345Z' }];
  const drafts = correctionAttendanceDraft(source);
  drafts[0].status = 1;
  expect(correctionAttendancePayload(drafts, source)).toEqual([{ ...source[0], status: 1 }]);
});

it('serializes an edited clock against the source date at offset zero', () => {
  const source = [{ date: '2026-10-01', status: 0 as const,
    timeIn: '2026-10-01T09:00:12.345Z', timeOut: '2026-10-01T19:00:00Z' }];
  const drafts = correctionAttendanceDraft(source);
  drafts[0].timeOut = '17:00';
  expect(correctionAttendancePayload(drafts, source)).toEqual([
    { ...source[0], timeOut: '2026-10-01T17:00:00Z' },
  ]);
});

it('allows clearing supplied times and retains status-only attendance', () => {
  const source = [{ date: '2026-10-01', status: 0 as const,
    timeIn: '2026-10-01T09:00:00Z', timeOut: '2026-10-01T19:00:00Z' }];
  const drafts = correctionAttendanceDraft(source);
  drafts[0].timeIn = ''; drafts[0].timeOut = '';
  expect(correctionAttendancePayload(drafts, source)).toEqual([
    { ...source[0], timeIn: null, timeOut: null },
  ]);
  expect(correctionAttendancePayload([{ date: '2026-10-02', status: 2, timeIn: '', timeOut: '' }], [])).toEqual([
    { date: '2026-10-02', status: 2, timeIn: null, timeOut: null },
  ]);
});

it('serializes new attendance times including midnight and partial punches', () => {
  expect(correctionAttendancePayload([{ date: '2026-10-02', status: 1, timeIn: '00:00', timeOut: '' }], [])).toEqual([
    { date: '2026-10-02', status: 1, timeIn: '2026-10-02T00:00:00Z', timeOut: null },
  ]);
});
