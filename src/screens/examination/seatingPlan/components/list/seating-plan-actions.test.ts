import { it, expect, describe } from 'vitest';

import { getSeatingPlanPrimaryStep, getSeatingPlanPrimaryAction } from './seating-plan-actions';

describe('getSeatingPlanPrimaryStep', () => {
  it.each([
    ['not-started', 0],
    ['in-progress', 0],
    ['needs-attention', 0],
    ['ready', 0],
    ['completed', 0],
  ] as const)('opens %s exams at the plan-group phase', (status, step) => {
    expect(getSeatingPlanPrimaryStep(status)).toBe(step);
    expect(getSeatingPlanPrimaryAction(status).label).toBe('Manage plans');
  });

  it('opens published exams as a read-only seating view', () => {
    expect(getSeatingPlanPrimaryStep('published')).toBe(0);
    expect(getSeatingPlanPrimaryAction('published')).toEqual({
      label: 'View seating',
      icon: 'mdi:seat-outline',
    });
  });
});
