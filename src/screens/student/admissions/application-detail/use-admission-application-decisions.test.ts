import { it, expect, describe } from 'vitest';

import { canPerformAdmissionDecision } from './use-admission-application-decisions';

describe('five-stage admission decisions', () => {
  it('allows approval after submission and waitlist without an intermediate review action', () => {
    expect(canPerformAdmissionDecision(1, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(4, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(5, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(1, 'waitlist')).toBe(true);
    expect(canPerformAdmissionDecision(5, 'waitlist')).toBe(false);
    expect(canPerformAdmissionDecision(6, 'reject')).toBe(true);
  });
  it.each([0, 3, 7, 8, 9, 10, 11] as const)(
    'does not expose decisions for draft, terminal or retired offer status %s',
    (status) => {
      expect(canPerformAdmissionDecision(status, 'approve')).toBe(false);
      expect(canPerformAdmissionDecision(status, 'reject')).toBe(false);
      expect(canPerformAdmissionDecision(status, 'waitlist')).toBe(false);
    }
  );
});
