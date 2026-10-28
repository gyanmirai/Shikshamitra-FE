import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type {
  RubricStatus,
  RubricWorkType,
  RubricScoringModel,
  AssessmentRubricDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export type RubricCriterionFormValue = {
  id: string;
  title: string;
  description: string;
  points?: string;
  weight?: string;
  studentDescription: string;
  teacherGuidance: string;
  isRequired: boolean;
};

export type RubricPerformanceLevelFormValue = {
  id: string;
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
  onStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
};

export type RubricConfigTableProps = {
  serverProps?: Partial<ICustomizableTableProps>;
  data: Array<AssessmentRubricDto & { usageCount?: number }>;
  isLoading: boolean;
  isError?: boolean;
  hasMedium?: boolean;
  onRetry?: () => unknown;
  canAdd: boolean;
  canDelete: boolean;
  onEdit: (row: AssessmentRubricDto) => void;
  onDuplicate: (row: AssessmentRubricDto) => void;
  onPreview: (row: AssessmentRubricDto) => void;
  onUsage: (row: AssessmentRubricDto) => void;
  onArchive: (row: AssessmentRubricDto) => void;
  onPublish: (row: AssessmentRubricDto) => void;
};
