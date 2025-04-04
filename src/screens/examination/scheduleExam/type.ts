export interface TSubjectDetail {
  subjectName: string;
  examDate: Date | null;
  examTime: string | null;
  examDuration: string | null;
  totalMarks: number;
  passingMarks: number;
  invigilationTeacher: string;
  teacher: string;
}

export interface TExamFormValues {
  examType: string;
  examName: string;
  className: string;
  divisions: string[];
  subjects: TSubjectDetail[];
  description: string;
}
