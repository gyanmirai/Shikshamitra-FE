import { it, expect, describe } from 'vitest';

import { isNavigationPathActive } from './path-utils';

describe('isNavigationPathActive', () => {
  const seatingPlanPath = '/academic/seatallocation';

  it('matches the navigation item route exactly', () => {
    expect(isNavigationPathActive(seatingPlanPath, seatingPlanPath, true)).toBe(true);
  });

  it('matches a nested guided setup route when descendant matching is enabled', () => {
    expect(
      isNavigationPathActive(
        '/academic/seatallocation/exam-id/setup?planId=plan-id',
        seatingPlanPath,
        true
      )
    ).toBe(true);
  });

  it('normalizes trailing slashes', () => {
    expect(isNavigationPathActive(`${seatingPlanPath}/`, seatingPlanPath, true)).toBe(true);
  });

  it('does not treat a similarly prefixed route as a descendant', () => {
    expect(
      isNavigationPathActive('/academic/seatallocation-archive', seatingPlanPath, true)
    ).toBe(false);
  });

  it('does not match descendants when descendant matching is disabled', () => {
    expect(
      isNavigationPathActive('/academic/seatallocation/exam-id/setup', seatingPlanPath)
    ).toBe(false);
  });
});
