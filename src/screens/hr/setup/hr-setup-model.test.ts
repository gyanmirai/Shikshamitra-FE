import type { HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { it, expect, describe } from 'vitest';

import { setupTaskForCheck, setupStepComplete, firstIncompleteSetupStep } from './hr-setup-model';

const complete = (): HrSetupReadiness => ({
  academicYearId: 'year',
  isReady: true,
  availableYears: [],
  checks: [
    { code: 'shift', step: 'staff', state: 'ready', reason: '', canConfigure: true },
    { code: 'calendar', step: 'policies', state: 'ready', reason: '', canConfigure: true },
    { code: 'earnings', step: 'earnings', state: 'ready', reason: '', canConfigure: true },
    { code: 'salary-template', step: 'salary', state: 'ready', reason: '', canConfigure: true },
  ],
});

describe('HR setup progress', () => {
  it('resolves calendar dependencies before payroll and attendance policies', () => {
    const readiness = complete();
    expect(setupTaskForCheck(readiness, 'payroll-policy')).toBe('payroll-policy');
    readiness.checks[1].state = 'inactive';
    expect(setupTaskForCheck(readiness, 'payroll-policy')).toBe('calendar');
    expect(setupTaskForCheck(readiness, 'attendance-policy')).toBe('calendar');
    expect(setupTaskForCheck(readiness, 'leave-policy')).toBe('leave-policy');
  });
  it('skips usable defaults and opens the first unresolved step', () => {
    const readiness = complete();
    readiness.isReady = false;
    readiness.checks[2].state = 'missing';
    expect(firstIncompleteSetupStep(readiness)).toBe(2);
    expect(setupStepComplete(readiness, 1)).toBe(true);
    expect(setupStepComplete(readiness, 2)).toBe(false);
    expect(setupStepComplete(readiness, 4)).toBe(false);
  });
  it.each(['inactive', 'invalid', 'conflicting', 'unknown'] as const)(
    'does not treat %s configuration as complete',
    (state) => {
      const readiness = complete();
      readiness.isReady = false;
      readiness.checks[0].state = state;
      expect(firstIncompleteSetupStep(readiness)).toBe(0);
      expect(setupStepComplete(readiness, 0)).toBe(false);
    }
  );
  it('offers completion only after every server check is ready', () => {
    expect(firstIncompleteSetupStep(complete())).toBe(4);
    expect(setupStepComplete(complete(), 4)).toBe(true);
  });
  it('keeps a conditional salary dependency unresolved', () => {
    const readiness = complete();
    readiness.isReady = false;
    readiness.checks.push({
      code: 'pf',
      step: 'salary',
      state: 'missing',
      reason: '',
      canConfigure: false,
    });
    expect(firstIncompleteSetupStep(readiness)).toBe(3);
    expect(setupStepComplete(readiness, 3)).toBe(false);
  });
});
