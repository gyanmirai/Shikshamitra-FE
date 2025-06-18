import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { TStudentGrade } from '../homeworkCreation/type';
import type { TeacherProfile } from '../../curriculum-management/subject/component/type';

export interface IAssignment {
  title: string;
  description: string;
  class: string;
  division: string[];
  subjects: string;
  submissionType: number;
  // dueDate: Dayjs | null | string;
  startDate: Dayjs | null | string;
  endDate: Dayjs | null | string;
  attachments: File[];
  createdBy: TeacherProfile;
  status: number;
  assignmentType: string;
  // isScheduled: boolean;
  // scheduleDate: Dayjs | null | string;
  // todaysDate: Dayjs | string;
  content?: string;
  rubric: File | string;
  submission?: string;
}

export interface IAssignmentFormProps {
  classes: string;
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IAssignment | null;
}

export interface IAssignmentTableProps {
  data: IAssignment[];
  dialog: UseBooleanReturn;
  onSwitchToggle: (row: IAssignment) => void;
  onEdit: (row: IAssignment) => void;
  onDelete: (row: IAssignment) => void;
  onView: (row: IAssignment) => void;
  onViewSubmission: (row: IAssignment) => void;
}

export interface IStudentSubmissionsProps {
  selectedStudents?: TStudentGrade[];
  selectedAssignment?: IAssignment | null;
  handleBulkUpdate?: (data: TStudentGrade[]) => void;
  tableData?: TStudentGrade[];
  setTableData?: React.Dispatch<React.SetStateAction<TStudentGrade[]>>;
}
