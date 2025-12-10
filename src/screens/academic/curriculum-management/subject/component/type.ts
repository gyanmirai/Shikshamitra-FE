import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

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
  name?: string;
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
  subjectNo: number;
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

export interface ISubjectFormValues {
  id?: number;
  status: number;
  classId: string;
  className: string;
  subjectName: string;
  subjects?: ISubjectDetail[];
  subjectType: number;
}

export interface ISubjectTableProps {
  addSubjectDialog: UseBooleanReturn;
  editData: ISubjectFormValues | null;
  setEditData: React.Dispatch<React.SetStateAction<ISubjectFormValues | null>>;
  data: ISubjectFormValues[];
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
  index: number; // add index to access nested Formik data
  formik: FormikProps<ISubjectFormValues>;
  subject: ISubjectDetail;
  isCore: boolean;
  isPublished: boolean;
  // isPublishing: boolean;
  teacherOptions: TeacherProfile[];
  onSubjectChange: (subjectId: string | number, field: string, value: any) => void;
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
