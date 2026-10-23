export interface IGradeFormProps {
  onSubmit: (values: any) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  data: IGrade | null;
  viewOnly?: boolean;
  onStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
}

export interface IGradingScale {
  minMarks: number | string;
  maxMarks: number | string;
  grade: string;
  gradePoint?: number | string;
  remark?: string;
  resultStatus?: number | string;
}

export interface IGrade {
  usageCount: any;
  id: string;
  name: string;
  totalMarks: number | string;
  passMarks?: number | string;
  description?: string;
  isDefault?: boolean;
  status?: number | string;
  gradingScale: IGradingScale[] | null;
}
