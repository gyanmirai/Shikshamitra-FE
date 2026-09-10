import { it, expect, describe } from 'vitest';

import { canPerformAdmissionDecision } from './use-admission-application-decisions';

describe('canPerformAdmissionDecision', () => {
  it('allows the standard review to admission-finalization sequence', () => {
    expect(canPerformAdmissionDecision(1, 'review')).toBe(true);
    expect(canPerformAdmissionDecision(4, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(6, 'offer')).toBe(true);
    expect(canPerformAdmissionDecision(7, 'accept')).toBe(true);
  });

  it('does not expose actions from terminal or incompatible states', () => {
    expect(canPerformAdmissionDecision(0, 'approve')).toBe(false);
    expect(canPerformAdmissionDecision(3, 'offer')).toBe(false);
    expect(canPerformAdmissionDecision(8, 'offer')).toBe(false);
    expect(canPerformAdmissionDecision(10, 'accept')).toBe(false);
    expect(canPerformAdmissionDecision(11, 'accept')).toBe(false);
  });

  it('requires a reason-capable decision state for waitlisting and rejection', () => {
    expect(canPerformAdmissionDecision(1, 'waitlist')).toBe(true);
    expect(canPerformAdmissionDecision(5, 'waitlist')).toBe(false);
    expect(canPerformAdmissionDecision(6, 'reject')).toBe(true);
    expect(canPerformAdmissionDecision(7, 'reject')).toBe(false);
  });
});
