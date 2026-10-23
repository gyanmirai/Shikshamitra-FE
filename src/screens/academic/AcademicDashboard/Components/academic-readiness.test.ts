import { it, expect, describe } from 'vitest';

import { getGradingStatus, getAcademicHealth } from './academic-readiness';

describe('academic dashboard readiness', () => {
  it('does not call an empty academic setup healthy or compiled', () => {
    const assessment = { readinessRate: 0, pendingGradeEntries: 0, pendingEvaluations: 0 };
    expect(
      getAcademicHealth(
        { curriculumCompletion: 0 },
        { timetableRate: 0, conflictsCount: 0 },
        assessment
      )
    ).toEqual({ score: 0, status: 'Needs Attention' });
    expect(getGradingStatus(assessment)).toBe('Not Compiled');
  });

  it('requires completed work as well as full progress before showing readiness', () => {
    const complete = { readinessRate: 100, pendingGradeEntries: 0, pendingEvaluations: 0 };
    expect(getGradingStatus(complete)).toBe('Compiled');
    expect(getGradingStatus({ ...complete, pendingEvaluations: 1 })).toBe('Pending Evaluation');
    expect(
      getAcademicHealth(
        { curriculumCompletion: 100 },
        { timetableRate: 100, conflictsCount: 1 },
        complete
      ).status
    ).toBe('Needs Attention');
    expect(
      getAcademicHealth(
        { curriculumCompletion: 100 },
        { timetableRate: 100, conflictsCount: 0 },
        complete
      ).status
    ).toBe('Healthy');
  });
});
