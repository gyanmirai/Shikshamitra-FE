import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export type IElectiveSubject = {
  id: string;
  name: string;
  groupType?: string;
  description?: string;
  subjects: {
    id: string;
    name: string;
    color?: string;
    subjectColor?: string;
    status?: string | number;
  }[];
  subjectIds: string[];
  color: string;
  status?: 'Active' | 'Inactive' | 'Archived' | number;
  sortOrder?: number | null;
  usedInClassesCount?: number;
  studentSelectionsCount?: number;
  timetablePeriodsCount?: number;
  examSchedulesCount?: number;
  isUsed?: boolean;
  canModifySubjects?: boolean;
  canDelete?: boolean;
  lastUpdatedAt?: string;
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
  onArchive: (row: IElectiveSubject) => void;
  onRestore: (row: IElectiveSubject) => void;
  onViewUsage: (row: IElectiveSubject) => void;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}
