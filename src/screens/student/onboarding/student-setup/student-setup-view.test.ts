import { it, expect, describe } from 'vitest';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import {
  studentSetupViews,
  studentSetupTaskHref,
  parseStudentSetupView,
  getPendingStudentCount,
} from './student-setup-view';

describe('Student Setup task views', () => {
  it('keeps task route values while using school-friendly labels', () => {
    expect(studentSetupViews.map((view) => view.label)).toEqual([
      'Setup Status',
      'Division',
      'GR Number',
      'Roll Number',
      'Fees',
      'App Login',
    ]);
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
    const href = studentSetupTaskHref(
      '/student/onboarding/setup',
      'view=readiness&board=cbse&class=1&division=5-a&today=true&scope=all',
      'case-1',
      'fees'
    );
    const url = new URL(href, 'http://localhost');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      view: 'fees',
      board: 'cbse',
      class: '1',
      division: '5-a',
      case: 'case-1',
    });
  });
  it('supports six views and separates fee and credential pending work', () => {
    expect(parseStudentSetupView('fees')).toBe('fees');
    expect(parseStudentSetupView('credentials')).toBe('credentials');
    const base = studentOnboardingTestData[0];
    const ready = {
      ...base,
      id: 'ready',
      feeStructureConfirmed: true,
      studentAccountStatus: 'ready' as const,
      guardianAccountStatus: 'not-required' as const,
    };
    const pending = {
      ...base,
      id: 'pending',
      feeStructureConfirmed: false,
      studentAccountStatus: 'pending' as const,
    };
    expect(getPendingStudentCount([ready, pending], 'fees')).toBe(1);
    expect(getPendingStudentCount([ready, pending], 'credentials')).toBe(1);
    expect(getPendingStudentCount([{ ...ready, credentialsPending: true }], 'credentials')).toBe(1);
  });
  it('uses readiness for invalid URL values', () => {
    expect(parseStudentSetupView(null)).toBe('readiness');
    expect(parseStudentSetupView('unknown')).toBe('readiness');
    expect(parseStudentSetupView('gr-number')).toBe('gr-number');
  });

  it('counts students without committed GR numbers without narrowing the worklist', () => {
    expect(getPendingStudentCount(studentOnboardingTestData, 'gr-number')).toBe(4);
  });

  it('counts students without roll numbers without narrowing the worklist', () => {
    expect(getPendingStudentCount(studentOnboardingTestData, 'roll-number')).toBe(2);
  });

  it('keeps all students available for division changes by default', () => {
    expect(getPendingStudentCount(studentOnboardingTestData, 'division')).toBe(0);
  });
});
