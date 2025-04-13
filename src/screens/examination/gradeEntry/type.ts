export interface IStudentExamGradeEntry {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: 'Assigned' | 'Pending'; // You can also use `string` if these values are dynamic
}

/**
 * Props interface for AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
export interface IAssignGradeProps {
  data?: IStudentExamGradeEntry | null;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

export interface IGradeEntryTableProps {
  data: IStudentExamGradeEntry[];
  selectedStudents: string[];
  handleSelectStudent: (id: string) => void;
  actions: (props: any) => any;
}
