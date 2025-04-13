import type { Dayjs } from 'dayjs';

export interface IScheduledExam {
  id: number;
  class: string;
  subjectName: string;
  examType: string;
  examName: string;
  examDate: string;
  examTime: string;
  examDuration: string;
  totalMarks: number;
  status: string;
}

export interface ISubjectDetail {
  id: number;
  subjectName: string;
  examDate: Dayjs | null;
  examTime: Dayjs | null;
  examDuration: Dayjs | null;
  totalMarks: number;
  passingMarks: number;
  invigilationTeacher: string;
  teacher: string;
}

export interface IExamFormValues {
  examType: string;
  examName: string;
  className: string;
  divisions: string[];
  subjects: ISubjectDetail[];
  description: string;
}

export interface IScheduledExamTableProps {
  data: IScheduledExam[];
}

export interface INewExamFormProps {
  onClose: () => void;
  editData?: IScheduledExam | null;
}
