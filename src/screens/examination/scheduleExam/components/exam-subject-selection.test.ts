import { it, expect, describe } from 'vitest';

import {
  deduplicateSubjectOptions,
  getUncachedElectiveGroupIds,
  normalizeSelectedExamSubjects,
} from './exam-subject-selection';

const defaults = {
  totalMarks: 100 as const,
  passingMarks: 33 as const,
  gradeScalingId: 'main-scale',
};

const electiveOption = {
  id: 'core-maths',
  subjectId: 'core-maths',
  subjectName: 'Core Mathematics',
  selectedElectiveSubjectId: 'core-maths',
  electiveGroupId: 'maths-group',
  electiveGroupName: '12th Eleven Maths',
  subjects: [{ subjectId: 'core-maths', subjectName: 'Core Mathematics' }],
};

describe('exam subject selection normalization', () => {
  it('creates the elective selection immediately before readiness data exists', () => {
    const result = normalizeSelectedExamSubjects([electiveOption], defaults, {});

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      subjectId: 'core-maths',
      electiveGroupId: 'maths-group',
      schedulingMode: 'separate',
    });
    expect(result[0].subjects).toHaveLength(1);
    expect(result[0].subjects?.[0].assignedStudentCount).toBeUndefined();
  });

  it('enriches the optimistic selection after readiness resolves', () => {
    const result = normalizeSelectedExamSubjects([electiveOption], defaults, {
      'maths-group': {
        isReady: true,
        assignedCounts: { 'core-maths': 18 },
      },
    });

    expect(result[0].subjects?.[0]).toMatchObject({
      subjectId: 'core-maths',
      assignedStudentCount: 18,
    });
  });

  it('does not request cached groups or normalize duplicate checkbox values twice', () => {
    const duplicateOptions = [electiveOption, { ...electiveOption }];
    const readiness = {
      'maths-group': { isReady: true, assignedCounts: { 'core-maths': 18 } },
    };

    expect(deduplicateSubjectOptions(duplicateOptions)).toHaveLength(1);
    expect(getUncachedElectiveGroupIds(duplicateOptions, readiness)).toEqual([]);
    expect(getUncachedElectiveGroupIds(duplicateOptions, {})).toEqual(['maths-group']);
  });
});
