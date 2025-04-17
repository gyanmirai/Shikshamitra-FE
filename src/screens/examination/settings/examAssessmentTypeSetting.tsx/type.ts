export interface IExamType {
  id: number;
  examType: string;
  description: string;
  status: string;
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
