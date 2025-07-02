import type { Dayjs } from 'dayjs';

export interface IScheduledExam {
  id: string;
  class: string;
  subjectName: string;
  examType: string;
  examName: string;
  examDate: string | Dayjs | null;
  startTime: string | Dayjs | null;
  endTime: string | Dayjs | null;
  examDuration: string;
  totalMarks: string;
  status: number;
}

export interface ISubjectDetail {
  id: number;
  subjectName: string;
  subjectColor: string;
  subjectCode?: string;
  examDate: string | Dayjs | null;
  startTime: string | Dayjs | null;
  endTime: string | Dayjs | null;
  totalMarks: string;
  passingMarks: string;
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
