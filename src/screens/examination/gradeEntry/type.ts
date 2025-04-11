export interface TStudentExamGradeEntry {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: string; // You can also use `string` if these values are dynamic
}

/**
 * Props interface for AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
export interface AssignGradeProps {
  data?: TStudentExamGradeEntry | null;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}
