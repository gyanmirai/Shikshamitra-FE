import { it, expect, describe } from 'vitest';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import {
  getDefaultTaskScope,
  parseStudentSetupView,
  getPendingStudentCount,
  parseStudentSetupTaskScope,
  filterStudentsForSetupView,
} from './student-setup-view';

describe('Student Setup task views', () => {
  it('uses readiness and safe task-scope defaults for invalid URL values', () => {
    expect(parseStudentSetupView(null)).toBe('readiness');
    expect(parseStudentSetupView('unknown')).toBe('readiness');
    expect(parseStudentSetupView('gr-number')).toBe('gr-number');
    expect(getDefaultTaskScope('gr-number')).toBe('pending');
    expect(getDefaultTaskScope('division')).toBe('all');
    expect(parseStudentSetupTaskScope('unknown', 'roll-number')).toBe('pending');
  });

  it('shows only students without committed GR numbers in the pending GR view', () => {
    const rows = filterStudentsForSetupView(studentOnboardingTestData, 'gr-number', 'pending');

    expect(rows).toHaveLength(4);
    expect(rows.every((student) => student.grNo == null)).toBe(true);
    expect(getPendingStudentCount(studentOnboardingTestData, 'gr-number')).toBe(4);
  });

  it('shows only students without roll numbers in the pending roll view', () => {
    const rows = filterStudentsForSetupView(studentOnboardingTestData, 'roll-number', 'pending');

    expect(rows.map((student) => student.studentName)).toEqual(['Aanya Sharma', 'Arjun Desai']);
    expect(getPendingStudentCount(studentOnboardingTestData, 'roll-number')).toBe(2);
  });

  it('keeps all students available for division changes by default', () => {
    expect(
      filterStudentsForSetupView(studentOnboardingTestData, 'division', 'all')
    ).toHaveLength(studentOnboardingTestData.length);
    expect(getPendingStudentCount(studentOnboardingTestData, 'division')).toBe(0);
  });
});
