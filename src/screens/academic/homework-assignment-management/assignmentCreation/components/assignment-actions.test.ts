import { it, expect, describe } from 'vitest';
import {
  AssignmentStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

import { getAssignmentActionVisibility } from './assignment-actions';

const allPermissions = { canAdd: true, canView: true, canDelete: true };
const evaluatedAssignment = {
  evaluationRequired: true,
  evaluationMethod: AssignmentEvaluationMethod.Marks,
  defaultEvaluationMethod: AssignmentEvaluationMethod.Marks,
};

describe('assignment action visibility', () => {
  it('shows edit/publish/delete only for drafts', () => {
    expect(
      getAssignmentActionVisibility(
        {
          ...evaluatedAssignment,
          status: AssignmentStatus.Draft,
          submissionType: AssignmentSubmissionType.FileUpload,
        },
        allPermissions
      )
    ).toEqual({
      canEdit: true,
      canPublish: true,
      canClose: false,
      canViewSubmissions: false,
      canDelete: true,
    });
  });

  it('shows close only for published assignments', () => {
    const actions = getAssignmentActionVisibility(
      {
        ...evaluatedAssignment,
        status: AssignmentStatus.Published,
        submissionType: AssignmentSubmissionType.OnlineText,
      },
      allPermissions
    );

    expect(actions.canClose).toBe(true);
    expect(actions.canPublish).toBe(false);
    expect(actions.canDelete).toBe(false);
    expect(actions.canViewSubmissions).toBe(true);
  });

  it('does not expose submissions for closed assignments', () => {
    const actions = getAssignmentActionVisibility(
      {
        ...evaluatedAssignment,
        status: AssignmentStatus.Closed,
        submissionType: AssignmentSubmissionType.FileUpload,
      },
      allPermissions
    );

    expect(actions.canViewSubmissions).toBe(false);
    expect(actions.canClose).toBe(false);
  });

  it('does not expose submissions when evaluation is disabled', () => {
    const actions = getAssignmentActionVisibility(
      {
        ...evaluatedAssignment,
        status: AssignmentStatus.Published,
        submissionType: AssignmentSubmissionType.OnlineText,
        evaluationRequired: false,
        evaluationMethod: AssignmentEvaluationMethod.NoEvaluation,
      },
      allPermissions
    );

    expect(actions.canViewSubmissions).toBe(false);
  });

  it('never exposes submissions for no-submission assignments', () => {
    const actions = getAssignmentActionVisibility(
      {
        ...evaluatedAssignment,
        status: AssignmentStatus.Published,
        submissionType: AssignmentSubmissionType.NoSubmissionRequired,
      },
      allPermissions
    );

    expect(actions.canViewSubmissions).toBe(false);
  });
});
