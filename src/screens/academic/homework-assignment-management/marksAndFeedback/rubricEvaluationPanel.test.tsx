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
});
