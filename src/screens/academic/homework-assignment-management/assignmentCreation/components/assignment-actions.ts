import type { AssignmentV2Dto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

import {
  AssignmentStatus,
  isEvaluationEnabled,
  AssignmentSubmissionType,
} from 'src/enums/assignment';

export interface AssignmentActionVisibility {
  canEdit: boolean;
  canPublish: boolean;
  canClose: boolean;
  canViewSubmissions: boolean;
  canDelete: boolean;
}

export const getAssignmentActionVisibility = (
  assignment: Pick<
    AssignmentV2Dto,
    'status' | 'submissionType' | 'evaluationRequired' | 'evaluationMethod' | 'defaultEvaluationMethod'
  >,
  permissions: { canAdd: boolean; canView: boolean; canDelete: boolean }
): AssignmentActionVisibility => ({
  canEdit: permissions.canAdd && assignment.status === AssignmentStatus.Draft,
  canPublish: permissions.canAdd && assignment.status === AssignmentStatus.Draft,
  canClose: permissions.canAdd && assignment.status === AssignmentStatus.Published,
  canViewSubmissions:
    permissions.canView &&
    assignment.status === AssignmentStatus.Published &&
    assignment.submissionType !== AssignmentSubmissionType.NoSubmissionRequired &&
    isEvaluationEnabled(
      assignment.evaluationRequired,
      assignment.evaluationMethod ?? assignment.defaultEvaluationMethod
    ),
  canDelete: permissions.canDelete && assignment.status === AssignmentStatus.Draft,
});
