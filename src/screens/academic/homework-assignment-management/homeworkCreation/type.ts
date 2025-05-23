import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { TStudentGrade } from '../../gradebook-performance-tracking/gradebook/gradebook';

export interface IHomework {
  title: string;
  description: string;
  class: string;
  division: string[];
  subjects: string[];
  chapters: string[];
  homeworkType: string;
  submissionType: string;
  dueDate: Dayjs | null | string;
  attachments: File[];
  createdBy: string;
  status: string;
  isDailyTask: boolean;
  dayOfSubmission: string;
  endDate: Dayjs | null | string;

  isScheduled: boolean;
  scheduleDate: Dayjs | null | string;
  todaysDate: Dayjs | string;
}

export interface IStudentSubmissionsProps {
  selectedStudents?: TStudentGrade[];
  handleBulkUpdate?: (data: TStudentGrade[]) => void;
  tableData?: TStudentGrade[];
  setTableData?: React.Dispatch<React.SetStateAction<TStudentGrade[]>>;
}

export interface IAssignGradeProps {
  data?: TStudentGrade | null;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

/**
 * Props interface for the HomeworkCreationForm component
 * @interface HomeWorkCreationFormProps
 * @property {function} onsubmit - Callback function to handle form submission with homework values and status
 * @property {string} view - View mode of the form
 */
export interface IHomeWorkCreationFormProps {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IHomework | null;
}

export interface IHomeworkTableProps {
  filteredData: any[]; // ideally use proper type like IHomeworkAssignment[]
  setOpen: (open: boolean) => void;
  dialog: UseBooleanReturn;
  handleSwitchChange: (row: IHomework) => void;
  onViewDetails: (row: IHomework) => void;
  onEditDetails: (row: IHomework) => void;
  onDeleteDetails: (row: IHomework) => void;
}
