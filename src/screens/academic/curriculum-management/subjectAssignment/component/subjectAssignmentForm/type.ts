export interface ISubjectAssignmentSubject {
  subjectId: string;
  subjectType: number; // 0: Core, 1: Elective
  electiveGroupId?: string;
  subjectName: string;
  subjectCode: string;

  // Internal usage for SubjectCard compatibility
  primaryTeacher: string;
  secondaryTeacher: string[];

  learningGoal: string;
  prerequisites: string;
  description: string;
  documents: File[];

  // UI specific fields
  subjectColor?: string;
  isSubjectOpen?: boolean;
  subjectNo?: string;
}

export interface ISubjectAssignmentFormValues {
  classId: string;
  status: number;
  subjects: ISubjectAssignmentSubject[];

  // UI specific fields
  className?: string;
  subjectName?: string; // For the autocomplete display
  subjectType?: number; // For the top-level toggle/chips
}

export interface ISubjectAssignmentFormProps {
  onClose: (data: any, isSuccess: boolean) => void;
  data?: any;
  isEdit?: boolean;
  selectedClass: string;
  classId: string;
}
