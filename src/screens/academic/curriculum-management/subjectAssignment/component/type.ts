import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type {
  ISubjectAssignmentSubject,
  ISubjectAssignmentFormValues,
} from './subjectAssignmentForm/type';

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

  primaryTeacher: { id: string; name: string }; // Changed to object for better data handling
  primaryTeacherId: string;
  secondaryTeachers: { id: string; name: string }[] | null; // Renamed from secondaryTeacher
  documents?: (File | string)[];
  prerequisites: string;
  learningGoals: string;
  description: string;

  // Legacy fields that might still be used or need deprecation
  subjectNo?: number;
  secondaryTeacher?: string[] | null;
  isSubjectOpen?: boolean;

  assignedSubjectId?: string; // New field to link with assigned subject for syllabus fetching
}

export interface ISubjectFormValues {
  id?: number | string;
  status: number;
  classId: string;
  className: string;
  subjectName: string;
  subjects?: ISubjectDetail[];
  subjectType: number;
  isAiSuggested?: boolean;
  isCopiedFromPreviousYear?: boolean;
  primaryTeacherName?: string;
  chaptersCount?: number;
  weeklyPeriods?: number;
  lastUpdatedAt?: string;
  setupHealthScore?: number;
  canDelete?: boolean;
  deleteDisabledReason?: string | null;

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
  totalCount: number;
  subjectTableData: ISubjectFormValues[];
  onView: (subject: ISubjectFormValues) => void;
  onEdit: (subject: ISubjectFormValues) => void;
  onDelete: (subject: ISubjectFormValues) => void;
  onArchive?: (subject: ISubjectFormValues) => void;
  onRestore?: (subject: ISubjectFormValues) => void;
  onToggleStatus: (subject: ISubjectFormValues) => void;
  query: {
    page: number;
    pageSize: number;
    teacherSearch: string;
  };
  setQuery: React.Dispatch<
    React.SetStateAction<{
      page: number;
      pageSize: number;
      teacherSearch: string;
    }>
  >;
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
  classId: string;
  classes: string;
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
  activeSubjectId: string | null;
  onAccordionToggle: (subjectId: string) => void;
  onRemove?: () => void;
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
