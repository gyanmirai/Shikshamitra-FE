import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricPerformanceCards from './rubricPerformanceCards';

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
      description: 'Uses correct facts and clear reasoning.',
      teacherGuidance: 'Check the supporting evidence.',
      isRequired: true,
      maxMarks: 4,
      displayOrder: 1,
    },
  ],
};

describe('RubricPerformanceCards', () => {
  it('presents one clear criterion card and changes the selected score', () => {
    const onMarksChange = vi.fn();

    render(
      <RubricPerformanceCards
        rubric={rubric}
        values={{ accuracy: { marks: '3', comments: 'Good work' } }}
        onMarksChange={onMarksChange}
        onCommentsChange={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Accuracy' })).toBeInTheDocument();
    expect(screen.getByText('Uses correct facts and clear reasoning.')).toBeInTheDocument();
    expect(
      screen.getByText('Teacher guidance: Check the supporting evidence.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Accuracy: Good, 3 points' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('textbox', { name: 'Accuracy feedback (optional)' })).toHaveValue(
      'Good work'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accuracy: Excellent, 4 points' }));

    expect(onMarksChange).toHaveBeenCalledWith('accuracy', '4');
  });
});
