import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type {
  ISubjectAssignmentSubject,
  ISubjectAssignmentFormValues,
} from './subjectAssignmentForm/type';

export interface ISubject {
  id: number;
  subjectName: string;
  subjectCode: string;
  subjectColor?: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  documents?: File[];
  prerequisites: string;
  learningGoal: string;
  description: string;
  isSubjectOpen?: boolean;
}

export interface TeacherProfile {
  id?: string;
  fullName?: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  class?: string;
  status?: string;
  division?: string;
  dailyStatus?: string;
  email?: string;
  experience?: string;
  qualification?: string;
  subjects?: string[];
}

export interface ISubjectDetail {
  subjectAssignmentId?: string;
  id: string;
  classId: string;
  assignedId?: string; // New field
  subjectId: string; // Changed from subjectNo (number) to string ID based on schema
  subjectCode: string;
  // subjectColor?: string; // Moved to nested subject object
  subject?: {
    id: string;
    name: string;
    color: string;
    educationMediumId: string;
  };
  subjectName?: string; // Kept optional for backward compatibility or flat structures if any

  primaryTeacher: string;
  secondaryTeachers: string[] | null; // Renamed from secondaryTeacher
  documents?: (File | string)[];
  prerequisites: string;
  learningGoal: string;
  description: string;

  // Legacy fields that might still be used or need deprecation
  subjectNo?: number;
  secondaryTeacher?: string[] | null;
  isSubjectOpen?: boolean;
}

export interface ISubjectFormValues {
  id?: number | string;
  status: number;
  classId: string;
  className: string;
  subjectName: string;
  subjects?: ISubjectDetail[];
  subjectType: number;

  // New schema fields
  academicMediumId?: string;
  electiveGroupId?: string;
  electiveGroupName?: string;
}

export interface ISubjectTableProps {
  isLoading: boolean;
  classId: string;
  addSubjectDialog: UseBooleanReturn;
  editData: ISubjectFormValues | null;
  setEditData: React.Dispatch<React.SetStateAction<ISubjectFormValues | null>>;
  subjectTableData: ISubjectFormValues[];
  onView: (subject: ISubjectFormValues) => void;
  onEdit: (subject: ISubjectFormValues) => void;
  onDelete: (subject: ISubjectFormValues) => void;
  onToggleStatus: (subject: ISubjectFormValues) => void;
}

export interface ISubjectFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  data: ISubjectFormValues | null;
  isEdit: boolean;
  selectedClass: string;
  classId: string;
}

export interface IViewSubjectProps {
  subject: ISubjectFormValues | null;
}

export interface IDocument {
  id: string;
  name: string;
  url: string;
  file?: File;
  type?: string;
  size?: string;
}

// Available teachers for selection
export interface ITeacherOption {
  value: string;
  name: string;
  department: string;
  avatar: string;
}

export interface ISubjectCardProps {
  index: number | null; // add index to access nested Formik data
  formik: FormikProps<ISubjectAssignmentFormValues>;
  subject: ISubjectAssignmentSubject;
  isCore: boolean;
  isPublished: boolean;
  onFileUpload: (files: (File | string)[], index: number | null) => Promise<void>;
  // isPublishing: boolean;
  // teacherOptions: TeacherProfile[];
  onSubjectChange: (subjectId: string, field: string, value: any) => void;
}

export type IDocType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'image'
  | 'video'
  | 'audio'
  | 'zip'
  | 'csv'
  | 'txt'
  | string;
