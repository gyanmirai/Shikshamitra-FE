import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ISubject {
  id: number;
  subjectName: string;
  subjectCode: string;
  scheduleDate: Dayjs | string | null;
  className: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  documents?: IDocument[];
  prerequisites: string;
  learningGoal: string;
  subjectColor: string;
  description: string;
  status: string;
}

export interface ISubjectFormValues {
  subjectCode: string;
  subjectName: string;
  scheduleDate: Dayjs | string | null;
  className: string;
  primaryTeacher: string;
  secondaryTeacher: string[];
  learningGoal: string;
  prerequisites: string;
  description: string;
  subjectColor: string;
  status: string;
}

export interface ISubjectTableProps {
  addSubjectDialog: UseBooleanReturn;
  editData: ISubject | null;
  setEditData: React.Dispatch<React.SetStateAction<ISubject | null>>;
  data: ISubject[];
  subjectTableData: ISubject[];
  onView: (subject: ISubject) => void;
  onEdit: (subject: ISubject) => void;
  onDelete: (subject: ISubject) => void;
  onToggleStatus: (id: number, value: string) => void;
}

export interface ISubjectFormProps {
  onSubmit: (values: ISubject) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  data: ISubject | null;
  isEdit: boolean;
}

export interface IViewSubjectProps {
  subject: ISubject | null;
}

export interface IDocument {
  id: string;
  name: string;
  url: string;
  file?: File;
}
