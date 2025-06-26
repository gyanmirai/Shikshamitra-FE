export interface IStudentExamGradeEntry {
  id: string;
  rollNo: string;
  studentName: string;
  subject: string;
  marks: number | null;
  totalMarks: number;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: number;
  examType: string;
  examName: string;
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
  data: IStudentExamGradeEntry[];
  selectedStudents: string[];
  handleSelectStudent: (id: string) => void;
  actions: (props: any) => any;
}
