import { it, expect, describe } from 'vitest';

import { canRoleReviewLessonPlans } from './lessonPlanReviewAccess';

describe('canRoleReviewLessonPlans', () => {
  it.each(['admin', 'administrator', 'principal', 'academic coordinator'])(
    'allows the %s role to open the review queue',
    (role) => {
      expect(canRoleReviewLessonPlans(role)).toBe(true);
    }
  );

  it('does not grant review access to a teacher without reporting responsibilities', () => {
    expect(canRoleReviewLessonPlans('teacher')).toBe(false);
  });
});
