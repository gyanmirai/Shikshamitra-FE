import type { Dayjs } from 'dayjs';

export interface IAssesmentFormikValues {
  className: string;
  division: string;
  subject: string;
  assesmentTitle: string;
  assessmentType: string;
  examName: string;
  assignmentName: string;
  createDate: Dayjs | null;
  dueDate: Dayjs | null;
  publish: boolean;
  status: string;
}
