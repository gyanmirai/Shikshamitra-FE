import type { Dayjs } from 'dayjs';
import type { FileData } from 'src/components/custom-upload';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { AssignmentV2Dto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';
import type {
  AssignmentStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

import type { TStudentGrade, DivisionHomeworkMeta } from '../homeworkCreation/type';
import type { TeacherProfile } from '../../curriculum-management/subjectAssignment/component/type';

export interface IAssignment extends Omit<
  AssignmentV2Dto,
  'attachment' | 'createdBy' | 'divisionSchedules'
> {
  className?: string;
  classId?: string;
  divisions?: DivisionHomeworkMeta[];
  divisionSchedules: AssignmentV2Dto['divisionSchedules'];
  divisionMeta?: DivisionHomeworkMeta;
  students?: string[];
  assignmentsType?: string;
  attachments?: File[];
  startDate?: Dayjs | null | string;
  endDate?: Dayjs | null | string;
  createdBy: TeacherProfile | string;
  attachment?: string | FileData | null;
  submissionType: AssignmentSubmissionType;
  evaluationRequired: boolean;
  evaluationMethod?: AssignmentEvaluationMethod | null;
  defaultEvaluationMethod?: AssignmentEvaluationMethod | null;
  status: AssignmentStatus;
  content?: string;
  submission?: string;
}

export interface IAssignmentFormProps {
  classes: string;
  dialog: UseBooleanReturn;
  onClose: (event: unknown, isSubmit: boolean) => void;
  editData: IAssignment | null;
}

export interface IAssignmentTableProps {
  assignmentData: IAssignment[];
  isLoading?: boolean;
  selectedDivision: string;
  selectedClass: string;
  dialog: UseBooleanReturn;
  onSwitchToggle: (row: IAssignment) => void;
  onClose: (row: IAssignment) => void;
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
  activeFilter?: string;
  selectedStudents?: TStudentGrade[];
  selectedAssignment?: IAssignment | null;
  handleBulkUpdate?: (data: TStudentGrade[]) => void;
  tableData?: TStudentGrade[];
  setTableData?: React.Dispatch<React.SetStateAction<TStudentGrade[]>>;
}
