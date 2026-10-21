import type {
  AssessmentAttempt,
  AssessmentEffectiveProfile,
} from 'src/redux/student/admissions/admission-assessment-types';

import { it, expect } from 'vitest';

import {
  assessmentProfileKey,
  assessmentProfileTotal,
  assessmentEnteredTotal,
  assessmentSubjectValues,
  assessmentSubjectPayload,
  validateAssessmentSubjectValues,
} from './assessment-subject-results';

const subjectProfile: AssessmentEffectiveProfile = {
  id: 'class-profile',
  name: 'Class 1 entrance',
  boardId: 'board',
  mediumId: 'medium',
  standardIds: ['class-1'],
  passRule: 'both',
  passingMarks: 40,
  subjects: [
    { code: 'english', name: 'English', totalMarks: 50, passingMarks: 20 },
    { code: 'maths', name: 'Maths', totalMarks: 50, passingMarks: 20 },
  ],
};

it('preserves blank versus zero and decimals in the subject payload', () => {
  expect(assessmentSubjectPayload(subjectProfile, { english: '0', maths: '' })).toEqual([
    { code: 'english', marks: 0 },
    { code: 'maths', marks: null },
  ]);
  expect(assessmentSubjectPayload(subjectProfile, { english: '12.25', maths: '50' })).toEqual([
    { code: 'english', marks: 12.25 },
    { code: 'maths', marks: 50 },
  ]);
});

it('allows partial drafts but requires every subject on final submission', () => {
  expect(validateAssessmentSubjectValues(subjectProfile, { english: '0' }, true)).toEqual({});
  expect(validateAssessmentSubjectValues(subjectProfile, { english: '0' })).toEqual({
    maths: 'Enter Maths marks between 0 and 50',
  });
  expect(validateAssessmentSubjectValues(subjectProfile, { english: '0', maths: '49.25' })).toEqual(
    {}
  );
});

it.each(['-1', '51', 'NaN', 'Infinity'])(
  'rejects invalid subject marks %s even in a draft',
  (english) => {
    expect(validateAssessmentSubjectValues(subjectProfile, { english }, true).english).toBeTruthy();
  }
);

it('rejects stale or foreign subject codes without silently dropping them', () => {
  expect(
    validateAssessmentSubjectValues(subjectProfile, { previous: '20' }, true)._profile
  ).toBeTruthy();
});

it('restores persisted draft marks and a fresh retake never inherits the old scores', () => {
  expect(
    assessmentSubjectValues({
      subjectScores: [
        { code: 'english', marks: 0 },
        { code: 'maths', marks: null },
      ],
    } as AssessmentAttempt)
  ).toEqual({ english: '0', maths: '' });
  expect(assessmentSubjectValues({ subjectScores: [] } as unknown as AssessmentAttempt)).toEqual(
    {}
  );
});

it('keeps different scoring profiles apart even when their names match', () => {
  expect(assessmentProfileKey(subjectProfile)).not.toBe(
    assessmentProfileKey({
      ...subjectProfile,
      subjects: [{ ...subjectProfile.subjects[0], totalMarks: 25 }],
    })
  );
});

it('sums fractional maximums and entered marks without binary artifacts or a precision limit', () => {
  const fractional = {
    ...subjectProfile,
    subjects: [
      { ...subjectProfile.subjects[0], totalMarks: 0.1 },
      { ...subjectProfile.subjects[1], totalMarks: 0.2 },
    ],
  };
  expect(assessmentProfileTotal(fractional)).toBe(0.3);
  expect(assessmentEnteredTotal(fractional, { english: '0.1', maths: '0.2' })).toBe(0.3);
  const tiny = {
    ...subjectProfile,
    subjects: subjectProfile.subjects.map((subject) => ({ ...subject, totalMarks: 0.005 })),
  };
  expect(assessmentProfileTotal(tiny)).toBe(0.01);
  expect(assessmentEnteredTotal(tiny, { english: '0.005', maths: '0.005' })).toBe(0.01);
});
