import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ISubject {
  id: number;
  subjectName: string;
  subjectCode: string;
  subjectColor?: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  documents?: IDocument[];
  prerequisites: string;
  learningGoal: string;
  description: string;
  isSubjectOpen?: boolean;
}

export interface ISubjectFormValues {
  id?: number;
  status?: string;
  className: string;
  subjectName: string;
  subjects?: ISubject[];
  subjectType?: string;
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
  onToggleStatus: (id: number, value: string) => void;
}

export interface ISubjectFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  data: ISubjectFormValues | null;
  isEdit: boolean;
}

export interface IViewSubjectProps {
  subject: ISubjectFormValues | null;
}

export interface IDocument {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface ISubjectCardProps {
  index: number; // add index to access nested Formik data
  formik: FormikProps<ISubjectFormValues>;
  subject: ISubject;
  isCore: boolean;
  isPublished: boolean;
  teacherOptions: { value: string; label: string }[];
  onSubjectChange: (subjectId: string | number, field: string, value: any) => void;
}
