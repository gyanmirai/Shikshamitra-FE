import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { TStudentGrade, DivisionHomeworkMeta } from '../homeworkCreation/type';
import type { TeacherProfile } from '../../curriculum-management/subjectAssignment/component/type';

export interface IAssignment {
  id: string;
  title: string;
  description: string;
  className: string;
  classId: string;
  divisions: DivisionHomeworkMeta[]; // ✅ Each division with its own dates
  divisionMeta?: DivisionHomeworkMeta;
  students?: [];
  subjectName: string;
  subjectId: string;
  submissionType: number;
  totalMarks?: number;
  // dueDate: Dayjs | null | string;
  startDate: Dayjs | null | string;
  endDate: Dayjs | null | string;
  attachments: File[];
  createdBy: TeacherProfile;
  assignmentTypeId: string;
  assignmentsType: string;
  chapterIds?: string[];

  // isScheduled: boolean;
  // scheduleDate: Dayjs | null | string;
  // todaysDate: Dayjs | string;
  content?: string;
  submission?: string;
  status?: number;
}

export interface IAssignmentFormProps {
  classes: string;
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IAssignment | null;
}

export interface IAssignmentTableProps {
  assignmentData: IAssignment[];
  isLoading?: boolean;
  selectedDivision: string;
  selectedClass: string;
  dialog: UseBooleanReturn;
  onSwitchToggle: (row: IAssignment) => void;
  onEdit: (row: IAssignment) => void;
  onDelete: (row: IAssignment) => void;
  onView: (row: IAssignment) => void;
  onViewSubmission: (row: IAssignment) => void;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}

export interface IStudentSubmissionsProps {
  selectedClass: string;
  selectedDivision: string;
  selectedSubject: string;
  selectedStudents?: TStudentGrade[];
  selectedAssignment?: IAssignment | null;
  handleBulkUpdate?: (data: TStudentGrade[]) => void;
  tableData?: TStudentGrade[];
  setTableData?: React.Dispatch<React.SetStateAction<TStudentGrade[]>>;
}
