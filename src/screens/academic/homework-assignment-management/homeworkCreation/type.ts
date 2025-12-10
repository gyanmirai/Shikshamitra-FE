import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { TeacherProfile } from '../../curriculum-management/subject/component/type';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface DivisionHomeworkMeta {
  divisionId: string; // ID or name of the division
  createdAt: Dayjs | null; // When the homework was assigned
  publishDate: Dayjs | null; // When the homework is published
  dueDate: Dayjs | null; // When the homework is due
  status: number; // 0 = Draft, 1 = Published
}

export interface IHomework {
  title: string;
  description: string;
  class: string; // class ID or name
  subject: string; // subject ID or name
  chapter: string; // list of chapter IDs or names
  homeworkType: string;
  submissionType: number; // 0 = Offline, 1 = Online
  attachments?: File[]; // optional file uploads
  content?: string | null;
  submission?: string | null;
  createdBy: TeacherProfile; // includes name, email, avatar, etc.
  divisions: DivisionHomeworkMeta[]; // ✅ Each division with its own dates
  divisionMeta?: DivisionHomeworkMeta;
}

export interface IHomeworkDetail {
  title: string;
  description: string;
  class: string; // class ID or name
  subject: string; // subject ID or name
  chapter: string; // list of chapter IDs or names
  homeworkType: string;
  submissionType: number; // 0 = Offline, 1 = Online
  attachments?: File; // optional file uploads
  content?: string | null;
  submission?: string | null;
  createdBy: TeacherProfile; // includes name, email, avatar, etc.
  divisionMeta: DivisionHomeworkMeta;
}

export interface IStudentSubmissionsProps {
  selectedStudents?: TStudentGrade[];
  selectedHomework?: any | null;
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
  subject: string;
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IHomework | null;
}

export interface IHomeworkTableProps {
  homeworkData: any[]; // ideally use proper type like IHomeworkAssignment[]
  setOpen: (open: boolean) => void;
  dialog: UseBooleanReturn;
  handleSwitchChange: (row: IHomework) => void;
  onViewDetails: (row: IHomework) => void;
  onEditDetails: (row: IHomework) => void;
  onDeleteDetails: (row: IHomework) => void;
  onViewSubmission: (row: IHomeworkDetail) => void;
  selectedDivision: string;
}

export interface TStudentGrade {
  id: string;
  studentName: string;
  rollNumber: string;
  assignments: string;
  subject: string;
  marks: number;
  totalMarks: number;
  feedback: string;
  weightedAverage: string;
  status: string;
  submissionDate: Dayjs | null;
  submissionType?: string;
}
