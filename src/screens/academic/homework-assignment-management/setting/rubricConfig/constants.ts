import {
  RubricStatus,
  RubricWorkType,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export const RUBRIC_STATUS_LABELS: Record<RubricStatus, string> = {
  [RubricStatus.Draft]: 'Draft',
  [RubricStatus.Published]: 'Published',
  [RubricStatus.Archived]: 'Archived',
  [RubricStatus.Superseded]: 'Superseded',
};

export const RUBRIC_WORK_TYPE_LABELS: Record<RubricWorkType, string> = {
  [RubricWorkType.Homework]: 'Homework',
  [RubricWorkType.Assignment]: 'Assignment',
  [RubricWorkType.Both]: 'Both',
};

export const RUBRIC_SCORING_MODEL_LABELS: Record<RubricScoringModel, string> = {
  [RubricScoringModel.PointsBased]: 'Points-Based',
  [RubricScoringModel.WeightedPercentage]: 'Weighted Percentage',
  [RubricScoringModel.PerformanceLevels]: 'Performance Levels',
  [RubricScoringModel.Checklist]: 'Checklist',
  [RubricScoringModel.RatingScale]: 'Rating Scale',
};

export const RUBRIC_VISIBILITY_LABELS: Record<RubricVisibility, string> = {
  [RubricVisibility.Private]: 'Private',
  [RubricVisibility.SelectedTeachers]: 'Selected Teachers',
  [RubricVisibility.Department]: 'Department',
  [RubricVisibility.Institution]: 'Institution',
};

export const RUBRIC_STATUS_OPTIONS = [
  { value: RubricStatus.Draft, label: RUBRIC_STATUS_LABELS[RubricStatus.Draft] },
  { value: RubricStatus.Published, label: RUBRIC_STATUS_LABELS[RubricStatus.Published] },
  { value: RubricStatus.Archived, label: RUBRIC_STATUS_LABELS[RubricStatus.Archived] },
  { value: RubricStatus.Superseded, label: RUBRIC_STATUS_LABELS[RubricStatus.Superseded] },
];

export const RUBRIC_WORK_TYPE_OPTIONS = [
  { value: RubricWorkType.Homework, label: RUBRIC_WORK_TYPE_LABELS[RubricWorkType.Homework] },
  {
    value: RubricWorkType.Assignment,
    label: RUBRIC_WORK_TYPE_LABELS[RubricWorkType.Assignment],
  },
  { value: RubricWorkType.Both, label: RUBRIC_WORK_TYPE_LABELS[RubricWorkType.Both] },
];

export const RUBRIC_SCORING_MODEL_OPTIONS = [
  {
    value: RubricScoringModel.PointsBased,
    label: RUBRIC_SCORING_MODEL_LABELS[RubricScoringModel.PointsBased],
  },
  {
    value: RubricScoringModel.WeightedPercentage,
    label: RUBRIC_SCORING_MODEL_LABELS[RubricScoringModel.WeightedPercentage],
  },
  {
    value: RubricScoringModel.PerformanceLevels,
    label: RUBRIC_SCORING_MODEL_LABELS[RubricScoringModel.PerformanceLevels],
  },
  {
    value: RubricScoringModel.Checklist,
    label: RUBRIC_SCORING_MODEL_LABELS[RubricScoringModel.Checklist],
  },
  {
    value: RubricScoringModel.RatingScale,
    label: RUBRIC_SCORING_MODEL_LABELS[RubricScoringModel.RatingScale],
  },
];

export const DEFAULT_PERFORMANCE_LEVELS = [
  { level: 4, label: 'Excellent', score: 4, description: '', studentLabel: 'Excellent' },
  { level: 3, label: 'Good', score: 3, description: '', studentLabel: 'Good' },
  { level: 2, label: 'Developing', score: 2, description: '', studentLabel: 'Developing' },
  {
    level: 1,
    label: 'Needs Improvement',
    score: 1,
    description: '',
    studentLabel: 'Needs Improvement',
  },
];

export const DEFAULT_RATING_LEVELS = [
  { level: 5, label: 'Excellent', score: 5, description: '', studentLabel: 'Excellent' },
  { level: 4, label: 'Very Good', score: 4, description: '', studentLabel: 'Very Good' },
  { level: 3, label: 'Good', score: 3, description: '', studentLabel: 'Good' },
  { level: 2, label: 'Fair', score: 2, description: '', studentLabel: 'Fair' },
  { level: 1, label: 'Needs Improvement', score: 1, description: '', studentLabel: 'Needs Improvement' },
];

export const CRITERION_BANK = [
  'Accuracy',
  'Completeness',
  'Creativity',
  'Presentation',
  'Communication',
  'Critical Thinking',
  'Collaboration',
  'Originality',
  'Timeliness',
  'Practical Application',
  'Research Quality',
  'Problem Solving',
];
