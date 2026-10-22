import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';

import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AssessmentSubjectScoreHistory } from './assessment-subject-score-history';

it('shows frozen subject labels, zero marks and pending drafts without creating an outcome', () => {
  const attempt = {
    id: 'a',
    status: 'pending',
    subjectScores: [
      { code: 'english', marks: 0 },
      { code: 'maths', marks: null },
    ],
    effectiveProfile: {
      name: 'Class 1 frozen profile',
      passRule: 'both',
      passingMarks: 40,
      subjects: [
        { code: 'english', name: 'English at exam', totalMarks: 50, passingMarks: 20 },
        { code: 'maths', name: 'Maths at exam', totalMarks: 50, passingMarks: 20 },
      ],
    },
  } as AssessmentAttempt;
  render(<AssessmentSubjectScoreHistory attempt={attempt} />);
  expect(screen.getByText('English at exam')).toBeVisible();
  expect(screen.getByText('0 / 50')).toBeVisible();
  expect(screen.getByText('Pending / 50')).toBeVisible();
  expect(screen.getByText('Draft result · not submitted')).toBeVisible();
  expect(screen.queryByText('Passed')).not.toBeInTheDocument();
});
