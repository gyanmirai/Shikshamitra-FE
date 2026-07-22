import type {
  RubricStatus,
  RubricWorkType,
  RubricVisibility,
  AssessmentRubricDto,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export type RubricCriterionFormValue = {
  title: string;
  description: string;
  maxMarks: string;
  studentDescription: string;
  teacherGuidance: string;
  isRequired: boolean;
};

export type RubricPerformanceLevelFormValue = {
  level: string;
  label: string;
  score: string;
  description: string;
  studentLabel: string;
};

export type RubricConfigFormValues = {
  title: string;
  description: string;
  appliesToWorkType: '' | RubricWorkType;
  scoringModel: RubricScoringModel;
  visibility: RubricVisibility;
  evaluationInstructions: string;
  studentInstructions: string;
  tags: string;
  status: RubricStatus;
  performanceLevels: RubricPerformanceLevelFormValue[];
  criteria: RubricCriterionFormValue[];
};

export type RubricConfigFormProps = {
  editData: AssessmentRubricDto | null;
  onClose: (event: unknown, isSubmit?: boolean) => void;
};

export type RubricConfigTableProps = {
  data: Array<AssessmentRubricDto & { usageCount?: number }>;
  isLoading: boolean;
  canAdd: boolean;
  canDelete: boolean;
  onEdit: (row: AssessmentRubricDto) => void;
  onDuplicate: (row: AssessmentRubricDto) => void;
  onPreview: (row: AssessmentRubricDto) => void;
  onUsage: (row: AssessmentRubricDto) => void;
  onVersion: (row: AssessmentRubricDto) => void;
  onArchive: (row: AssessmentRubricDto) => void;
  onPublish: (row: AssessmentRubricDto) => void;
};
