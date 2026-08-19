import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricPerformanceMatrix from './rubricPerformanceMatrix';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span data-testid="selected-level" /> }));

const rubric: AssessmentRubricDto = {
  id: 'rubric-1',
  scoringModel: RubricScoringModel.PerformanceLevels,
  visibility: RubricVisibility.Institution,
  title: 'Presentation Rubric',
  tags: [],
  totalMarks: 4,
  version: 1,
  status: RubricStatus.Published,
  performanceLevels: [
    { level: 1, label: 'Needs Improvement', score: 1 },
    { level: 4, label: 'Excellent', score: 4 },
    { level: 2, label: 'Developing', score: 2 },
    { level: 3, label: 'Good', score: 3 },
  ],
  criteria: [
    {
      id: 'accuracy',
      rubricId: 'rubric-1',
      title: 'Accuracy',
      isRequired: true,
      maxMarks: 4,
      displayOrder: 1,
    },
  ],
};

describe('RubricPerformanceMatrix', () => {
  it('renders configured levels and changes the selected criterion score', () => {
    const onMarksChange = vi.fn();

    render(
      <RubricPerformanceMatrix
        rubric={rubric}
        values={{ accuracy: { marks: '3', comments: 'Good work' } }}
        onMarksChange={onMarksChange}
        onCommentsChange={vi.fn()}
      />
    );

    expect(screen.getByRole('columnheader', { name: /Excellent 4 points/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Good 3 points/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Developing 2 points/i })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Needs Improvement 1 point/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Accuracy: Good, 3 points' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accuracy: Excellent, 4 points' }));

    expect(onMarksChange).toHaveBeenCalledWith('accuracy', '4');
  });
});
