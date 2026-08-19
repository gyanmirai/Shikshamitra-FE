import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export type RubricStudentRow = {
  id?: string;
  studentId?: string;
};

export type RubricEvaluationPanelProps = {
  mode: 'homework' | 'assignment';
  standardId: string;
  subjectId: string;
  taskId: string;
  taskTitle?: string;
  studentRow?: RubricStudentRow;
  ensureSubmissionId?: () => Promise<string | null>;
};

export type RubricEvaluationPanelRef = {
  save: () => Promise<boolean>;
};

export type CriterionEvaluationValue = {
  marks: string;
  comments: string;
};

export type CriterionEvaluationValues = Record<string, CriterionEvaluationValue>;

export type RubricCriterionScoringProps = {
  rubric: AssessmentRubricDto;
  values: CriterionEvaluationValues;
  onMarksChange: (criterionId: string, marks: string) => void;
  onCommentsChange: (criterionId: string, comments: string) => void;
};
