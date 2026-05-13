export interface IStudentExamGradeEntry {
  id: string;
  rollNo: string;
  studentName: string;
  subject: string;
  subjectId?: string;
  obtainedMarks: number | null;
  marks: number | null;
  totalMarks: number;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: number;
  examType: string;
  examName: string;
  examId?: string;
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
  grade: string;
  feedback: string;
  weightedAverage?: string;
  status: number;
  examType?: string;
  examName?: string;
  examId?: string;
}

/** Request body for PATCH */
export interface IUpdateStudentMarksRequest {
  marks: number;
  totalMarks: number;
  feedback?: string;
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
  /** Called whenever the table data changes, with true if all students have status === 1 */
  onAllAssignedChange?: (allAssigned: boolean) => void;
}
