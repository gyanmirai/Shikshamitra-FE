import type { Dayjs } from 'dayjs';

export interface TSubjectDetail {
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

export interface TExamFormValues {
  examType: string;
  examName: string;
  className: string;
  divisions: string[];
  subjects: TSubjectDetail[];
  description: string;
}
