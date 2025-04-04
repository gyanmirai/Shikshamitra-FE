export interface TStudentExamGradeEntry {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: 'Assigned' | 'Pending'; // You can also use `string` if these values are dynamic
}
