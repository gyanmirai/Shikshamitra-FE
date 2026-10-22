import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AssessmentSubjectScoreFields } from './assessment-subject-score-fields';

it('keeps fine decimal subject scores unchanged while editing and displays an exact total', () => {
  const change = vi.fn();
  render(
    <AssessmentSubjectScoreFields
      profile={{
        id: 'profile',
        name: 'Class 1 entrance',
        boardId: 'board',
        mediumId: 'medium',
        standardIds: ['class-1'],
        passRule: 'overall',
        passingMarks: 0.005,
        subjects: [
          { code: 'english', name: 'English', totalMarks: 0.01 },
          { code: 'maths', name: 'Maths', totalMarks: 0.01 },
        ],
      }}
      values={{ english: '0.005', maths: '0.005' }}
      disabled={false}
      onChange={change}
    />
  );
  expect(screen.getByRole('textbox', { name: /English/ })).toHaveValue('0.005');
  expect(screen.getByText('Total entered: 0.01 / 0.02')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: /English/ }), {
    target: { value: '0.006' },
  });
  expect(change).toHaveBeenCalledWith('english', '0.006');
});
