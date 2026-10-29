import { it, expect } from 'vitest';

import { takeInlineSalaryPreviewRecovery, claimInlineSalaryPreviewRecovery } from './inline-salary-preview-recovery';

it('matches only the claimed request and route and consumes ownership once', () => {
  window.history.replaceState(null, '', '/hr/payroll?month=2026-10');
  const release = claimInlineSalaryPreviewRecovery('one');
  expect(takeInlineSalaryPreviewRecovery('other', '/hr/payroll?month=2026-10')).toBe(false);
  expect(takeInlineSalaryPreviewRecovery('one', '/hr/payroll?month=2026-10')).toBe(true);
  expect(takeInlineSalaryPreviewRecovery('one', '/hr/payroll?month=2026-10')).toBe(false);
  release();
});

it('fails open on missing ownership, release or a changed route', () => {
  window.history.replaceState(null, '', '/hr/payroll');
  claimInlineSalaryPreviewRecovery(undefined)();
  const release = claimInlineSalaryPreviewRecovery('released');
  release();
  expect(takeInlineSalaryPreviewRecovery('released', '/hr/payroll')).toBe(false);
  const other = claimInlineSalaryPreviewRecovery('moved');
  expect(takeInlineSalaryPreviewRecovery('moved', '/hr/employee')).toBe(false);
  other();
});
