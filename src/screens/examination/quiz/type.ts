export interface IQuizData {
  class: string;
  division: string[];
  subject: string;
  quizTitle: string;
  createdAt: string; // ISO Date string (e.g., "2024-12-01")
  quizDate: string; // ISO Date string (e.g., "2024-12-15")
  quizTime: string; // e.g., "10:00 AM"
  totalMarks: number;
  passingMarks: number;
  grade: string;
  id: string;
  marksStatus: number; // 0 = Pending, 1 = Completed
  status: number; // 0 = Pending, 1 = Completed
}
