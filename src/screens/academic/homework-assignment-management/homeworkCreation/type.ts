import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface IHomework {
  title: string;
  description: string;
  class: string;
  division: string[];
  subject: string;
  chapters: string[];
  homeworkType: string;
  submissionType: string;
  dueDate: Dayjs | null | string;
  attachments?: UploadedFile[];
  createdBy: string;
  status: number;
  isDailyTask: boolean;
  endDate: Dayjs | null | string;
  content?: string;
  submission?: string;
  isScheduled: boolean;
  scheduleDate: Dayjs | null | string;
  todaysDate: Dayjs | string;
}

export interface IStudentSubmissionsProps {
  selectedStudents?: TStudentGrade[];
  selectedHomework?: IHomework | null;
  handleBulkUpdate?: (data: TStudentGrade[]) => void;
  tableData?: TStudentGrade[];
  setTableData?: React.Dispatch<React.SetStateAction<TStudentGrade[]>>;
}

export interface IAssignGradeProps {
  isEdit?: boolean;
  data?: TStudentGrade | null;
  onClose: (e: any, isSubmit: boolean) => void;
}

/**
 * Props interface for the HomeworkCreationForm component
 * @interface HomeWorkCreationFormProps
 * @property {function} onsubmit - Callback function to handle form submission with homework values and status
 * @property {string} view - View mode of the form
 */
export interface IHomeWorkCreationFormProps {
  classes: string;
  division: string;
  subject: string;
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
  onViewSubmission: (row: IHomework) => void;
}

export interface TStudentGrade {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  marks: number;
  totalMarks: number;
  feedback: string;
  weightedAverage: string;
  status: string;
  submissionDate: Dayjs | null;
}
