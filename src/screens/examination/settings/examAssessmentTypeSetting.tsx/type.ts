export interface IExamType {
  id: string;
  examType: string;
  description?: string;
  category?: string;
  status: number | string;
  defaultTotalMarks?: number | string;
  defaultWeightage?: number | string;
  includedInResult: boolean;
  marksEntryRequired: boolean;
  gradeScaleRequired: boolean;
  allowPracticalOral: boolean;
  defaultGradeScaleId?: string | null;
  usageCount?: number;
}

export interface IExamTypeFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

export interface IAssessmentType {
  id: number;
  assessmentType: string;
  description: string;
  status: string;
}

export interface IAssessmentTypeFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}
