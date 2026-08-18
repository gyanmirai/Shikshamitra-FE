import { describe, expect, it } from 'vitest';

import { getValidationIssueLabel } from './validationIssueLabels';

describe('getValidationIssueLabel', () => {
  it('maps room low utilization to the expected user-facing label', () => {
    expect(getValidationIssueLabel('ROOM_LOW_UTILIZATION')).toBe('Low Room Utilization');
  });

  it('maps the other current seating validation codes', () => {
    expect(getValidationIssueLabel('STUDENT_DUPLICATE_ASSIGNMENT')).toBe(
      'Duplicate Student Assignment'
    );
    expect(getValidationIssueLabel('ROOM_CAPACITY_EXCEEDED')).toBe('Room Capacity Exceeded');
  });

  it('humanizes an unknown backend code as a safe fallback', () => {
    expect(getValidationIssueLabel('NEW_BACKEND_WARNING')).toBe('New Backend Warning');
  });

  it('returns a generic title when the code is empty', () => {
    expect(getValidationIssueLabel('  ')).toBe('Validation Issue');
  });
});
