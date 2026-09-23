import { it, expect, describe } from 'vitest';

import {
  canEditLessonPlan,
  resolveLessonPlanStatus,
  getLessonPlanEditLockMessage,
} from './lessonPlanEditability';

describe('lesson plan editability', () => {
  it.each(['Approved', 'Rejected', 'Submitted'] as const)('locks a %s lesson plan', (status) => {
    expect(canEditLessonPlan({ status })).toBe(false);
  });

  it.each(['Draft', 'NeedsChanges'] as const)('allows a %s lesson plan to be edited', (status) => {
    expect(canEditLessonPlan({ status })).toBe(true);
  });

  it('supports timeline payloads that only provide the legacy status field', () => {
    expect(resolveLessonPlanStatus({ status: 'Approved' })).toBe('Approved');
    expect(getLessonPlanEditLockMessage({ status: 'Approved' })).toContain('cannot be edited');
  });

  it('directs teachers to create a new plan after rejection', () => {
    expect(getLessonPlanEditLockMessage({ planStatus: 'Rejected' })).toContain(
      'Create a new lesson plan'
    );
  });
});
