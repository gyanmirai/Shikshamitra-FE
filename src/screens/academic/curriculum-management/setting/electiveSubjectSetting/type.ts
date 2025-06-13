import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export type IElectiveSubject = {
  title: string;
  subjects: {
    name: string;
    subjectColor: string;
  }[];
  subjectColor: string;
  createdBy: string;
};

export interface IElectiveSubjectFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IElectiveSubject | null;
}

export interface IElectiveSubjectTableProps {
  data: IElectiveSubject[];
  onAddElective: { onTrue: () => void };
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: IElectiveSubject | null) => void;
  editData: IElectiveSubject | null;
  open: boolean;
  onDelete: (row: IElectiveSubject) => void;
  onEdit: (row: IElectiveSubject) => void;
}
