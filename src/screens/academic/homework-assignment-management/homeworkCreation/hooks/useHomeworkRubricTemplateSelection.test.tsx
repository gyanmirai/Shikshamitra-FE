import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useHomeworkRubricTemplateSelection } from './useHomeworkRubricTemplateSelection';

describe('useHomeworkRubricTemplateSelection', () => {
  it('keeps a new-homework selection when the query returns a new empty array', () => {
    const { result, rerender } = renderHook(
      ({ rubrics }) => useHomeworkRubricTemplateSelection(undefined, rubrics),
      { initialProps: { rubrics: [] } }
    );

    act(() => result.current.setSelectedRubricTemplateId('template-1'));
    rerender({ rubrics: [] });

    expect(result.current.selectedRubricTemplateId).toBe('template-1');
  });

  it('hydrates an existing homework and preserves a user replacement selection', () => {
    const homeworkId = 'homework-1';
    const rubrics: AssessmentRubricDto[] = [
      {
        id: 'rubric-1',
        homeworkId,
        sourceTemplateId: 'template-1',
        status: RubricStatus.Published,
        scoringModel: RubricScoringModel.PointsBased,
        visibility: RubricVisibility.Private,
        title: 'Homework rubric',
        tags: [],
        performanceLevels: [],
        totalMarks: 10,
        version: 1,
        criteria: [],
      },
    ];
    const { result, rerender } = renderHook(
      ({ currentRubrics }) =>
        useHomeworkRubricTemplateSelection(homeworkId, currentRubrics),
      { initialProps: { currentRubrics: rubrics } }
    );

    expect(result.current.selectedRubricTemplateId).toBe('template-1');

    act(() => result.current.setSelectedRubricTemplateId('template-2'));
    rerender({ currentRubrics: [...rubrics] });

    expect(result.current.selectedRubricTemplateId).toBe('template-2');
    expect(result.current.assignedRubricTemplateId).toBe('template-1');
  });
});
