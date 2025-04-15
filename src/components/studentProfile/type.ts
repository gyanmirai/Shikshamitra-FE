export interface ISubject {
  id: number;
  subjectName: string;
  progress: number;
}

export interface ISubjectCardProps {
  selectedSubject: ISubject | null;
  subjectId: number;
  subjectName: string;
  progress: number;
}
