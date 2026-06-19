export interface IStudentExamGradeEntry {
  id: string;
  rollNo: string;
  studentName: string;
  subject: string;
  subjectId?: string;
  obtainedMarks: number | null;
  marks: number | null;
  totalMarks: number;
  passingMarks?: number;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: number;
  workflowStatus?: number;
  attendanceStatus?: number;
  examType: string;
  examName: string;
  examId?: string;
  /** Subject component breakdown */
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  vivaMarks?: number | null;
  internalMarks?: number | null;
  projectMarks?: number | null;
  gradeScalingId?: string | null;
}

/** Exam summary panel data */
export interface IExamSummary {
  examName: string;
  subjectName: string;
  className: string;
  divisionName: string;
  maxMarks: number;
  passingMarks: number;
  examDate?: string;
  totalStudents: number;
  marksEntered: number;
  pending: number;
  workflowStatus: number;
}

/** Analytics KPI data derived from table rows */
export interface IExamAnalyticsStats {
  highestMarks: number;
  lowestMarks: number;
  averageMarks: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  failPercentage: number;
  pendingCount: number;
  totalCount: number;
}

/** Workflow flags returned by GET /api/academics/exams/marks */
export interface IExamMarksWorkflowFlags {
  workflowStatus: number;
  isDraft: boolean;
  isSubmitted: boolean;
  isVerified: boolean;
  isPublished: boolean;
  isMarksPublish: boolean;
}

/** Query parameters for the GET  */
export interface IExamMarksQueryParams {
  ExamId: string;
  SubjectId: string;
  DivisionId: string;
  StandardId: string;
}

/** Single student marks item returned by the API */
export interface IExamMarkItem {
  id: string;
  rollNo: string;
  studentName: string;
  subject?: string;
  subjectId?: string;
  marks: number | null;
  totalMarks: number;
  passingMarks?: number;
  grade: string;
  feedback: string;
  weightedAverage?: string;
  status: number;
  workflowStatus?: number;
  attendanceStatus?: number;
  examType?: string;
  examName?: string;
  examId?: string;
  gradeScalingId?: string | null;
}

/** Request body for PATCH */
export interface IUpdateStudentMarksRequest {
  marks?: number | null;
  totalMarks: number;
  feedback?: string;
  /** 0 = Present | 1 = Absent | 2 = MedicalLeave | 3 = Exempted */
  attendanceStatus: number;
}

/**
 * Props interface for AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
export interface IAssignGradeProps {
  data?: IStudentExamGradeEntry | null;
  onClose?: (e: any, isSubmit: boolean) => void;
}

export interface IGradeEntryTableProps {
  selectedStudents: string[];
  handleSelectStudent: (id: string) => void;
  actions: (props: any) => any;
  classId: string;
  divisionId: string;
  subjectId: string;
  examId: string;
  /** True when workflow is Locked – disables row-level mark editing */
  isLocked?: boolean;
  /** Called whenever the table data changes, with true if all students have status === 1 */
  onAllAssignedChange?: (allAssigned: boolean) => void;
  /** Called with computed analytics whenever table data changes */
  onStatsChange?: (stats: IExamAnalyticsStats) => void;
  /** Called whenever the API response arrives with the current workflow flags */
  onWorkflowFlagsChange?: (flags: IExamMarksWorkflowFlags) => void;
}
