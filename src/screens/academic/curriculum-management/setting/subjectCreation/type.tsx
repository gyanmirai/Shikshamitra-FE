import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ISubject {
  subjectName: string;
  subjectColor: string;
  createdBy: string;
}

export interface ISubjectFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: ISubject | null;
}

export interface ISubjectTableProps {
  data: ISubject[];
  onAddSubject: UseBooleanReturn;
  editData?: ISubject | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: ISubject | null) => void;
  onDelete: (data: ISubject) => void;
  onEdit: (data: ISubject) => void;
}
