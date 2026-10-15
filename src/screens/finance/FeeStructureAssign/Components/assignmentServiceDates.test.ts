import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import {
  assignmentYearBounds,
  assignmentServiceDateError,
  serializeServiceDate,
} from './assignmentServiceDates';

const year = { id: 'year', startDate: '2026-06-15', endDate: '2027-05-14' };
const bounds = assignmentYearBounds(year, 'year');
const candidate = {
  heads: [
    { feeHeadId: 'tuition', isOptional: false },
    { feeHeadId: 'transport', isOptional: true },
  ],
} as AssignmentCandidate;
const request = (
  startDate = year.startDate,
  endDate = year.endDate,
  reason = 'Approved service dates'
): AssignmentRequest => ({
  studentId: 'student',
  academicYearId: 'year',
  standardFeeStructureId: 'structure',
  selectedOptionalFeeHeadIds: [],
  feeHeadDetails: [],
  servicePeriods: [{ feeHeadId: 'tuition', source: 'ManualOverride', startDate, endDate, reason }],
});

describe('assignment service date boundaries', () => {
  it('uses configured global boundaries rather than deriving dates from the year name', () => {
    expect(bounds?.start.format('YYYY-MM-DD')).toBe('2026-06-15');
    expect(bounds?.end.format('YYYY-MM-DD')).toBe('2027-05-14');
    expect(assignmentYearBounds(year, 'another-year')).toBeUndefined();
    expect(assignmentYearBounds({ id: 'year' }, 'year')).toBeUndefined();
    expect(assignmentYearBounds({ ...year, startDate: '2026-02-30' }, 'year')).toBeUndefined();
  });
  it('accepts both boundaries and a same-day service period', () => {
    expect(assignmentServiceDateError(candidate, request(), bounds)).toBeUndefined();
    expect(
      assignmentServiceDateError(candidate, request(year.startDate, year.startDate), bounds)
    ).toBeUndefined();
  });
  it.each([
    ['2026-06-14', year.endDate],
    [year.startDate, '2027-05-15'],
  ])('rejects dates outside the selected year: %s / %s', (start, end) => {
    expect(assignmentServiceDateError(candidate, request(start, end), bounds)).toContain(
      'within the selected academic year'
    );
  });
  it('rejects reversed, invalid and incomplete dates and missing reasons', () => {
    expect(
      assignmentServiceDateError(candidate, request('2026-08-01', '2026-07-01'), bounds)
    ).toContain('on or after');
    expect(assignmentServiceDateError(candidate, request('2026-02-30'), bounds)).toContain(
      'valid start'
    );
    expect(assignmentServiceDateError(candidate, request(''), bounds)).toContain('valid start');
    expect(
      assignmentServiceDateError(candidate, request(year.startDate, year.endDate, ' '), bounds)
    ).toContain('reason');
    expect(assignmentServiceDateError(candidate, request())).toContain('unavailable');
  });
  it('ignores deselected optional heads and configured-year service dates', () => {
    const input = request('invalid');
    input.servicePeriods[0].feeHeadId = 'transport';
    expect(assignmentServiceDateError(candidate, input, bounds)).toBeUndefined();
    input.selectedOptionalFeeHeadIds = ['transport'];
    expect(assignmentServiceDateError(candidate, input, bounds)).toContain('valid start');
    input.servicePeriods[0].source = 'AcademicYear';
    expect(assignmentServiceDateError(candidate, input, bounds)).toBeUndefined();
  });
  it('serializes the chosen calendar day without a local-time day shift', () => {
    expect(serializeServiceDate(dayjs('2026-06-15'))).toBe('2026-06-15T00:00:00Z');
    expect(serializeServiceDate(dayjs('invalid'))).toBeUndefined();
    expect(serializeServiceDate(null)).toBeUndefined();
  });
});
