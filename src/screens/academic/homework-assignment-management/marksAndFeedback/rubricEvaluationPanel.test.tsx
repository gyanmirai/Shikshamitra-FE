import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useRubricEvaluation } from './useRubricEvaluation';
import RubricEvaluationPanel from './rubricEvaluationPanel';

vi.mock('./useRubricEvaluation', () => ({
  useRubricEvaluation: vi.fn(),
}));

const rubric: AssessmentRubricDto = {
  id: 'rubric-1',
  scoringModel: RubricScoringModel.PointsBased,
  visibility: RubricVisibility.Institution,
  title: 'Assignment Rubric',
  tags: [],
  totalMarks: 0,
  version: 1,
  status: RubricStatus.Published,
  performanceLevels: [],
  criteria: [],
};

describe('RubricEvaluationPanel', () => {
  const retryEvaluation = vi.fn();

  beforeEach(() => {
    retryEvaluation.mockReset();
    vi.mocked(useRubricEvaluation).mockReturnValue({
      activeRubric: rubric,
      isLocked: false,
      criterionValues: {},
      remarks: '',
      setRemarks: vi.fn(),
      setCriterionMarks: vi.fn(),
      setCriterionComments: vi.fn(),
      createDefaultRubric: vi.fn(),
      save: vi.fn(),
      isCreating: false,
      isPublishing: false,
      totalMarks: 0,
      isLoading: false,
      hasEvaluationError: true,
      retryEvaluation,
    });
  });

  it('offers an inline retry action when the existing evaluation request fails', () => {
    render(
      <RubricEvaluationPanel
        mode="assignment"
        standardId="standard-1"
        subjectId="subject-1"
        taskId="assignment-1"
      />
    );

    expect(
      screen.getByText("Unable to load this student's existing evaluation. Please try again.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(retryEvaluation).toHaveBeenCalledOnce();
  });

  it('shows saved scores and explicit empty feedback without form controls in review mode', () => {
    vi.mocked(useRubricEvaluation).mockReturnValue({
      setRemarks: vi.fn(),
      setCriterionMarks: vi.fn(),
      setCriterionComments: vi.fn(),
      createDefaultRubric: vi.fn(),
      save: vi.fn(),
      isCreating: false,
      isPublishing: false,
      retryEvaluation,
      activeRubric: {
        ...rubric,
        totalMarks: 6,
        criteria: [
          {
            id: 'accuracy',
            rubricId: rubric.id,
            title: 'Accuracy',
            points: 6,
            isRequired: true,
            displayOrder: 1,
          },
        ],
      },
      criterionValues: { accuracy: { marks: '0', comments: '' } },
      remarks: '',
      totalMarks: 0,
      isLocked: true,
      isLoading: false,
      hasEvaluationError: false,
    });
    render(
      <RubricEvaluationPanel
        mode="homework"
        standardId="class"
        subjectId="subject"
        taskId="task"
        readOnly
        compactLayout
      />
    );

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('0 / 6')).toBeInTheDocument();
    expect(screen.getByText('No criterion feedback recorded.')).toBeInTheDocument();
    expect(screen.getByText('No overall rubric feedback recorded.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Rubric Assessment information' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Score Summary information' })).toBeInTheDocument();
  });
});
