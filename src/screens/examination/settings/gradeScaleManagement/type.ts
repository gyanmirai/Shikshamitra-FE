export interface IGradeFormProps {
  onSubmit: (values: any) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  data: IGrade | null;
  viewOnly?: boolean;
}

export interface IGradingScale {
  minMarks: number;
  maxMarks: number;
  grade: string;
}

export interface IGrade {
  id: number;
  name: string;
  totalMarks: number;
  gradingScale: IGradingScale[] | null;
}
