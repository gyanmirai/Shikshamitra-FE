import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ISubject {
  id: string;
  name: string;
  color: string;
  createdBy: string;
}

export interface ISubjectFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: ISubject | null;
}

export interface ISubjectTableProps {
  onAddSubject: UseBooleanReturn;
  editData?: ISubject | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: ISubject | null) => void;
  onDelete: (data: ISubject) => void;
  onEdit: (data: ISubject) => void;
}
