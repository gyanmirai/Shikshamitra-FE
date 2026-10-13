import { it, expect, describe } from 'vitest';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import {
  studentSetupViews,
  getDefaultTaskScope,
  studentSetupTaskHref,
  parseStudentSetupView,
  getPendingStudentCount,
  parseStudentSetupTaskScope,
  filterStudentsForSetupView,
} from './student-setup-view';

describe('Student Setup task views', () => {
  it('orders assignment tasks as Readiness, Division, GR, Roll, Fees and Credentials', () => {
    expect(studentSetupViews.map((view) => view.value)).toEqual([
      'readiness',
      'division',
      'gr-number',
      'roll-number',
      'fees',
      'credentials',
    ]);
  });
  it('redirects a pending item to its URL-backed task and retains the focused case and academic filters', () => {
    const href = studentSetupTaskHref('/student/onboarding/setup', 'view=readiness&board=cbse&class=1&division=5-a&today=true&scope=all', 'case-1', 'fees');
    const url = new URL(href, 'http://localhost');
    expect(Object.fromEntries(url.searchParams)).toEqual({ view: 'fees', board: 'cbse', class: '1', division: '5-a', scope: 'all', case: 'case-1' });
  });
  it('supports six views and separates fee and credential pending work', () => {
    expect(parseStudentSetupView('fees')).toBe('fees');
    expect(parseStudentSetupView('credentials')).toBe('credentials');
    const base = studentOnboardingTestData[0];
    const ready = { ...base, id: 'ready', feeStructureConfirmed: true, studentAccountStatus: 'ready' as const, guardianAccountStatus: 'not-required' as const };
    const pending = { ...base, id: 'pending', feeStructureConfirmed: false, studentAccountStatus: 'pending' as const };
    expect(filterStudentsForSetupView([ready, pending], 'fees', 'pending').map(item => item.id)).toEqual(['pending']);
    expect(filterStudentsForSetupView([ready, pending], 'credentials', 'pending').map(item => item.id)).toEqual(['pending']);
    expect(getPendingStudentCount([{ ...ready, credentialsPending: true }], 'credentials')).toBe(1);
  });
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
