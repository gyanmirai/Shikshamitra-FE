import type { Dayjs } from 'dayjs';

export interface ISubjectFormValues {
  subjectCode: string;
  subjectName: string;
  scheduleDate: Dayjs | null;
  className: string;
  primaryTeacher: string;
  secondaryTeacher: string[];
  learningGoal: string;
  prerequisites: string;
  description: string;
  subjectColor: string;
  status: string;
}
