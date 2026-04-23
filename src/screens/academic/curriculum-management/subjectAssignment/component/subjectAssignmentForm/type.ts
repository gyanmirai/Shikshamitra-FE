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
  documents: (File | string)[];

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
  selectedSubjects?: any[]; // For the autocomplete selected values
}

export interface ISubjectAssignmentFormProps {
  onClose: (data: any, isSuccess: boolean) => void;
  data?: any;
  isEdit?: boolean;
  selectedClass: string;
  classId: string;
  subjectTableData: any[];
}

// export interface ISubjectCardProps {
//   formik: any;
//   subject: ISubjectAssignmentSubject;
//   isCore: boolean;
//   isPublished: boolean;
//   onSubjectChange: (subjectId: string, field: string, value: any) => void;
//   index: number;
//   onFileUpload: (files: (File | string)[], index: number) => Promise<void>;
// }
