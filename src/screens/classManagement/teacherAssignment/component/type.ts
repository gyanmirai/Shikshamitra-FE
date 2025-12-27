export interface ITeacher {
  id: number;
  subject: string;
  className: string;
  assignedTeacher: string[];
}

/**
 * Props interface for TeacherReassign component
 * @param selectedTeacher - The currently selected teacher data or null
 * @param onSubmit - Callback function to handle form submission
 */
export interface ITeacherReassignProps {
  selectedTeacher: ITeacher | null;
  onSubmit: (values: any) => void;
}
