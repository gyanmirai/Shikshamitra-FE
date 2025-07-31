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

export interface IExamTime {
  id: number;
  subjectName: string;
  subjectColor: string;
  subjectCode?: string;
  examDate: string | Dayjs | null;
  startTime: string | Dayjs | null;
  endTime: string | Dayjs | null;
  totalMarks: string;
  passingMarks: string;
  notes?: string;
}
// Represents room data for a single division
export interface IDivisionRoomDetail {
  roomIds: string[];
  capacity: number;
}

// Represents room assignment for a subject with multiple divisions
export interface ISubjectRoomDetail {
  divisions: Record<string, IDivisionRoomDetail>; // key: division ID (string)
  copyPastSubject: string;
  examDate: string | Dayjs | null; // Exam date for the subject
}

// Represents the whole structure: key is subjectName (e.g. "Science", "Maths")
export type IRoomDetails = Record<string, ISubjectRoomDetail>;

export interface IExamFormValues {
  id?: string;
  selectedSubjects: string[];
  examType: string;
  examName: string;
  className: string;
  divisions: string[];
  subjects: IExamTime[];
  roomDetails?: IRoomDetails;
  description: string;
  status?: number;
  isRoomAssign?: boolean;
}

export interface IScheduledExamTableProps {
  isScheduleExamButton?: boolean;
  isAction?: boolean;
  openDialog?: boolean;
  setOpenDialog?: (value: boolean) => void;
  editData?: IExamFormValues | null;
  setEditData?: (value: IExamFormValues | null) => void;
  data: IExamFormValues[];
  onDelete: (data: IExamFormValues) => void;
  onViewTimetable: (data: IExamFormValues) => void;
}

export interface INewExamFormProps {
  onClose: () => void;
  editData?: IScheduledExam | null;
}
