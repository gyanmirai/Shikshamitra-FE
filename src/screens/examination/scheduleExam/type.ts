import type { Dayjs } from 'dayjs';

export interface IScheduledExam {
  id: string;
  class: string;
  subjectName: string;
  examType: string;
  examName: string;
  examStartDateTime: string;
  examEndDateTime: string;
  examDuration: string;
  totalMarks: number;
  status: number;
}

export interface ISubjectDetail {
  id: number;
  subjectName: string;
  examStartDateTime: Dayjs | null | string;
  examEndDateTime: Dayjs | null | string;
  totalMarks: number;
  passingMarks: number;
  rubric: File[];
}

export interface IExamFormValues {
  id?: string;
  examType: string;
  examName: string;
  className: string;
  divisions: string[];
  subjects: ISubjectDetail[];
  description: string;
  status?: number;
}

export interface IScheduledExamTableProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  editData?: IExamFormValues | null;
  setEditData: (value: IExamFormValues | null) => void;
  data: IExamFormValues[];
  onDelete: (data: IExamFormValues) => void;
  onViewTimetable: (data: IExamFormValues) => void;
}

export interface INewExamFormProps {
  onClose: () => void;
  editData?: IScheduledExam | null;
}
