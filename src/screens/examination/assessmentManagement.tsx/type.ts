import type { Dayjs } from 'dayjs';

export interface IAssesmentFormikValues {
  className: string;
  division: string;
  subject: string;
  assessmentTitle: string;
  assessmentType: string;
  examName: string;
  assignmentName: string;
  createDate: Dayjs | null;
  dueDate: Dayjs | null;
  publish: boolean;
  status: string;
}

export interface IAssessment {
  id: string;
  className: string;
  division: string;
  subject: string;
  assessmentType: string;
  assessmentTitle: string;
  examName?: string;
  assignmentName?: string;
  createDate: Dayjs | null | String;
  dueDate: Dayjs | null | String;
  publish: boolean;
  status: string;
}

/**
 * Props interface for AddNewAssessment component
 * @param {Function} onSubmit - Callback function to handle form submission with assessment values
 * @param {IAssessment\ | null} data - Assessment data for editing or null for new assessment
 * @param {boolean} isEdit - Flag indicating if the form is in edit mode
 */
export interface AddNewAssessmentProps {
  onSubmit: (values: IAssessment) => void;
  data: IAssessment | null;
  isEdit: boolean;
}

/**
 * Props interface for AssignGrade component
 * @param {boolean} isBulk - Flag to indicate if grading is for multiple students
 * @param {any} data - Optional data containing student grade and feedback information
 * @param {Function} onSubmit - Callback function when grade form is submitted with grade and feedback values
 */
export interface AssignGradeProps {
  isBulk: boolean;
  data?: any;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

/**
 * Interface representing a student's grade information
 * @property {string} id - Unique identifier for the grade record
 * @property {string} studentName - Name of the student
 * @property {string} assignments - Name of the assignment
 * @property {string} subject - Subject or course name
 * @property {string} grade - Student's grade for the assignment
 * @property {string} feedback - Teacher's feedback on the assignment
 * @property {string} weightedAverage - Calculated weighted average score
 * @property {string} status - Current status of the grade (e.g., Pending, Completed)
 */
export interface IStudentGrade {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: string;
}

export interface IAssessmentManagementTableProps {
  actions: (props: any) => React.ReactNode;
  data: IAssessment[];
  onEdit: (assessment: IAssessment) => void;
  onDelete: (assessment: IAssessment) => void;
  onTogglePublish: (id: string, value: boolean) => void;
}
