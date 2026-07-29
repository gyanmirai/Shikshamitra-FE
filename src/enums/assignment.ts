export enum AssignmentSubmissionType {
  OnlineText = 0,
  FileUpload = 1,
  InPerson = 2,
  NoSubmissionRequired = 3,
}

export enum AssignmentEvaluationMethod {
  Marks = 0,
  Grade = 1,
  Rubric = 2,
  Checklist = 3,
  FeedbackOnly = 4,
  NoEvaluation = 5,
}

export enum AssignmentStatus {
  Draft = 0,
  Published = 1,
  Closed = 2,
}

export enum AssignmentTypeStatus {
  Active = 0,
  Inactive = 1,
}

export const ASSIGNMENT_SUBMISSION_TYPE_LABELS: Record<AssignmentSubmissionType, string> = {
  [AssignmentSubmissionType.OnlineText]: 'Online Text',
  [AssignmentSubmissionType.FileUpload]: 'File Upload',
  [AssignmentSubmissionType.InPerson]: 'In-Person',
  [AssignmentSubmissionType.NoSubmissionRequired]: 'No Submission Required',
};

export const ASSIGNMENT_EVALUATION_METHOD_LABELS: Record<AssignmentEvaluationMethod, string> = {
  [AssignmentEvaluationMethod.Marks]: 'Marks',
  [AssignmentEvaluationMethod.Grade]: 'Grade',
  [AssignmentEvaluationMethod.Rubric]: 'Rubric',
  [AssignmentEvaluationMethod.Checklist]: 'Checklist',
  [AssignmentEvaluationMethod.FeedbackOnly]: 'Feedback Only',
  [AssignmentEvaluationMethod.NoEvaluation]: 'No Evaluation',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.Draft]: 'Draft',
  [AssignmentStatus.Published]: 'Published',
  [AssignmentStatus.Closed]: 'Closed',
};

export const ASSIGNMENT_SUBMISSION_TYPE_OPTIONS = Object.entries(
  ASSIGNMENT_SUBMISSION_TYPE_LABELS
).map(([value, label]) => ({ value: Number(value) as AssignmentSubmissionType, label }));

export const ASSIGNMENT_EVALUATION_METHOD_OPTIONS = [
  AssignmentEvaluationMethod.Marks,
  AssignmentEvaluationMethod.Rubric,
  AssignmentEvaluationMethod.NoEvaluation,
].map((value) => ({ value, label: ASSIGNMENT_EVALUATION_METHOD_LABELS[value] }));

export const ASSIGNMENT_TYPE_EVALUATION_METHOD_OPTIONS =
  ASSIGNMENT_EVALUATION_METHOD_OPTIONS.filter(
    (option) => option.value !== AssignmentEvaluationMethod.NoEvaluation
  );

export const ASSIGNMENT_SUPPORTED_EVALUATION_METHODS =
  ASSIGNMENT_EVALUATION_METHOD_OPTIONS.map((option) => option.value);

export const isEvaluationEnabled = (
  evaluationRequired: boolean | null | undefined,
  evaluationMethod: AssignmentEvaluationMethod | null | undefined
) => evaluationRequired !== false && evaluationMethod !== AssignmentEvaluationMethod.NoEvaluation;

export const evaluationUsesMarks = (
  evaluationRequired: boolean | null | undefined,
  evaluationMethod: AssignmentEvaluationMethod | null | undefined
) =>
  isEvaluationEnabled(evaluationRequired, evaluationMethod) &&
  evaluationMethod === AssignmentEvaluationMethod.Marks;
