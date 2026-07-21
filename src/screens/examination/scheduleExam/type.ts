import type { Dayjs } from 'dayjs';

export interface IScheduledExam {
  id: string;
  examId: string;
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

/**
 * Single source of truth for a subject across all steps.
 * Step 1 populates identity fields; Step 2 populates schedule fields.
 * Never duplicated into a separate array.
 */
export interface IExamSubject {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  subjectCode?: string;
  electiveGroupId?: string;
  /** For elective group entries: scheduling mode per-group (UI-only, not sent to backend) */
  schedulingMode?: 'combined' | 'separate';
  // Step 2 schedule fields — null until the user fills them
  examDate: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  totalMarks: number | '';
  passingMarks: number | '';
  notes: string;
  gradeScalingId?: string | null;
  /** For elective group entries: raw individual subjects from API (used in Separate mode) */
  subjects?: any[];
  assignedStudentCount?: number;
  isExamSelectionDisabled?: boolean;
}

/** Room details keyed by subjectId → divisionId */
export type IRoomDetails = Record<string, Record<string, IDivisionRoomDetail>>;

export interface IDivisionRoomDetail {
  roomIds: string[];
  capacity: number;
}

export interface IExamFormValues {
  examId: string;
  examType: string;
  examTypeName: string;
  examName: string;
  className: string;
  gradingScaleId?: string | null;
  divisions: string[];
  /** Single array for ALL steps — replaces the old selectedSubjects + subjects split */
  subjects: IExamSubject[];
  description: string;
  isRoomAssign: boolean;
  syncToAcademicCalendar: boolean;
  /** key: subjectId → divisionId → { roomIds, capacity } */
  roomDetails: IRoomDetails;
  status?: number;
}

// Legacy aliases kept for gradual migration — remove after all consumers are updated
/** @deprecated Use IExamSubject */
export type IExamTime = IExamSubject;
/** @deprecated Use IDivisionRoomDetail inside IRoomDetails */
export interface ISubjectRoomDetail {
  divisions: Record<string, IDivisionRoomDetail>;
  copyPastSubject: string;
  examDate: string | Dayjs | null;
}

export interface IScheduledExamTableProps {
  isScheduleExamButton?: boolean;
  isAction?: boolean;
  data?: IExamFormValues[];
  openDialog?: boolean;
  setOpenDialog?: (value: boolean) => void;
  editData?: IExamFormValues | null;
  setEditData?: (value: IExamFormValues | null) => void;
  onDelete: (data: IExamFormValues) => void;
  onViewTimetable: (data: IExamFormValues) => void;
  getExams: any;
  activeStatus?: number;
  onStatusChange?: (status: number) => void;
}

export interface INewExamFormProps {
  onClose: () => void;
  editData?: IScheduledExam | null;
}
