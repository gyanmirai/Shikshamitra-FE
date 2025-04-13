export interface IExamType {
  id: number;
  examType: string;
  description: string;
  status: string;
}

export interface IExamTypeFormProps {
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
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}
