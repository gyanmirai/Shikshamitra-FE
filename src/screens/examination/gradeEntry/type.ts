export interface IStudentExamGradeEntry {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: number;
}

/**
 * Props interface for AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
export interface IAssignGradeProps {
  data?: IStudentExamGradeEntry | null;
}

export interface IGradeEntryTableProps {
  data: IStudentExamGradeEntry[];
  selectedStudents: string[];
  handleSelectStudent: (id: string) => void;
  actions: (props: any) => any;
}
